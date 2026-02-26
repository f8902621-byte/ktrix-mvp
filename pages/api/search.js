// ============================================
// KTRIX - API SEARCH V5 (Vercel Compatible)
// Version V5 — Chotot + Alonhadat + Market Stats
// *** CORRIGÉ — Fix filtre Alonhadat 59→2 ***
// ============================================

// import { computeKOS } from '../../lib/Scoring.js';

console.log("=== EXECUTING /pages/api/search.js ===");

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// ============================================
// SUPABASE - STOCKAGE DES ANNONCES
// ============================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// ============================================
// RÉCUPÉRER LES STATS ARCHIVE PAR DISTRICT
// ============================================
async function getArchiveStatsByDistrict(city, propertyType) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('Archive stats: Supabase non configuré');
    return {};
  }

  try {
    let url = `${SUPABASE_URL}/rest/v1/archive?select=district,price,area,price_per_m2,city,created_at`;
    
    if (city) {
      const cityNormalized = removeVietnameseAccents(city).toLowerCase();
      url += `&city=ilike.*${encodeURIComponent(cityNormalized)}*`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      console.log(`Archive stats: HTTP ${response.status}`);
      return {};
    }

    const archiveData = await response.json();
    console.log(`Archive: ${archiveData.length} annonces récupérées (90 derniers jours)`);

    const districtArchive = {};
    
    for (const item of archiveData) {
      const district = (item.district || '').toLowerCase().trim();
      if (!district) continue;

      const price = item.price || 0;
      const area = item.area || 0;
      
      if (price > 0 && area > 0) {
        if (!districtArchive[district]) {
          districtArchive[district] = {
            count: 0,
            pricesPerM2: [],
            totalPrice: 0
          };
        }
        
        const pricePerM2 = item.price_per_m2 || (price / area);
        districtArchive[district].pricesPerM2.push(pricePerM2);
        districtArchive[district].totalPrice += price;
        districtArchive[district].count++;
      }
    }

    const archiveStats = {};
    for (const [district, data] of Object.entries(districtArchive)) {
      if (data.count >= 3) {
        const avgPricePerM2 = data.pricesPerM2.reduce((a, b) => a + b, 0) / data.count;
        archiveStats[district] = {
          count: data.count,
          avgPricePerM2: Math.round(avgPricePerM2)
        };
      }
    }

    console.log(`Archive stats calculées: ${Object.keys(archiveStats).length} districts`);
    return archiveStats;

  } catch (error) {
    console.error('Archive stats error:', error.message);
    return {};
  }
}

// ============================================
// COMPTER TOUTES LES ANNONCES ARCHIVE PAR DISTRICT
// ============================================
async function getTotalArchiveByDistrict(city) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {};
  }

  try {
    let url = `${SUPABASE_URL}/rest/v1/archive?select=district`;
    
    if (city) {
      const cityNormalized = removeVietnameseAccents(city).toLowerCase();
      url += `&city=ilike.*${encodeURIComponent(cityNormalized)}*`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) return {};

    const data = await response.json();
    
    const counts = {};
    for (const item of data) {
      const district = (item.district || '').toLowerCase().trim();
      if (district) {
        counts[district] = (counts[district] || 0) + 1;
      }
    }

    console.log(`Archive total: ${data.length} annonces, ${Object.keys(counts).length} districts`);
    return counts;

  } catch (error) {
    console.error('Archive total error:', error.message);
    return {};
  }
}

async function saveListingsToSupabase(listings) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || listings.length === 0) {
    return [];
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const records = listings.map(item => ({
      id: item.id,
      source: item.source === 'chotot' ? 'chotot.com' 
      : item.source === 'alonhadat' ? 'alonhadat.com.vn'
      : item.source || 'unknown',
      title: item.title || '',
      price: item.price || 0,
      area: item.floorArea || item.area || 0,
      price_per_m2: item.pricePerSqm || 0,
      district: item.district || '',
      ward: item.ward || '',
      city: item.city || '',
      property_type: item.propertyType || '',
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      floors: item.floors || null,
      street_width: item.streetWidth || null,
      facade_width: item.facadeWidth || null,
      legal_status: item.legalStatus || null,
      direction: item.direction || null,
      furnishing: item.furnishing || null,
      url: item.url || '',
      thumbnail: item.imageUrl || '',
      last_seen: today,
      negotiation_score: item.score || 0,
      updated_at: new Date().toISOString()
    }));
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(records)
    });
    
    if (response.ok) {
      console.log(`Supabase: ${records.length} annonces sauvegardées`);
    } else {
      const error = await response.text();
      console.error('Supabase error:', error);
    }
    
    return [];
  } catch (error) {
    console.error('Supabase save error:', error.message);
    return [];
  }
}

// ============================================
// MAPPING DES VILLES → CODE RÉGION CHOTOT
// ============================================
const CHOTOT_REGIONS = {
  'ho chi minh': '13000',
  'ha noi': '12000',
  'da nang': '3017',
  'binh duong': '2011',
  'khanh hoa': '7044',
  'nha trang': '7044',
  'can tho': '5027',
  'hai phong': '4019',
  'ba ria': '2010',
  'vung tau': '2010',
  'ba ria vung tau': '2010',
  'quy nhon': '7043',
  'binh dinh': '7043',
  'lam dong': '9057',
  'da lat': '9057',
  'dalat': '9057',
};

// ============================================
// MAPPING DISTRICTS → CODE CHOTOT
// ============================================
const CHOTOT_DISTRICTS = {
  // Hồ Chí Minh (13000)
  '13000': {
    'quan 1': '13001', '1': '13001',
    'quan 2': '13119', '2': '13119',
    'quan 3': '13003', '3': '13003',
    'quan 4': '13004', '4': '13004',
    'quan 5': '13005', '5': '13005',
    'quan 6': '13006', '6': '13006',
    'quan 7': '13007', '7': '13007',
    'quan 8': '13008', '8': '13008',
    'quan 9': '13119', '9': '13119',
    'quan 10': '13010', '10': '13010',
    'quan 11': '13011', '11': '13011',
    'quan 12': '13012', '12': '13012',
    'binh tan': '13013',
    'binh thanh': '13014',
    'go vap': '13015',
    'phu nhuan': '13016',
    'tan binh': '13017',
    'tan phu': '13018',
    'thu duc': '13119', 'thanh pho thu duc': '13119', 'tp thu duc': '13119', 'tp. thu duc': '13119',
    'binh chanh': '13020', 'huyen binh chanh': '13020',
    'can gio': '13021', 'huyen can gio': '13021',
    'cu chi': '13022', 'huyen cu chi': '13022',
    'hoc mon': '13023', 'huyen hoc mon': '13023',
    'nha be': '13024', 'huyen nha be': '13024',
  },
  // Hà Nội (12000)
  '12000': {
    'ba dinh': '12001',
    'hoan kiem': '12002',
    'hai ba trung': '12003',
    'dong da': '12004',
    'cau giay': '12005',
    'thanh xuan': '12006',
    'hoang mai': '12007',
    'long bien': '12008',
    'nam tu liem': '12009',
    'bac tu liem': '12010',
    'tay ho': '12011',
    'ha dong': '12012',
  },
};

function getChototDistrictCode(regionCode, district) {
  if (!district || !CHOTOT_DISTRICTS[regionCode]) return null;
  
  const d = removeVietnameseAccents(district.toLowerCase())
    .replace(/^(quan|huyen|thanh pho|tp\.?|tx\.?|q\.?)\s*/i, '')
    .trim();
  
  const districtMap = CHOTOT_DISTRICTS[regionCode];
  
  if (districtMap[d]) return districtMap[d];
  
  for (const [key, code] of Object.entries(districtMap)) {
    if (d.includes(key) || key.includes(d)) {
      return code;
    }
  }
  
  return null;
}

// ============================================
// MAPPING DES VILLES ALONHADAT
// ============================================
const ALONHADAT_CITY_MAPPING = {
  'ho chi minh': 'ho-chi-minh',
  'ha noi': 'ha-noi',
  'da nang': 'da-nang',
  'binh duong': 'binh-duong',
  'khanh hoa': 'khanh-hoa',
  'can tho': 'can-tho',
  'hai phong': 'hai-phong',
  'ba ria vung tau': 'ba-ria-vung-tau',
  'lam dong': 'lam-dong',
  'dong nai': 'dong-nai',
  'quang ninh': 'quang-ninh',
  'thanh hoa': 'thanh-hoa',
  'nghe an': 'nghe-an',
  'thua thien hue': 'thua-thien-hue',
  'binh dinh': 'binh-dinh',
  'quy nhon': 'binh-dinh',
  'vung tau': 'ba-ria-vung-tau',
};

// ============================================
// MAPPING TYPE ALONHADAT
// ============================================
const ALONHADAT_PROPERTY_TYPE = {
  'nha o': 'nha',
  'can ho chung cu': 'can-ho-chung-cu',
  'dat': 'dat-tho-cu-dat-o',
  'biet thu': 'biet-thu-nha-lien-ke',
  'nha biet thu': 'biet-thu-nha-lien-ke',
  'villa': 'biet-thu-nha-lien-ke',
  'kho nha xuong': 'kho-nha-xuong-dat-cong-nghiep',
  'warehouse': 'kho-nha-xuong-dat-cong-nghiep',
  'shophouse': 'shophouse-nha-pho-thuong-mai',
};

// ============================================
// ALONHADAT LOCATION CODES (q=district, p=ward)
// Format URL: can-ban-{type}-{slug}-q{code}.htm
// Vérifié manuellement sur alonhadat.com.vn
// ============================================
const ALONHADAT_HCM_DISTRICTS = {
  // Vérifié depuis le footer de la page HCM
  'quan 1': { code: 'q132', slug: 'quan-1-ho-chi-minh' },
  '1': { code: 'q132', slug: 'quan-1-ho-chi-minh' },
  'quan 10': { code: 'q141', slug: 'quan-10-ho-chi-minh' },
  '10': { code: 'q141', slug: 'quan-10-ho-chi-minh' },
  'thu duc': { code: 'q150', slug: 'thanh-pho-thu-duc-ho-chi-minh' },
  'thanh pho thu duc': { code: 'q150', slug: 'thanh-pho-thu-duc-ho-chi-minh' },
  'tp thu duc': { code: 'q150', slug: 'thanh-pho-thu-duc-ho-chi-minh' },
  'binh chanh': { code: 'q151', slug: 'huyen-binh-chanh-ho-chi-minh' },
  'can gio': { code: 'q152', slug: 'huyen-can-gio-ho-chi-minh' },
  'cu chi': { code: 'q153', slug: 'huyen-cu-chi-ho-chi-minh' },
  'hoc mon': { code: 'q154', slug: 'huyen-hoc-mon-ho-chi-minh' },
  'nha be': { code: 'q155', slug: 'huyen-nha-be-ho-chi-minh' },
  // Codes probables basés sur le pattern séquentiel (à vérifier)
  'quan 2': { code: 'q133', slug: 'quan-2-ho-chi-minh' },
  '2': { code: 'q133', slug: 'quan-2-ho-chi-minh' },
  'quan 3': { code: 'q134', slug: 'quan-3-ho-chi-minh' },
  '3': { code: 'q134', slug: 'quan-3-ho-chi-minh' },
  'quan 4': { code: 'q135', slug: 'quan-4-ho-chi-minh' },
  '4': { code: 'q135', slug: 'quan-4-ho-chi-minh' },
  'quan 5': { code: 'q136', slug: 'quan-5-ho-chi-minh' },
  '5': { code: 'q136', slug: 'quan-5-ho-chi-minh' },
  'quan 6': { code: 'q137', slug: 'quan-6-ho-chi-minh' },
  '6': { code: 'q137', slug: 'quan-6-ho-chi-minh' },
  'quan 7': { code: 'q138', slug: 'quan-7-ho-chi-minh' },
  '7': { code: 'q138', slug: 'quan-7-ho-chi-minh' },
  'quan 8': { code: 'q139', slug: 'quan-8-ho-chi-minh' },
  '8': { code: 'q139', slug: 'quan-8-ho-chi-minh' },
  'quan 9': { code: 'q140', slug: 'quan-9-ho-chi-minh' },
  '9': { code: 'q140', slug: 'quan-9-ho-chi-minh' },
  'quan 11': { code: 'q142', slug: 'quan-11-ho-chi-minh' },
  '11': { code: 'q142', slug: 'quan-11-ho-chi-minh' },
  'quan 12': { code: 'q143', slug: 'quan-12-ho-chi-minh' },
  '12': { code: 'q143', slug: 'quan-12-ho-chi-minh' },
  'binh tan': { code: 'q144', slug: 'quan-binh-tan-ho-chi-minh' },
  'binh thanh': { code: 'q145', slug: 'quan-binh-thanh-ho-chi-minh' },
  'go vap': { code: 'q146', slug: 'quan-go-vap-ho-chi-minh' },
  'phu nhuan': { code: 'q147', slug: 'quan-phu-nhuan-ho-chi-minh' },
  'tan binh': { code: 'q148', slug: 'quan-tan-binh-ho-chi-minh' },
  'tan phu': { code: 'q149', slug: 'quan-tan-phu-ho-chi-minh' },
};

// Ward codes pour Thủ Đức (vérifié: p779 = Thảo Điền)
const ALONHADAT_THU_DUC_WARDS = {
  'thao dien': { code: 'p779', slug: 'phuong-thao-dien-thanh-pho-thu-duc' },
  // Les autres wards seront ajoutés au fur et à mesure de la vérification
};

// Résout le code + slug Alonhadat pour un district
function getAlonhadatDistrictInfo(city, district) {
  if (!district) return null;
  const dNorm = removeVietnameseAccents(district.toLowerCase())
    .replace(/^(quan|huyen|thanh pho|tp\.?|tx\.?|q\.?)\s*/i, '')
    .trim();
  
  // Chercher dans le mapping HCM
  const cityNorm = removeVietnameseAccents(city || '').toLowerCase();
  if (cityNorm.includes('ho chi minh') || cityNorm.includes('hcm')) {
    if (ALONHADAT_HCM_DISTRICTS[dNorm]) return ALONHADAT_HCM_DISTRICTS[dNorm];
    // Recherche partielle
    for (const [key, info] of Object.entries(ALONHADAT_HCM_DISTRICTS)) {
      if (dNorm.includes(key) || key.includes(dNorm)) return info;
    }
  }
  return null;
}

// Résout le code + slug Alonhadat pour un ward de Thủ Đức
function getAlonhadatWardInfo(district, ward) {
  if (!ward || !district) return null;
  const dNorm = removeVietnameseAccents(district.toLowerCase())
    .replace(/^(quan|huyen|thanh pho|tp\.?|tx\.?|q\.?)\s*/i, '')
    .trim();
  const wNorm = removeVietnameseAccents(ward.toLowerCase())
    .replace(/^(phuong|xa|thi tran)\s+/i, '')
    .replace(/\s*\(.*\)\s*$/, '')  // Retirer "(Quận 2 cũ)"
    .trim();
  
  if (['thu duc', 'thanh pho thu duc', 'tp thu duc'].includes(dNorm)) {
    if (ALONHADAT_THU_DUC_WARDS[wNorm]) return ALONHADAT_THU_DUC_WARDS[wNorm];
  }
  return null;
}

// ============================================
// MAPPING STATUT LÉGAL
// ============================================
const getLegalStatus = (code) => {
  const legalMap = {
    1: 'Sổ đỏ/Sổ hồng',
    2: 'Hợp đồng mua bán',
    3: 'Đang chờ sổ',
  };
  return legalMap[code] || null;
};

// ============================================
// MAPPING DIRECTION
// ============================================
const getDirection = (code) => {
  const directionMap = {
    1: 'Đông',
    2: 'Tây',
    3: 'Nam',
    4: 'Bắc',
    5: 'Đông Bắc',
    6: 'Đông Nam',
    7: 'Tây Bắc',
    8: 'Tây Nam',
  };
  return directionMap[code] || null;
};

// ============================================
// MAPPING FURNISHING
// ============================================
const getFurnishing = (code) => {
  const furnishingMap = {
    1: 'Nội thất cao cấp',
    2: 'Nội thất đầy đủ',
    3: 'Nội thất cơ bản',
    4: 'Bàn giao thô',
  };
  return furnishingMap[code] || null;
};

// ============================================
// MAPPING CATÉGORIE CHOTOT → NOM TYPE
// ============================================
const getCategoryName = (categoryCode) => {
  const categoryMap = {
    1010: 'Căn hộ chung cư',
    1020: 'Nhà ở',
    1030: 'Văn phòng, Mặt bằng',
    1040: 'Đất',
    1000: 'Bất động sản',
  };
  return categoryMap[categoryCode] || null;
};

// ============================================
// ANALYSE NLP DU TEXTE DES ANNONCES
// ============================================
function analyzeListingText(title, body) {
  const text = ((title || '') + ' ' + (body || '')).toLowerCase();
  const analysis = {
    extractedStreetWidth: null,
    extractedFloors: null,
    extractedFacade: null,
    extractedDirection: null,
    extractedRentalIncome: null,
    extractedPricePerM2: null,
    hasMetroNearby: false,
    hasNewRoad: false,
    hasInvestmentPotential: false,
    hasLegalIssue: false,
    hasPlanningRisk: false,
    // Nouveaux champs NLP enrichis
      extractedArea: null,
      extractedWidth: null,
      extractedDepth: null,
      extractedBedrooms: null,
      extractedBathrooms: null,
      extractedLegalStatus: null,   // 'so_hong', 'hop_dong', 'giay_tay', 'cho_so', null
      extractedStreetAccess: null,  // 'mat_tien', 'hem', 'hxh', 'goc', 'kiet', 'ngo', null
      extractedPropertyType: null,  // 'CHDV', 'shophouse', 'biet_thu', 'chung_cu', etc.
      hasUrgency: false,
      urgencyKeywords: [],
      investmentKeywords: [],
      hasRentalIncome: false,
  };

  const bodyText = (body || '').toLowerCase();
  const titleText = (title || '').toLowerCase();
  
  const streetWidthPatterns = [
    /hẻm\s+(?:xe\s+hơi\s+)?(?:[\w\s]*?(?:rộng|đều)\s+)?(\d+[,.]?\d*)\s*m(?!\s*²|²|\d)/i,
    /ngõ\s+(?:rộng\s+)?(\d+[,.]?\d*)\s*m(?!\s*²|²|\d)/i,
    /đường\s+(?:trước\s+)?(?:nhà\s+)?(?:hẻm\s+)?rộng\s+(\d+[,.]?\d*)\s*m(?!\s*²|²|\d)/i,
    /xe\s+hơi[\w\s]*?(\d+[,.]?\d*)\s*m(?!\s*²|²|\d)/i,
    /hẻm\s+(?:thông|bê\s*tông|betong)\s+(\d+[,.]?\d*)\s*m(?!\s*²|²|\d)/i,
  ];
  
  let streetWidthFound = false;
  
  const hasMTContextBody = /\d\s*mt\b|\d\s*mặt\s*tiền/i.test(bodyText);
  
  if (!hasMTContextBody) {
    for (const pattern of streetWidthPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        const width = parseFloat(match[1].replace(',', '.'));
        if (width >= 1 && width <= 15) {
          analysis.extractedStreetWidth = width;
          streetWidthFound = true;
          break;
        }
      }
    }
  }
  
  if (!streetWidthFound) {
    const hasMTContext = /\d\s*mt\b|\d\s*mặt\s*tiền/i.test(titleText);
    
    if (!hasMTContext) {
      for (const pattern of streetWidthPatterns) {
        const match = titleText.match(pattern);
        if (match) {
          const width = parseFloat(match[1].replace(',', '.'));
          if (width >= 1 && width <= 15) {
            analysis.extractedStreetWidth = width;
            break;
          }
        }
      }
    }
  }

  const floorPatterns = [
    /(\d+)\s*tầng/i,
    /(\d+)\s*lầu/i,
    /nhà\s*(\d+)\s*t(?:ầng|ang)/i,
  ];
  for (const pattern of floorPatterns) {
    const match = text.match(pattern);
    if (match && parseInt(match[1]) <= 20) {
      analysis.extractedFloors = parseInt(match[1]);
      break;
    }
  }

  const facadePatterns = [
    /mặt\s*tiền\s+(\d+[,.]?\d*)\s*m(?!\s*²|²|2|\d)/i,
    /ngang\s+(\d+[,.]?\d*)\s*m(?!\s*²|²|2|\d)/i,
    /(\d+[,.]?\d*)\s*m\s*x\s*\d+/i,
  ];
  
  for (const pattern of facadePatterns) {
    const match = text.match(pattern);
    if (match) {
      const facade = parseFloat(match[1].replace(',', '.'));
      if (facade >= 2 && facade <= 30) {
        analysis.extractedFacade = facade;
        break;
      }
    }
  }

  const directionPatterns = [
    /hướng\s*(đông\s*nam|tây\s*nam|đông\s*bắc|tây\s*bắc|đông|tây|nam|bắc)/i,
    /(đông\s*nam|tây\s*nam|đông\s*bắc|tây\s*bắc)\s*$/i,
  ];
  for (const pattern of directionPatterns) {
    const match = text.match(pattern);
    if (match) {
      analysis.extractedDirection = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      break;
    }
  }

  const rentalPatterns = [
    /thu\s*nhập[^\d]*(\d+)[^\d]*(tr|triệu)/i,
    /cho\s*thuê[^\d]*(\d+)[^\d]*(tr|triệu)/i,
    /thuê[^\d]*(\d+)[^\d]*(tr|triệu)[^\d]*tháng/i,
  ];
  for (const pattern of rentalPatterns) {
    const match = text.match(pattern);
    if (match) {
      analysis.extractedRentalIncome = parseInt(match[1]) * 1000000;
      break;
    }
  }

  const priceM2Patterns = [
    /(\d+)[^\d]*(tr|triệu)[^\d]*m²/i,
    /giá[^\d]*(\d+)[^\d]*(tr|triệu)\/m/i,
  ];
  for (const pattern of priceM2Patterns) {
    const match = text.match(pattern);
    if (match) {
      analysis.extractedPricePerM2 = parseInt(match[1]) * 1000000;
      break;
    }
  }

  if (/metro|tàu\s*điện/i.test(text)) {
    analysis.hasMetroNearby = true;
  }
  if (/mở\s*đường|sắp\s*mở|đường\s*mới|quy\s*hoạch\s*đường/i.test(text)) {
    analysis.hasNewRoad = true;
  }
  if (/đầu\s*tư|sinh\s*lời|tăng\s*giá|tiềm\s*năng/i.test(text)) {
    analysis.hasInvestmentPotential = true;
  }

  if (/chưa\s*(có\s*)?sổ|giấy\s*tay|không\s*sổ/i.test(text)) {
    analysis.hasLegalIssue = true;
  }
  if (/giải\s*tỏa|quy\s*hoạch\s*(treo|đỏ)|tranh\s*chấp/i.test(text)) {
    analysis.hasPlanningRisk = true;
  }
// ===========================================
    // DIMENSIONS : largeur x profondeur → surface
    // ===========================================
    const dimPatterns = [
      /(\d+[.,]?\d*)\s*[xX×]\s*(\d+[.,]?\d*)\s*m/i,
      /(\d+[.,]?\d*)\s*[xX×]\s*(\d+[.,]?\d*)/i,
      /dt[:\s]*(\d+[.,]?\d*)\s*[xX×]\s*(\d+[.,]?\d*)/i,
    ];
    for (const pattern of dimPatterns) {
      const match = text.match(pattern);
      if (match) {
        const w = parseFloat(match[1].replace(',', '.'));
        const d = parseFloat(match[2].replace(',', '.'));
        if (w >= 1 && w <= 100 && d >= 1 && d <= 200) {
          analysis.extractedWidth = w;
          analysis.extractedDepth = d;
          analysis.extractedArea = Math.round(w * d * 10) / 10;
          break;
        }
      }
    }

    // Surface directe si pas de dimensions
    if (!analysis.extractedArea) {
      const areaPatterns = [
        /(\d+[.,]?\d*)\s*m²/i,
        /(\d+[.,]?\d*)\s*m2/i,
        /diện\s*tích[:\s]*(\d+[.,]?\d*)/i,
        /dt[:\s]*(\d+[.,]?\d*)\s*m/i,
      ];
      for (const pattern of areaPatterns) {
        const match = text.match(pattern);
        if (match) {
          const area = parseFloat(match[1].replace(',', '.'));
          if (area >= 5 && area <= 10000) {
            analysis.extractedArea = area;
            break;
          }
        }
      }
    }

    // ===========================================
    // CHAMBRES & SALLES DE BAIN
    // ===========================================
    const bedroomPatterns = [
      /(\d+)\s*(?:phòng\s*ngủ|phòng\s*ngũ|pn\b)/i,
      /(\d+)\s*(?:pn)\b/i,
      /(\d+)\s*(?:phòng)\b(?!\s*(?:tắm|wc|khách|ăn|bếp))/i,
      /(\d+)p\s*(\d+)(?:wc|toilet)/i,
    ];
    for (const pattern of bedroomPatterns) {
      const match = text.match(pattern);
      if (match) {
        const beds = parseInt(match[1]);
        if (beds >= 1 && beds <= 50) {
          analysis.extractedBedrooms = beds;
          break;
        }
      }
    }

    const bathroomPatterns = [
      /(\d+)\s*(?:phòng\s*tắm|phòng\s*vệ\s*sinh|toilet|wc|nhà\s*vệ\s*sinh)/i,
      /(\d+)\s*(?:wc|vs)\b/i,
      /(\d+)p\s*(\d+)(?:wc|toilet)/i,
    ];
    for (const pattern of bathroomPatterns) {
      const match = text.match(pattern);
      if (match) {
        // Pour le pattern "4p2wc", les bains sont dans match[2] si disponible
        const baths = parseInt(match[2] || match[1]);
        if (baths >= 1 && baths <= 20) {
          analysis.extractedBathrooms = baths;
          break;
        }
      }
    }

    // ===========================================
    // STATUT LÉGAL
    // ===========================================
    if (/sổ\s*hồng\s*riêng|shr\b/i.test(text)) {
      analysis.extractedLegalStatus = 'so_hong_rieng';
    } else if (/sổ\s*hồng|sổ\s*đỏ|so\s*hong|so\s*do|đã\s*có\s*sổ/i.test(text)) {
      analysis.extractedLegalStatus = 'so_hong';
    } else if (/công\s*nhận\s*đủ|cndd/i.test(text)) {
      analysis.extractedLegalStatus = 'so_hong';
    } else if (/hợp\s*đồng\s*mua\s*bán|hđmb|hdmb/i.test(text)) {
      analysis.extractedLegalStatus = 'hop_dong';
    } else if (/giấy\s*phép\s*xây\s*dựng|gpxd/i.test(text)) {
      analysis.extractedLegalStatus = 'gpxd';
    } else if (/giấy\s*tay/i.test(text)) {
      analysis.extractedLegalStatus = 'giay_tay';
    } else if (/chưa\s*(?:có\s*)?sổ|đang\s*chờ\s*sổ|chờ\s*sổ/i.test(text)) {
      analysis.extractedLegalStatus = 'cho_so';
    } else if (/vi\s*bằng/i.test(text)) {
      analysis.extractedLegalStatus = 'vi_bang';
    }

    // ===========================================
    // TYPE D'ACCÈS RUE
    // ===========================================
    if (/góc\s*\d*\s*m[ặa]t\s*ti[eề]n|góc\s*\d*\s*mt\b/i.test(text)) {
      analysis.extractedStreetAccess = 'goc_mt';
    } else if (/\d\s*m[ặa]t\s*ti[eề]n|\dmt\b/i.test(text)) {
      analysis.extractedStreetAccess = 'nhieu_mt';
    } else if (/m[ặa]t\s*ti[eề]n|^mt\b|\bmt\b/i.test(text)) {
      analysis.extractedStreetAccess = 'mat_tien';
    } else if (/góc|goc\b/i.test(text)) {
      analysis.extractedStreetAccess = 'goc';
    } else if (/h[eẻ]m\s*xe\s*h[oơ]i|hxh\b/i.test(text)) {
      analysis.extractedStreetAccess = 'hxh';
    } else if (/h[eẻ]m|nhà\s*trong\s*h[eẻ]m/i.test(text)) {
      analysis.extractedStreetAccess = 'hem';
    } else if (/ki[eệ]t/i.test(text)) {
      analysis.extractedStreetAccess = 'kiet';
    } else if (/ng[oõ](?:\s|$)/i.test(text)) {
      analysis.extractedStreetAccess = 'ngo';
    }

    // ===========================================
    // TYPE DE BIEN
    // ===========================================
    if (/chdv|căn\s*hộ\s*dịch\s*vụ/i.test(text)) {
      analysis.extractedPropertyType = 'chdv';
    } else if (/shophouse|shop\s*house/i.test(text)) {
      analysis.extractedPropertyType = 'shophouse';
    } else if (/bi[eệ]t\s*th[uự]/i.test(text)) {
      analysis.extractedPropertyType = 'biet_thu';
    } else if (/chung\s*c[uư]|căn\s*hộ/i.test(text)) {
      analysis.extractedPropertyType = 'chung_cu';
    } else if (/nhà\s*ph[oố]/i.test(text)) {
      analysis.extractedPropertyType = 'nha_pho';
    } else if (/đ[aấ]t\s*n[eề]n|đ[aấ]t\b/i.test(text)) {
      analysis.extractedPropertyType = 'dat';
    }

    // ===========================================
    // SIGNAUX D'URGENCE
    // ===========================================
    const urgencyTerms = [
      { pattern: /bán\s*gấp/i, keyword: 'Bán gấp' },
      { pattern: /cần\s*bán\s*gấp/i, keyword: 'Cần bán gấp' },
      { pattern: /giá\s*tốt/i, keyword: 'Giá tốt' },
      { pattern: /giá\s*rẻ/i, keyword: 'Giá rẻ' },
      { pattern: /bán\s*lỗ/i, keyword: 'Bán lỗ' },
      { pattern: /chính\s*chủ/i, keyword: 'Chính chủ' },
      { pattern: /cần\s*tiền/i, keyword: 'Cần tiền' },
      { pattern: /giảm\s*giá|giảm\s*sâu/i, keyword: 'Giảm giá' },
      { pattern: /hạ\s*giá/i, keyword: 'Hạ giá' },
      { pattern: /bán\s*nhanh/i, keyword: 'Bán nhanh' },
    ];
    for (const term of urgencyTerms) {
      if (term.pattern.test(text)) {
        analysis.hasUrgency = true;
        analysis.urgencyKeywords.push(term.keyword);
      }
    }

    // ===========================================
    // SIGNAUX INVESTISSEMENT
    // ===========================================
    const investTerms = [
      { pattern: /dòng\s*tiền/i, keyword: 'Dòng tiền' },
      { pattern: /thu\s*nhập/i, keyword: 'Thu nhập' },
      { pattern: /cho\s*thuê/i, keyword: 'Cho thuê' },
      { pattern: /sinh\s*lời/i, keyword: 'Sinh lời' },
      { pattern: /đầu\s*tư/i, keyword: 'Đầu tư' },
      { pattern: /tiềm\s*năng/i, keyword: 'Tiềm năng' },
      { pattern: /tăng\s*giá/i, keyword: 'Tăng giá' },
    ];
    for (const term of investTerms) {
      if (term.pattern.test(text)) {
        analysis.investmentKeywords.push(term.keyword);
      }
    }
    if (analysis.extractedRentalIncome || analysis.investmentKeywords.length > 0) {
      analysis.hasRentalIncome = true;
    }
  return analysis;
}

// ============================================
// MAPPING UNIVERSEL DES TYPES DE BIENS
// *** CORRECTION 1 : ajout 'nhà' dans include de nha_o
// ***               + exclude renforcés pour éviter faux positifs
// ============================================
const PROPERTY_TYPE_MAPPING = {
  'tat_ca': {
    label: { vn: 'Tất cả nhà đất', en: 'All Properties', fr: 'Tous biens' },
    chotot: 1000,
    include: [],
    exclude: []
  },
  'can_ho_chung_cu': {
    label: { vn: 'Căn hộ chung cư', en: 'Apartment', fr: 'Appartement' },
    chotot: 1010,
    include: ['căn hộ', 'chung cư', 'apartment', 'cc'],
    exclude: ['nghỉ dưỡng', 'condotel', 'resort', 'studio']
  },
  'can_ho_nghi_duong': {
    label: { vn: 'Căn hộ nghỉ dưỡng', en: 'Resort Condo', fr: 'Appart. Vacances' },
    chotot: 1010,
    include: ['nghỉ dưỡng', 'condotel', 'resort'],
    exclude: []
  },
  'studio': {
    label: { vn: 'Studio', en: 'Studio', fr: 'Studio' },
    chotot: 1010,
    include: ['studio'],
    exclude: []
  },
  'nha_o': {
    label: { vn: 'Nhà ở', en: 'House', fr: 'Maison' },
    chotot: 1020,
    include: ['nhà riêng', 'nhà ở', 'nhà phố', 'nhà'],
    exclude: ['biệt thự', 'villa', 'nghỉ dưỡng', 'resort', 'nhà xưởng', 'nhà nghỉ', 'nhà hàng', 'kho', 'xưởng']
  },
  'nha_biet_thu': {
    label: { vn: 'Nhà biệt thự', en: 'Villa', fr: 'Villa' },
    chotot: 1020,
    include: ['biệt thự', 'villa', 'liền kề'],
    exclude: ['nghỉ dưỡng', 'resort']
  },
  'nha_nghi_duong': {
    label: { vn: 'Nhà nghỉ dưỡng', en: 'Resort House', fr: 'Maison Vacances' },
    chotot: 1020,
    include: ['nghỉ dưỡng', 'resort'],
    exclude: []
  },
'shophouse': {
    label: { vn: 'Shophouse', en: 'Shophouse', fr: 'Shophouse' },
    chotot: 1030,
    include: ['shophouse', 'nhà phố thương mại', 'mặt tiền kinh doanh'],
    exclude: []
  },
  'van_phong': {
    label: { vn: 'Văn phòng', en: 'Office', fr: 'Bureau' },
    chotot: 1030,
    include: ['văn phòng', 'office', 'officetel'],
    exclude: []
  },
  'cua_hang': {
    label: { vn: 'Cửa hàng', en: 'Shop', fr: 'Boutique' },
    chotot: 1030,
    include: ['cửa hàng', 'shop', 'ki ốt', 'kiot'],
    exclude: []
  },
  'mat_bang': {
    label: { vn: 'Mặt bằng', en: 'Premises', fr: 'Local commercial' },
    chotot: 1030,
    include: ['mặt bằng', 'mặt tiền'],
    exclude: ['shophouse', 'văn phòng', 'kho']
  },
  'kho_nha_xuong': {
    label: { vn: 'Kho, nhà xưởng', en: 'Warehouse', fr: 'Entrepôt' },
    chotot: 1030,
    include: ['kho', 'nhà xưởng', 'xưởng', 'warehouse'],
    exclude: []
  },
  'dat': {
    label: { vn: 'Đất', en: 'Land', fr: 'Terrain' },
    chotot: 1040,
    include: ['đất', 'đất nền', 'lô đất'],
    exclude: ['nghỉ dưỡng', 'resort']
  },
  'dat_nghi_duong': {
    label: { vn: 'Đất nghỉ dưỡng', en: 'Resort Land', fr: 'Terrain Vacances' },
    chotot: 1040,
    include: ['nghỉ dưỡng', 'resort'],
    exclude: []
  },
  'bat_dong_san_khac': {
    label: { vn: 'Bất động sản khác', en: 'Other', fr: 'Autre bien' },
    chotot: 1000,
    include: [],
    exclude: []
  }
};

function getPropertyTypeMapping(userInput) {
  if (!userInput) return PROPERTY_TYPE_MAPPING['tat_ca'];
  
  const input = removeVietnameseAccents(userInput.toLowerCase());
  if (input.includes('tat ca') || input.includes('all properties') || input.includes('tous biens') || input === 'all') {
      return PROPERTY_TYPE_MAPPING['tat_ca'];
    }
  if (input.includes('shophouse')) {
    return PROPERTY_TYPE_MAPPING['shophouse'];
  }
  if (input.includes('office') || input.includes('officetel') || input.includes('van phong')) {
    return PROPERTY_TYPE_MAPPING['van_phong'];
  }
  if (input.includes('studio')) {
    return PROPERTY_TYPE_MAPPING['studio'];
  }
  if (input.includes('villa') || input.includes('biet thu')) {
    return PROPERTY_TYPE_MAPPING['nha_biet_thu'];
  }
  if (input.includes('warehouse') || input.includes('kho') || input.includes('xuong')) {
    return PROPERTY_TYPE_MAPPING['kho_nha_xuong'];
  }
  if (input.includes('premises') || input.includes('mat bang')) {
    return PROPERTY_TYPE_MAPPING['mat_bang'];
  }
  if (input.includes('shop') || input.includes('cua hang') || input.includes('kiot')) {
    return PROPERTY_TYPE_MAPPING['cua_hang'];
  }
  if (input.includes('resort') || input.includes('nghi duong')) {
    if (input.includes('can ho') || input.includes('apartment')) {
      return PROPERTY_TYPE_MAPPING['can_ho_nghi_duong'];
    }
    if (input.includes('dat') || input.includes('land')) {
      return PROPERTY_TYPE_MAPPING['dat_nghi_duong'];
    }
    return PROPERTY_TYPE_MAPPING['nha_nghi_duong'];
  }
    if (input.includes('dat') || input.includes('land') || input.includes('terrain')) {
    if (input.includes('nghi duong') || input.includes('resort')) {
      return PROPERTY_TYPE_MAPPING['dat_nghi_duong'];
    }
    return PROPERTY_TYPE_MAPPING['dat'];
  }
  for (const [key, mapping] of Object.entries(PROPERTY_TYPE_MAPPING)) {
    const labelVn = removeVietnameseAccents(mapping.label.vn.toLowerCase());
    const labelEn = mapping.label.en.toLowerCase();
    const labelFr = mapping.label.fr.toLowerCase();
    
    if (input.includes(labelVn) || labelVn.includes(input) ||
        input.includes(labelEn) || labelEn.includes(input) ||
        input.includes(labelFr) || labelFr.includes(input)) {
      return mapping;
    }
    
    for (const kw of mapping.include) {
      if (input.includes(removeVietnameseAccents(kw))) {
        return mapping;
      }
    }
  }
  
  if (input.includes('can ho') || input.includes('chung cu') || input.includes('apartment')) {
    return PROPERTY_TYPE_MAPPING['can_ho_chung_cu'];
  }
  if (input.includes('biet thu') || input.includes('villa')) {
    return PROPERTY_TYPE_MAPPING['nha_biet_thu'];
  }
  if (input.includes('nha') && !input.includes('biet thu') && !input.includes('nghi duong')) {
    return PROPERTY_TYPE_MAPPING['nha_o'];
  }
  if (input.includes('dat') && !input.includes('nghi duong')) {
    return PROPERTY_TYPE_MAPPING['dat'];
  }
  if (input.includes('nghi duong') || input.includes('resort')) {
    if (input.includes('can ho')) return PROPERTY_TYPE_MAPPING['can_ho_nghi_duong'];
    if (input.includes('dat')) return PROPERTY_TYPE_MAPPING['dat_nghi_duong'];
    return PROPERTY_TYPE_MAPPING['nha_nghi_duong'];
  }
  
  return PROPERTY_TYPE_MAPPING['tat_ca'];
}

function removeVietnameseAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

function getChototRegion(city) {
  if (!city) return '13000';
  
  const cityNormalized = removeVietnameseAccents(city);
  console.log(`City mapping: "${city}" → normalized: "${cityNormalized}"`);
  
  for (const [cityName, code] of Object.entries(CHOTOT_REGIONS)) {
    if (cityNormalized.includes(cityName) || cityName.includes(cityNormalized)) {
      console.log(`City matched: "${cityName}" → code ${code}`);
      return code;
    }
  }
  
  if (cityNormalized.includes('sai gon') || cityNormalized.includes('saigon') || cityNormalized.includes('hcm') || cityNormalized.includes('tphcm')) {
    return '13000';
  }
  if (cityNormalized.includes('hanoi') || cityNormalized.includes('hn')) {
    return '12000';
  }
  if (cityNormalized.includes('danang') || cityNormalized.includes('dn')) {
    return '3017';
  }
  if (cityNormalized.includes('nha trang')) {
    return '7044';
  }
  if (cityNormalized.includes('da lat') || cityNormalized.includes('dalat')) {
    return '15200';
  }
  
  console.log(`City not found, defaulting to HCM (13000)`);
  return '13000';
}

// ============================================
// CHOTOT API
// ============================================
async function fetchChotot(params) {
  const { city, district, ward, priceMin, priceMax, sortBy, propertyType } = params;
  
  const regionCode = getChototRegion(city);
  const typeMapping = getPropertyTypeMapping(propertyType);
  console.log(`Chotot typeMapping DEBUG:`, JSON.stringify(typeMapping));
  console.log(`Chotot: ville="${city}" → region=${regionCode}, type="${propertyType}" → code=${typeMapping.chotot}`);
  
  const baseParams = new URLSearchParams();
baseParams.append('cg', typeMapping.chotot.toString());
  baseParams.append('region_v2', regionCode);
  baseParams.append('st', 's,k');
  baseParams.append('limit', '50');
  console.log(`Chotot PARAMS DEBUG: ${baseParams.toString()}`);

  // Filtre par district dans l'API Chotot
  const districtCode = getChototDistrictCode(regionCode, district);
  let useAreaFilter = false;
  
  // *** THU DUC: code unifié 13119 (fusion Q2+Q9+ancien TD depuis 2021) ***
  const dNorm = district ? removeVietnameseAccents(district.toLowerCase()).replace(/^(quan|huyen|thanh pho|tp\.?|tx\.?|q\.?)\s*/i, '').trim() : '';
  const isThuDuc = ['thu duc', '2', '9'].includes(dNorm);
  
  if (isThuDuc) {
    baseParams.append('area_v2', '13119');
    useAreaFilter = true;
    console.log(`Chotot: Thu Duc → area_v2=13119 (code unifié)`);
    
    // Filtre ward Chotot pour Thủ Đức (codes découverts via debug 2025-02-16)
    if (ward) {
      const wNorm = removeVietnameseAccents(ward.toLowerCase()).replace(/^(phuong|xa|thi tran)\s+/i, '').trim();
      const THU_DUC_WARD_CODES = {
        // Ancien Q2
        'thao dien': '9340', 'an phu': '9341', 'binh trung dong': '9343',
        'binh trung tay': '9344', 'cat lai': '9347', 'thanh my loi': '9348',
        'an khanh': '11221',
        // Ancien Thủ Đức
        'hiep binh chanh': '9244', 'hiep binh phuoc': '9243', 'linh xuan': '9238',
        'linh tay': '9246', 'linh dong': '9247', 'binh chieu': '9239',
        'linh trung': '9240', 'tam binh': '9241', 'tam phu': '9242',
        'linh chieu': '9245', 'truong tho': '9249', 'binh tho': '9248',
        // Ancien Q9
        'long truong': '9260', 'phuoc long b': '9256', 'tang nhon phu a': '9254',
        'tang nhon phu b': '9255', 'hiep phu': '9253', 'phu huu': '9262',
        'long binh': '9250', 'long thanh my': '9251', 'phuoc binh': '9261',
        'truong thanh': '9258', 'phuoc long a': '9257', 'tan phu': '9252',
        'long phuoc': '9259',
      };
      const wardCode = THU_DUC_WARD_CODES[wNorm];
      if (wardCode) {
        baseParams.append('ward', wardCode);
        console.log(`Chotot: ward="${wNorm}" → ward=${wardCode}`);
      } else {
        console.log(`Chotot: ward="${wNorm}" → code inconnu, filtre post-hoc`);
      }
    }
  } else if (districtCode) {
    baseParams.append('area_v2', districtCode);
    useAreaFilter = true;
    console.log(`Chotot: district="${district}" → area_v2=${districtCode} (ACTIVÉ)`);
  }
  
  // Chotot API: filtre prix désactivé (format incompatible)
  if (false && (priceMin || priceMax)) {}
  
  if (sortBy === 'price_asc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'asc');
  } else if (sortBy === 'price_desc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'desc');
  }
  
  const allAds = [];
  const batchSize = 5;
  
  // Helper: fetch N pages avec des params donnés
  async function fetchChototPages(fetchParams, maxPagesToFetch, label) {
    const ads = [];
    for (let batch = 0; batch < maxPagesToFetch; batch += batchSize) {
      const batchOffsets = Array.from(
        {length: Math.min(batchSize, maxPagesToFetch - batch)},
        (_, i) => (batch + i) * 50
      );
      const batchResults = await Promise.all(
        batchOffsets.map(async (offset) => {
          try {
            const url = `https://gateway.chotot.com/v1/public/ad-listing?${fetchParams}&o=${offset}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.ads && data.ads.length > 0) {
              console.log(`Chotot [${label}] offset=${offset}: +${data.ads.length} (total API: ${data.total})`);
              return data.ads;
            }
            return null;
          } catch (error) {
            console.error(`Chotot [${label}] error offset=${offset}:`, error.message);
            return [];
          }
        })
      );
      let hasEmpty = false;
      for (const result of batchResults) {
        if (result === null) { hasEmpty = true; break; }
        ads.push(...result);
      }
      if (hasEmpty) break;
    }
    return ads;
  }
  
  // *** FETCH PRINCIPAL (fonctionne pour tous les districts y compris Thủ Đức) ***
  {
    const baseMaxResults = params.maxResults || 200;
    let effectiveMaxResults = baseMaxResults;
    if (district && ward) {
      effectiveMaxResults = Math.max(baseMaxResults, 2000);
    } else if (district) {
      effectiveMaxResults = Math.max(baseMaxResults, 1500);
    }
    const maxPages = Math.min(Math.ceil(effectiveMaxResults / 50), 100);
    console.log(`Chotot: fetching ${maxPages} pages (${maxPages * 50} résultats max)`);
    console.log(`Chotot URL DEBUG: https://gateway.chotot.com/v1/public/ad-listing?${baseParams.toString()}&o=0`);
    
    const ads = await fetchChototPages(baseParams, maxPages, 'main');
    allAds.push(...ads);
  }
  
  console.log(`Chotot TOTAL brut: ${allAds.length} annonces`);
  

  
  // FALLBACK: si area_v2 retourne 0 résultats (pour districts non-Thu Duc), relancer sans filtre
  if (allAds.length === 0 && useAreaFilter) {
    console.log(`Chotot: area_v2=${districtCode} retourne 0 → FALLBACK sans filtre district`);
    baseParams.delete('area_v2');
    
    const fallbackPages = Math.min(Math.ceil(1500 / 50), 30);
    for (let batch = 0; batch < fallbackPages; batch += batchSize) {
      const batchOffsets = Array.from(
        {length: Math.min(batchSize, fallbackPages - batch)}, 
        (_, i) => (batch + i) * 50
      );
      const batchResults = await Promise.all(
        batchOffsets.map(async (offset) => {
          try {
            const url = `https://gateway.chotot.com/v1/public/ad-listing?${baseParams}&o=${offset}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.ads && data.ads.length > 0) {
              console.log(`Chotot FALLBACK offset=${offset}: +${data.ads.length}`);
              return data.ads;
            }
            return null;
          } catch (error) {
            console.error(`Chotot FALLBACK error offset=${offset}:`, error.message);
            return [];
          }
        })
      );
      let hasEmpty = false;
      for (const result of batchResults) {
        if (result === null) { hasEmpty = true; break; }
        allAds.push(...result);
      }
      if (hasEmpty) break;
    }
    console.log(`Chotot FALLBACK TOTAL brut: ${allAds.length} annonces`);
  }

  let results = allAds
    .filter(ad => ad.price && ad.price > 0)
    .map(ad => {
      const nlpAnalysis = analyzeListingText(ad.subject, ad.body);
      const propertyType = getCategoryName(ad.category) || ad.category_name || '';
      return {
        id: `chotot_${ad.list_id}`,
        title: ad.subject || 'Không có tiêu đề',
        body: ad.body || '',
        price: ad.price || 0,
        floorAreaSqm: ad.size || ad.area || 0,
        area: ad.size || ad.area || 0,
        address: [ad.street_name, ad.ward_name, ad.area_name].filter(Boolean).join(', ') || '',
        street: ad.street_name || '',
        ward: ad.ward_name || '',
        district: ad.area_name || '',
        city: ad.region_name || '',
        latitude: ad.latitude || null,
longitude: ad.longitude || null,
        bedrooms: ad.rooms || null,
        bathrooms: ad.toilets || null,
        thumbnail: ad.image || ad.images?.[0] || '',
        images: ad.images || (ad.image ? [ad.image] : []),
        url: `https://www.chotot.com/${ad.list_id}.htm`,
        source: 'chotot.com',
        postedOn: ad.list_time ? new Date(ad.list_time > 10000000000 ? ad.list_time : ad.list_time * 1000).toLocaleDateString('vi-VN') : '',
        list_time: ad.list_time || 0,
        category: ad.category || null,
        propertyType: propertyType || ad.category_name || '',
        pricePerM2: ad.price_million_per_m2 || null,
        legalStatus: ad.property_legal_document ? getLegalStatus(ad.property_legal_document) : null,
        direction: ad.direction ? getDirection(ad.direction) : nlpAnalysis.extractedDirection,
        floors: ad.floors || nlpAnalysis.extractedFloors,
        streetWidth: ad.street_width || nlpAnalysis.extractedStreetWidth,
        facadeWidth: ad.facade_width || nlpAnalysis.extractedFacade,
        furnishing: ad.furnishing_sell ? getFurnishing(ad.furnishing_sell) : null,
        nlpAnalysis: nlpAnalysis,
        extractedRentalIncome: nlpAnalysis.extractedRentalIncome,
        hasMetroNearby: nlpAnalysis.hasMetroNearby,
        hasNewRoad: nlpAnalysis.hasNewRoad,
        hasInvestmentPotential: nlpAnalysis.hasInvestmentPotential,
 hasLegalIssue: nlpAnalysis.hasLegalIssue,
        hasPlanningRisk: nlpAnalysis.hasPlanningRisk,
      };
    });

  // Filtrer par type de bien (villa, maison, etc.)
  if (typeMapping.include.length > 0 || typeMapping.exclude.length > 0) {
    const beforeFilter = results.length;
    results = filterByKeywords(results, typeMapping.include, typeMapping.exclude);
    console.log(`Chotot filtre type: ${beforeFilter} → ${results.length}`);
  }

  // *** DIAGNOSTIC: Afficher les districts uniques de Chotot ***
  const districtCounts = {};
  results.forEach(r => {
    const d = r.district || '(vide)';
    districtCounts[d] = (districtCounts[d] || 0) + 1;
  });
  const sortedDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]);
  console.log(`Chotot DISTRICTS UNIQUES (${sortedDistricts.length}):`, JSON.stringify(sortedDistricts.slice(0, 30)));

  return results;
}

// ============================================
// ALONHADAT SCRAPER AVEC PAGINATION
// *** V5.1: URLs filtrées par district/ward + fallback 3 niveaux ***
// ============================================
async function fetchAlonhadat(params) {
  const { city, district, ward, propertyType, priceMax, maxResults } = params;
  
  if (!SCRAPER_API_KEY) {
    console.log('Alonhadat: SCRAPER_API_KEY non configuré, skip');
    return [];
  }
  
  // *** FIX: Résoudre le type mapping une seule fois ***
  const typeMapping = getPropertyTypeMapping(propertyType);
  const typeLabelVn = typeMapping.label?.vn || 'Nhà ở';
  
  const cityNormalized = removeVietnameseAccents(city || 'ho chi minh');
  const typeNormalized = removeVietnameseAccents(propertyType || 'nha o');
  
  let citySlug = 'ho-chi-minh';
  for (const [key, value] of Object.entries(ALONHADAT_CITY_MAPPING)) {
    if (cityNormalized.includes(key) || key.includes(cityNormalized)) {
      citySlug = value;
      break;
    }
  }
  
  let typeSlug = 'nha-dat';
  if (typeNormalized && !typeNormalized.includes('tat ca') && typeNormalized !== 'nha dat') {
    for (const [key, value] of Object.entries(ALONHADAT_PROPERTY_TYPE)) {
      if (typeNormalized.includes(key) || key.includes(typeNormalized)) {
        typeSlug = value;
        break;
      }
    }
  }

  // *** V5.2: URLs Alonhadat avec codes q/p (format correct vérifié) ***
  // Format ward:     can-ban-nha-phuong-thao-dien-thanh-pho-thu-duc-p779.htm
  // Format district: can-ban-nha-thanh-pho-thu-duc-ho-chi-minh-q150.htm
  // Format city:     can-ban-nha/ho-chi-minh (fallback, fonctionne toujours)
  
  const districtInfo = district ? getAlonhadatDistrictInfo(city, district) : null;
  const wardInfo = (ward && districtInfo) ? getAlonhadatWardInfo(district, ward) : null;
  
  const urlTiers = [];
  
  // Tier 1: Ward (le plus précis) - format .htm avec p-code
  if (wardInfo) {
    urlTiers.push({
      base: `https://alonhadat.com.vn/can-ban-${typeSlug}-${wardInfo.slug}-${wardInfo.code}.htm`,
      label: `ward (${wardInfo.slug}-${wardInfo.code})`,
      maxPages: 5,
      isHtm: true
    });
  }
  
  // Tier 2: District - format .htm avec q-code
  if (districtInfo) {
    urlTiers.push({
      base: `https://alonhadat.com.vn/can-ban-${typeSlug}-${districtInfo.slug}-${districtInfo.code}.htm`,
      label: `district (${districtInfo.slug}-${districtInfo.code})`,
      maxPages: 3,
      isHtm: true
    });
  }
  
  // Tier 3: Ville (fallback, toujours disponible)
  urlTiers.push({
    base: `https://alonhadat.com.vn/can-ban-${typeSlug}/${citySlug}`,
    label: `city (${citySlug})`,
    maxPages: district ? 3 : (maxResults >= 200 ? 2 : 1),
    isHtm: false
  });
  
  console.log(`Alonhadat: URL tiers à essayer: ${urlTiers.map(t => t.label).join(' → ')}`);
  
  let allListings = [];
  let usedTier = null;
  
  // Essayer chaque tier d'URL
  for (const tier of urlTiers) {
    console.log(`Alonhadat: essai tier "${tier.label}"...`);
    
    try {
      const testUrl = tier.base;
      const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(testUrl)}`;
      console.log(`Alonhadat page 1: ${testUrl}`);
      
      const response = await fetch(scraperUrl);
      if (!response.ok) {
        console.log(`Alonhadat tier "${tier.label}": HTTP ${response.status} → essai tier suivant`);
        continue;
      }
      
      const html = await response.text();
      const listings = parseAlonhadatHtml(html, city, typeLabelVn);
      console.log(`Alonhadat page 1: ${listings.length} annonces`);

      if (listings.length === 0) {
        console.log(`Alonhadat tier "${tier.label}": 0 résultats → essai tier suivant`);
        continue;
      }
      
      // Ce tier fonctionne !
      allListings.push(...listings);
      usedTier = tier;
      
      // Track URLs for dedup (some pagination formats return duplicates)
      const seenUrls = new Set(allListings.map(l => l.url));
      
// Pagination: PARALLEL fetch for speed
      if (tier.maxPages > 1) {
        const pagePromises = [];
        for (let page = 2; page <= tier.maxPages; page++) {
          const pageUrl = tier.isHtm
            ? `${tier.base.replace('.htm', '')}/trang-${page}.htm`
            : `${tier.base}/trang-${page}`;
          const pageScraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(pageUrl)}`;
          console.log(`Alonhadat page ${page}: ${pageUrl}`);
          pagePromises.push(
            fetch(pageScraperUrl)
              .then(r => r.ok ? r.text() : null)
              .then(html => html ? parseAlonhadatHtml(html, city, typeLabelVn) : [])
              .catch(err => {
                console.log(`Alonhadat page ${page} erreur: ${err.message}`);
                return [];
              })
          );
        }
        
        const pageResults = await Promise.all(pagePromises);
        const seenUrls = new Set(allListings.map(l => l.url));
        
        for (let i = 0; i < pageResults.length; i++) {
          const pageListings = pageResults[i];
          const page = i + 2;
          console.log(`Alonhadat page ${page}: ${pageListings.length} annonces`);
          if (pageListings.length === 0) continue;
          const newListings = pageListings.filter(l => !seenUrls.has(l.url));
          console.log(`Alonhadat page ${page}: ${newListings.length} nouvelles (${pageListings.length - newListings.length} doublons)`);
          newListings.forEach(l => seenUrls.add(l.url));
          allListings.push(...newListings);
        }
      }
      
      // Tier fonctionne, sortir
      break;
      
    } catch (error) {
      console.log(`Alonhadat tier "${tier.label}" erreur: ${error.message} → essai tier suivant`);
      continue;
    }
  }
  
  console.log(`Alonhadat TOTAL: ${allListings.length} annonces (tier utilisé: ${usedTier?.label || 'aucun'})`);
  
  // *** FIX: Injecter le ward/district correct quand on utilise un tier ward/district ***
  // Ex: page p779 = Thảo Điền, tous les résultats sont de Thảo Điền même si l'adresse
  //     parsée montre "An Khánh" (nom post-fusion 2021)
  if (usedTier && wardInfo && ward) {
    const wardName = ward; // ex: "Thảo Điền"
    const districtName = district || 'Thành phố Thủ Đức';
    console.log(`Alonhadat: injection ward="${wardName}" district="${districtName}" sur ${allListings.length} résultats (tier ward)`);
    allListings.forEach(item => {
      // Toujours mettre le ward cherché (on SAIT que la page p779 = Thảo Điền)
      if (!item.ward || !removeVietnameseAccents(item.ward.toLowerCase()).includes(removeVietnameseAccents(ward.toLowerCase()))) {
        item.ward = wardName;
      }
      if (!item.district || item.district === '' || 
          removeVietnameseAccents(item.district.toLowerCase()).includes('ho chi minh') ||
          removeVietnameseAccents(item.district.toLowerCase()).includes('ha noi')) {
        item.district = districtName;
      }
      item.address = [item.street, item.ward, item.district].filter(Boolean).join(', ');
    });
  } else if (usedTier && districtInfo && district) {
    const districtName = district;
    console.log(`Alonhadat: injection district="${districtName}" sur ${allListings.length} résultats (tier district)`);
    allListings.forEach(item => {
      if (!item.district || item.district === '' ||
          removeVietnameseAccents(item.district.toLowerCase()).includes('ho chi minh') ||
          removeVietnameseAccents(item.district.toLowerCase()).includes('ha noi')) {
        item.district = districtName;
      }
    });
  }
  // *** DIAGNOSTIC: Afficher les districts/wards uniques de Alonhadat ***
  const alonDistrictCounts = {};
  allListings.forEach(r => {
    const key = `${r.district || '(vide)'} | ${r.ward || '(vide)'}`;
    alonDistrictCounts[key] = (alonDistrictCounts[key] || 0) + 1;
  });
  console.log(`Alonhadat DISTRICTS/WARDS UNIQUES:`, JSON.stringify(Object.entries(alonDistrictCounts).sort((a, b) => b[1] - a[1]).slice(0, 20)));
  
  // FALLBACK: si trop peu de résultats, relancer en "nha-dat"
  if (allListings.length < 10 && typeSlug !== 'nha-dat') {
    console.log(`Alonhadat: seulement ${allListings.length} résultats pour "${typeSlug}", fallback → nha-dat`);
    
    // Réutiliser le même tier géographique mais avec type "nha-dat"
    const fallbackBase = usedTier 
      ? usedTier.base.replace(`can-ban-${typeSlug}`, 'can-ban-nha-dat')
      : `https://alonhadat.com.vn/can-ban-nha-dat/${citySlug}`;
    
    for (let page = 1; page <= 4; page++) {
      try {
        const fallbackUrl = page === 1
          ? fallbackBase
          : `${fallbackBase}/trang-${page}`;
        
        const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(fallbackUrl)}&render=true`;
        const response = await fetch(scraperUrl);
        if (!response.ok) break;
        
        const html = await response.text();
        // *** FIX: passer typeLabelVn au parser (fallback) ***
        const listings = parseAlonhadatHtml(html, city, typeLabelVn);
        if (listings.length === 0) break;
        
        allListings.push(...listings);
        if (page < 2) await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        break;
      }
    }
    console.log(`Alonhadat après fallback type: ${allListings.length} annonces`);
  }
  
  // Filtrer par type de bien (villa, maison, etc.)
  // *** FIX: typeMapping déjà résolu en début de fonction ***
  if (typeMapping.include.length > 0 || typeMapping.exclude.length > 0) {
    const beforeFilter = allListings.length;
    allListings = filterByKeywords(allListings, typeMapping.include, typeMapping.exclude);
    console.log(`Alonhadat filtre type: ${beforeFilter} → ${allListings.length}`);
  }
  
  return allListings;
}

// *** CORRECTION 2 : parseAlonhadatHtml reçoit propertyType ***
function parseAlonhadatHtml(html, city, propertyType) {
  const listings = [];
  
  const articleRegex = /<article\s+class=["']property-item["'][^>]*>([\s\S]*?)<\/article>/gi;
  let match;
  
  while ((match = articleRegex.exec(html)) !== null) {
    const articleHtml = match[1];
    
    try {
      const listing = {};
      
      const urlMatch = articleHtml.match(/href=["']([^"']*\.html)["']/i);
      if (urlMatch) {
        const href = urlMatch[1];
        listing.url = href.startsWith('http') ? href : `https://alonhadat.com.vn${href}`;
        const memberIdMatch = articleHtml.match(/data-memberid=["'](\d+)["']/i);
        listing.id = memberIdMatch ? `alonhadat_${memberIdMatch[1]}` : `alonhadat_${href.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
      }
      
      const titleMatch = articleHtml.match(/itemprop=["']name["'][^>]*>([^<]+)</i) ||
                         articleHtml.match(/<h3[^>]*>([^<]+)</i);
      listing.title = titleMatch ? titleMatch[1].trim() : 'Sans titre';
      
      const priceMatch = articleHtml.match(/itemprop=["']price["']\s+content=["'](\d+)["']/i);
      if (priceMatch) {
        listing.price = parseInt(priceMatch[1]);
      } else {
        const priceTextMatch = articleHtml.match(/([\d,\.]+)\s*tỷ/i);
        if (priceTextMatch) {
          listing.price = Math.round(parseFloat(priceTextMatch[1].replace(',', '.')) * 1000000000);
        }
      }
            // Prix en triệu (millions) — biens moins chers
      if (!listing.price) {
        const priceTrieuMatch = articleHtml.match(/([\d,\.]+)\s*triệu/i);
        if (priceTrieuMatch) {
          listing.price = Math.round(parseFloat(priceTrieuMatch[1].replace(',', '.')) * 1000000);
        }
      }
      const areaPatterns = [/(\d+(?:[,\.]\d+)?)\s*m²/i, /(\d+(?:[,\.]\d+)?)\s*m2/i, /(\d+(?:[,\.]\d+)?)m²/i];
      for (const pattern of areaPatterns) {
        const areaMatch = articleHtml.match(pattern);
        if (areaMatch) {
          const areaValue = parseFloat(areaMatch[1].replace(',', '.'));
          if (areaValue >= 10 && areaValue <= 10000) {
            listing.area = areaValue;
            break;
          }
        }
      }
      
      const localityMatch = articleHtml.match(/itemprop=["']addressLocality["'][^>]*>([^<]+)</i);
      const regionMatch = articleHtml.match(/itemprop=["']addressRegion["'][^>]*>([^<]+)</i);
      
      // addressLocality = ward (phường), addressRegion = district (quận)
      const locality = localityMatch ? localityMatch[1].trim() : '';
      const region = regionMatch ? regionMatch[1].trim() : '';
      
      if (region) {
        listing.district = region;
        listing.ward = locality;
      } else {
        const localityLower = locality.toLowerCase();
        if (localityLower.startsWith('quận') || localityLower.startsWith('huyện') || 
            localityLower.startsWith('thành phố') || localityLower.startsWith('tp.') ||
            localityLower.startsWith('tp ')) {
          listing.district = locality;
          listing.ward = '';
        } else if (localityLower.startsWith('phường') || localityLower.startsWith('xã') ||
                   localityLower.startsWith('thị trấn')) {
          listing.ward = locality;
          listing.district = '';
        } else {
          listing.district = locality;
          listing.ward = '';
        }
      }
      listing.address = [listing.ward, listing.district].filter(Boolean).join(', ');
      listing.city = city;
      
      const bedroomMatch = articleHtml.match(/itemprop=["']numberOfBedrooms["'][^>]*>(\d+)/i) ||
                          articleHtml.match(/class=["']bedroom["'][^>]*>(\d+)/i) ||
                          articleHtml.match(/>(\d+)\s*(?:PN|pn|phòng ngủ)</i) ||
                          articleHtml.match(/(\d+)\s*(?:PN|pn|phòng ngủ)/i);
      if (bedroomMatch) {
        listing.bedrooms = parseInt(bedroomMatch[1]);
      }

      if (!listing.bedrooms && listing.title) {
        const titleBedroomMatch = listing.title.match(/(\d+)\s*(?:PN|pn|phòng ngủ)/i) ||
                                  listing.title.match(/nhà\s*(?:gồm\s*)?(\d+)\s*phòng/i) ||
                                  listing.title.match(/(\d+)\s*ngủ(?!\s*m)/i);
        if (titleBedroomMatch) {
          listing.bedrooms = parseInt(titleBedroomMatch[1]);
        }
      }

      if (!listing.area && listing.title) {
        const titleAreaMatch = listing.title.match(/(\d+(?:[,\.]\d+)?)\s*m²/i) || 
                             listing.title.match(/(\d+(?:[,\.]\d+)?)\s*m2/i);
        if (titleAreaMatch) {
          listing.area = parseFloat(titleAreaMatch[1].replace(',', '.'));
        }
      }

      if (!listing.legalStatus && listing.title) {
        const titleLower = listing.title.toLowerCase();
        if (titleLower.match(/sổ\s*(hồng|đỏ|riêng)/i) || 
            titleLower.match(/shr|shcc|sh\s*riêng/i) || 
            titleLower.match(/chính\s*chủ/i) ||
            titleLower.match(/hoàn\s*công/i) ||
            titleLower.match(/pháp\s*lý\s*rõ/i) ||
            titleLower.match(/đầy\s*đủ\s*giấy\s*tờ/i)) {
          listing.legalStatus = 'Sổ hồng/Sổ đỏ';
        } else if (titleLower.match(/gpxd/i) || titleLower.match(/giấy\s*phép\s*xây/i)) {
          listing.legalStatus = 'GPXD';
        } else if (titleLower.match(/sổ\s*chung/i) || titleLower.match(/sh\s*chung/i)) {
          listing.legalStatus = 'Sổ chung';
        }
      }

      if (!listing.floors && listing.title) {
        const titleFloorMatch = listing.title.match(/(\d+)\s*(?:lầu|tầng|tang|lau)/i);
        if (titleFloorMatch) {
          listing.floors = parseInt(titleFloorMatch[1]);
        }
      }

      if (listing.bedrooms) {
        console.log(`[ALONHADAT BEDROOM DEBUG] ${listing.bedrooms} ch - ${listing.title?.substring(0, 30)}`);
      }

      const floorMatch = articleHtml.match(/class=["']floors["'][^>]*>(\d+)/i) ||
                        articleHtml.match(/>(\d+)\s*tầng</i);
      if (floorMatch) {
        listing.floors = parseInt(floorMatch[1]);
      }
      
      let imageMatch = articleHtml.match(/data-src=["']([^"']+)["']/i);
      
      if (!imageMatch) {
        imageMatch = articleHtml.match(/data-original=["']([^"']+)["']/i);
      }
      
      if (!imageMatch) {
        imageMatch = articleHtml.match(/src=["']([^"']*\/files\/[^"']*)["']/i);
      }
      
      if (!imageMatch) {
        imageMatch = articleHtml.match(/src=["']([^"']*(?:alonhadat|files)[^"']*)["']/i);
      }
      
      if (imageMatch) {
        let imgUrl = imageMatch[1];
        imgUrl = imgUrl
          .replace('/thumbnails/', '/images/')
          .replace('/thumbnail/', '/images/')
          .replace('/thumb/', '/images/');
        listing.thumbnail = imgUrl.startsWith('http') ? imgUrl : `https://alonhadat.com.vn${imgUrl}`;
        console.log(`[ALONHADAT IMG DEBUG] ${listing.thumbnail?.substring(0, 80)}`);
      }
      
      listing.source = 'alonhadat.com.vn';
      // *** FIX: assigner le propertyType pour que filterByKeywords le trouve ***
      listing.propertyType = propertyType || 'Nhà ở';
      listing.images = listing.thumbnail ? [listing.thumbnail] : [];
      
      if (listing.title && listing.price > 0) {
        listings.push(listing);
      }
    } catch (e) {
      // Skip invalid listings
    }
  }
  
  return listings;
}

// ========================================
// ALONHADAT DETAIL SCRAPER (pour statut légal)
// ========================================
async function fetchAlonhadatDetails(listing) {
  if (!listing.url || listing.legalStatus) return listing;
  
  try {
    const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(listing.url)}&render=true`;
    const response = await fetch(scraperUrl);
    
    if (!response.ok) return listing;
    
    const html = await response.text();
    
    const legalMatch = html.match(/Pháp\s*lý[^<]*<[^>]*>([^<]+)</i) ||
                       html.match(/pháp\s*lý[^:]*:\s*([^<,]+)/i);
    if (legalMatch) {
      const legalText = legalMatch[1].trim().toLowerCase();
      if (legalText.includes('hồng') || legalText.includes('đỏ') || legalText.includes('riêng')) {
        listing.legalStatus = 'Sổ hồng/Sổ đỏ';
      } else if (legalText.includes('chung')) {
        listing.legalStatus = 'Sổ chung';
      } else if (legalText.includes('gpxd') || legalText.includes('giấy phép')) {
        listing.legalStatus = 'GPXD';
      } else {
        listing.legalStatus = legalMatch[1].trim();
      }
    }
    
    if (!listing.bedrooms) {
      const bedroomMatch = html.match(/Số\s*phòng\s*ngủ[^<]*<[^>]*>(\d+)/i) ||
                           html.match(/phòng\s*ngủ[^:]*:\s*(\d+)/i);
      if (bedroomMatch) {
        listing.bedrooms = parseInt(bedroomMatch[1]);
      }
    }
    
    if (!listing.area) {
      const areaMatch = html.match(/Diện\s*tích[^<]*<[^>]*>(\d+(?:[,\.]\d+)?)\s*m/i) ||
                        html.match(/diện\s*tích[^:]*:\s*(\d+(?:[,\.]\d+)?)\s*m/i);
      if (areaMatch) {
        listing.area = parseFloat(areaMatch[1].replace(',', '.'));
      }
    }
    // Extraire dimensions (chiều ngang × chiều dài)
if (!listing.facadeWidth) {
  const widthMatch = html.match(/[Cc]hiều\s*ngang[^<]*<[^>]*>(\d+[,.]?\d*)\s*m/i) ||
                     html.match(/chiều\s*ngang[^:]*:\s*(\d+[,.]?\d*)/i);
  if (widthMatch) {
    listing.facadeWidth = parseFloat(widthMatch[1].replace(',', '.'));
  }
}

// Extraire bathrooms
if (!listing.bathrooms) {
  const bathMatch = html.match(/[Ss]ố\s*(?:phòng\s*tắm|toilet|WC|wc)[^<]*<[^>]*>(\d+)/i) ||
                    html.match(/(?:phòng\s*tắm|toilet|wc)[^:]*:\s*(\d+)/i);
if (bathMatch) {
    listing.bathrooms = parseInt(bathMatch[1]);
  }
}

// Extraire street access type
if (!listing.streetAccess) {
  const typeMatch = html.match(/[Ll]oại\s*BDS[^<]*<[^>]*>([^<]+)/i) ||
                    html.match(/loại\s*bds[^:]*:\s*([^<,]+)/i);
  if (typeMatch) {
    const typeText = typeMatch[1].trim().toLowerCase();
    if (typeText.includes('mặt tiền')) listing.streetAccess = 'mat_tien';
    else if (typeText.includes('hẻm')) listing.streetAccess = 'hem';
  }
}

// Extraire direction
if (!listing.direction) {
  const dirMatch = html.match(/[Hh]ướng[^<]*<[^>]*>([^<]+)/i);
  if (dirMatch && dirMatch[1].trim() !== '—' && dirMatch[1].trim() !== '_' && dirMatch[1].trim() !== '---') {
    listing.direction = dirMatch[1].trim();
  }
}
    console.log(`[ALONHADAT DETAIL] ${listing.title?.substring(0, 30)} → Legal: ${listing.legalStatus || '?'}`);
    
  } catch (e) {
    console.log(`[ALONHADAT DETAIL ERROR] ${e.message}`);
  }
  
  return listing;
}

async function enrichTopAlonhadatListings(listings, maxEnrich = 20) {
const alonhadatIncomplete = listings.filter(l => 
  l.source === 'alonhadat.com.vn' && (!l.legalStatus || !l.area || !l.bedrooms)
  );
  
 const toEnrich = alonhadatIncomplete.slice(0, maxEnrich);
  
  if (toEnrich.length === 0) return listings;
  
  console.log(`[ENRICH] Scraping détails pour ${toEnrich.length} annonces Alonhadat...`);
  
  for (let i = 0; i < toEnrich.length; i += 3) {
    const batch = toEnrich.slice(i, i + 3);
    await Promise.all(batch.map(listing => fetchAlonhadatDetails(listing)));
  }
  
  return listings;
}

// ============================================
// FILTRES ET UTILITAIRES
// ============================================
function filterByKeywords(results, includeKeywords, excludeKeywords) {
  return results.filter(item => {
    const title = removeVietnameseAccents(item.title || '');
    const propertyType = removeVietnameseAccents(item.propertyType || '');
    const combined = title + ' ' + propertyType;
    
    if (excludeKeywords.length > 0) {
      for (const kw of excludeKeywords) {
        if (combined.includes(removeVietnameseAccents(kw))) {
          return false;
        }
      }
    }
    
    if (includeKeywords.length > 0) {
      let hasMatch = false;
      for (const kw of includeKeywords) {
        const kwNormalized = removeVietnameseAccents(kw);
        if (combined.includes(kwNormalized)) {
          hasMatch = true;
          break;
        }
      }
      return hasMatch;
    }
    
    return true;
  });
}

function applyFilters(results, filters) {
  const { city, district, ward, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, legalStatus, streetWidthMin, propertyType } = filters;
  let filtered = [...results];
  
  console.log(`applyFilters PARAMS: district="${district||''}" ward="${ward||''}" priceMin="${priceMin||''}" priceMax="${priceMax||''}" areaMin="${livingAreaMin||''}" areaMax="${livingAreaMax||''}" bedrooms="${bedrooms||''}" type="${propertyType||''}" | ${filtered.length} entrées`);
  
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => {
      return item.price >= min;
    });
  }
  
  if (priceMax) {
    const maxTy = parseFloat(priceMax);
    const beforePrice = filtered.length;

    filtered = filtered.filter(item => {
      if (item.source === 'alonhadat') {
        console.log(`[ALONHADAT PRICE DEBUG] price=${item.price}, title=${item.title?.substring(0, 30)}`);
      }

      if (!item.price || item.price <= 0) return false;

      const priceTy = item.price > 1000
        ? item.price / 1_000_000_000
        : item.price;

      return priceTy <= maxTy;
    });
    console.log(`Filtre prix max (≤${maxTy} tỷ): ${beforePrice} → ${filtered.length}`);
  }

  // *** FIX: Mapping des alias de districts (fusion 2021 Thủ Đức) ***
  const DISTRICT_ALIASES = {
    'thu duc': ['thu duc', 'thanh pho thu duc', 'tp thu duc', 'tp. thu duc', 'quan 2', 'quan 9', 'quan thu duc'],
    'quan 2': ['quan 2', 'thu duc', 'thanh pho thu duc', 'tp thu duc'],
    'quan 9': ['quan 9', 'thu duc', 'thanh pho thu duc', 'tp thu duc'],
  };

  // Wards de TP. Thủ Đức (pour matcher même si le district est mal renseigné)
  const THU_DUC_WARDS = [
    'an khanh', 'an loi dong', 'an phu', 'binh chieu', 'binh tho', 'binh trung dong', 'binh trung tay',
    'cat lai', 'hiep binh chanh', 'hiep binh phuoc', 'hiep phu', 'linh chieu', 'linh dong',
    'linh tay', 'linh trung', 'linh xuan', 'long binh', 'long phuoc', 'long thanh my',
    'long truong', 'phu huu', 'phuoc binh', 'phuoc long a', 'phuoc long b',
    'tam binh', 'tam phu', 'tan phu', 'tang nhon phu a', 'tang nhon phu b',
    'thao dien', 'thanh my loi', 'thu thiem', 'truong tho', 'truong thanh'
  ];

  if (district) {
    const d = removeVietnameseAccents(district.toLowerCase());
    const aliases = DISTRICT_ALIASES[d] || [d];
    const isSearchingThuDuc = d === 'thu duc' || d === 'quan 2' || d === 'quan 9';
    const beforeCount = filtered.length;
    
    console.log(`District filter: searching "${d}" with aliases: [${aliases.join(', ')}]${isSearchingThuDuc ? ' + Thu Duc wards' : ''}`);
    
    filtered = filtered.filter(item => {
      const itemDistrict = removeVietnameseAccents((item.district || '').toLowerCase());
      const itemWard = removeVietnameseAccents((item.ward || '').toLowerCase());
      
      // Check 1: district field matches any alias
      const districtMatch = aliases.some(alias => itemDistrict.includes(alias));
      if (districtMatch) return true;
      
      // Check 2: for Thu Duc searches, check known wards BUT ONLY if district is empty/Thu Duc
      const districtIsEmpty = !itemDistrict || itemDistrict === 'ho chi minh';
      const districtIsThuDuc = itemDistrict.includes('thu duc') || itemDistrict.includes('quan 2') || itemDistrict.includes('quan 9');
      
      if (isSearchingThuDuc && itemWard && (districtIsEmpty || districtIsThuDuc)) {
        const wardName = itemWard.replace(/^(phuong|xa|thi tran)\s+/i, '').replace(/\s*\(.*\)\s*$/, '').trim();
        const wardMatch = THU_DUC_WARDS.some(w => wardName === w);
        if (wardMatch) return true;
      }
      
      if (itemDistrict || itemWard) {
        console.log(`District filter: "${d}" not in district="${itemDistrict}" ward="${itemWard}" | title: ${removeVietnameseAccents((item.title || '')).substring(0, 30)}`);
      }
      return false;
    });
    console.log(`District filter: "${d}" → ${beforeCount} → ${filtered.length}`);
  }

  if (ward) {
    const w = removeVietnameseAccents(ward.toLowerCase());
    const beforeWard = filtered.length;
    const wardFiltered = filtered.filter(item => {
      const itemWard = removeVietnameseAccents((item.ward || '').toLowerCase());
      const itemTitle = removeVietnameseAccents((item.title || '').toLowerCase());
      const itemAddress = removeVietnameseAccents((item.address || '').toLowerCase());
      const combined = itemWard + ' ' + itemTitle + ' ' + itemAddress;
      return combined.includes(w);
    });
    
    if (wardFiltered.length > 0) {
      filtered = wardFiltered;
      console.log(`Filtre ward "${w}": ${beforeWard} → ${filtered.length}`);
    } else {
      // *** SMART FALLBACK: narrow to former district within TP. Thủ Đức ***
      // Thủ Đức = ancien Q2 + ancien Q9 + ancien QThủĐức
      // Si le ward demandé est dans l'ancien Q2, on ne garde que les wards de l'ancien Q2
      const FORMER_Q2_WARDS = [
        'an phu', 'an khanh', 'an loi dong', 'binh an', 'binh khanh',
        'binh trung dong', 'binh trung tay', 'cat lai',
        'thao dien', 'thanh my loi', 'thu thiem'
      ];
      const FORMER_Q9_WARDS = [
        'hiep phu', 'long binh', 'long phuoc', 'long thanh my', 'long truong',
        'phu huu', 'phuoc binh', 'phuoc long a', 'phuoc long b',
        'tan phu', 'tang nhon phu a', 'tang nhon phu b', 'truong thanh'
      ];
      const FORMER_QTD_WARDS = [
        'binh chieu', 'binh tho', 'hiep binh chanh', 'hiep binh phuoc',
        'linh chieu', 'linh dong', 'linh tay', 'linh trung', 'linh xuan',
        'tam binh', 'tam phu', 'truong tho', 'thu duc'
      ];
      
      // *** WARD NEIGHBORS: voisins géographiques immédiats ***
      const WARD_NEIGHBORS = {
        // Ancien Q2
        'thao dien': ['an phu', 'an khanh', 'thu thiem', 'binh an'],
        'an phu': ['thao dien', 'an khanh', 'binh trung tay', 'binh an', 'thu thiem'],
        'an khanh': ['thao dien', 'an phu', 'thu thiem', 'binh an', 'binh khanh'],
        'thu thiem': ['thao dien', 'an phu', 'an khanh', 'binh khanh', 'an loi dong'],
        'binh an': ['thao dien', 'an phu', 'an khanh', 'binh khanh'],
        'binh khanh': ['thu thiem', 'an khanh', 'binh an', 'cat lai'],
        'thanh my loi': ['binh trung tay', 'binh trung dong', 'cat lai', 'an phu'],
        'binh trung tay': ['an phu', 'thanh my loi', 'binh trung dong'],
        'binh trung dong': ['binh trung tay', 'thanh my loi', 'cat lai'],
        'cat lai': ['binh trung dong', 'thanh my loi', 'binh khanh'],
        // Ancien Q9 - principaux
        'hiep phu': ['tang nhon phu a', 'tang nhon phu b', 'phuoc long b', 'long thanh my'],
        'long truong': ['long thanh my', 'truong thanh', 'long phuoc'],
        'phuoc long b': ['phuoc long a', 'tang nhon phu b', 'hiep phu'],
        // Ancien QTD - principaux
        'linh dong': ['linh tay', 'linh chieu', 'hiep binh chanh'],
        'hiep binh chanh': ['hiep binh phuoc', 'linh dong', 'tam binh', 'linh tay'],
        'hiep binh phuoc': ['hiep binh chanh', 'tam binh', 'tam phu', 'linh xuan'],
        'linh trung': ['linh xuan', 'linh chieu', 'binh tho', 'tam binh'],
      };
      
      // Trouver dans quel ancien district se trouve le ward demandé
      let nearbyWards = null;
      let formerDistrict = null;
      if (FORMER_Q2_WARDS.includes(w)) { nearbyWards = FORMER_Q2_WARDS; formerDistrict = 'ancien Q2'; }
      else if (FORMER_Q9_WARDS.includes(w)) { nearbyWards = FORMER_Q9_WARDS; formerDistrict = 'ancien Q9'; }
      else if (FORMER_QTD_WARDS.includes(w)) { nearbyWards = FORMER_QTD_WARDS; formerDistrict = 'ancien Q.Thủ Đức'; }
      
      if (nearbyWards) {
        // Helper: strip Chotot's ward format "phuong xxx (quan yyy cu)" to just "xxx"
        const cleanWardName = (raw) => {
          return raw
            .replace(/^(phuong|xa|thi tran)\s+/i, '')  // strip prefix
            .replace(/\s*\(.*\)\s*$/, '')                // strip "(quan xxx cu)" suffix
            .trim();
        };
        
        // Helper: word boundary check to avoid "van phuc" matching "an phu"
        const wordBoundaryMatch = (text, ward) => {
          const escaped = ward.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(?:^|\\s|,)${escaped}(?:\\s|,|$)`, 'i');
          return regex.test(text);
        };
        
        // Helper: filter by a set of wards
        const filterByWards = (items, targetWards, label) => {
          return items.filter(item => {
            const itemWard = removeVietnameseAccents((item.ward || '').toLowerCase());
            const itemAddress = removeVietnameseAccents((item.address || '').toLowerCase());
            
            if (itemWard) {
              const wardName = cleanWardName(itemWard);
              if (targetWards.includes(wardName)) {
                console.log(`  ${label} MATCH (ward field): "${wardName}" | src=${item.source}`);
                return true;
              }
            }
            
            if (targetWards.some(nw => nw.length >= 6 && wordBoundaryMatch(itemAddress, nw))) {
              const matched = targetWards.find(nw => nw.length >= 6 && wordBoundaryMatch(itemAddress, nw));
              console.log(`  ${label} MATCH (addr "${matched}"): addr="${itemAddress.substring(0, 50)}" | src=${item.source}`);
              return true;
            }
            
            return false;
          });
        };
        
        // *** TIER 1: Voisins immédiats uniquement ***
        const neighbors = WARD_NEIGHBORS[w];
        let finalResults = null;
        
        if (neighbors && neighbors.length > 0) {
          const neighborWards = [w, ...neighbors];  // le ward demandé + ses voisins
          const neighborResults = filterByWards(filtered, neighborWards, 'NEIGHBOR');
          
          if (neighborResults.length > 0) {
            finalResults = neighborResults;
            // Tag les résultats comme voisins
            neighborResults.forEach(item => { item.wardFallbackLevel = 'neighbor'; });
            console.log(`Filtre ward "${w}": ${beforeWard} → 0 exact → VOISINS [${neighborWards.join(', ')}]: ${neighborResults.length} résultats`);
          } else {
            console.log(`Filtre ward "${w}": ${beforeWard} → 0 exact → VOISINS [${neighborWards.join(', ')}]: 0 résultats`);
          }
        }
        
        // *** TIER 2: Si 0 voisins, élargir à l'ancien district ***
        if (!finalResults) {
          const districtResults = filterByWards(filtered, nearbyWards, 'FALLBACK');
          
          // Log les rejets pour debug
          filtered.forEach(item => {
            const itemWard = removeVietnameseAccents((item.ward || '').toLowerCase());
            const itemAddress = removeVietnameseAccents((item.address || '').toLowerCase());
            if (itemWard) {
              const wardName = cleanWardName(itemWard);
              if (!nearbyWards.includes(wardName)) {
                console.log(`  FALLBACK REJECT: ward="${itemWard}" addr="${itemAddress.substring(0, 50)}" | src=${item.source}`);
              }
            }
          });
          
          if (districtResults.length > 0) {
            finalResults = districtResults;
            districtResults.forEach(item => { item.wardFallbackLevel = 'former_district'; });
            console.log(`Filtre ward "${w}": ${beforeWard} → 0 exact, 0 voisins → FALLBACK ${formerDistrict}: ${districtResults.length} résultats`);
          } else {
            console.log(`Filtre ward "${w}": ${beforeWard} → 0 exact, FALLBACK ${formerDistrict} → 0 aussi (on garde les ${beforeWard} résultats du district)`);
          }
        }
        
        if (finalResults) {
          filtered = finalResults;
        }
      } else {
        // Ward pas dans Thu Duc → fallback classique, garder tout
        console.log(`Filtre ward "${w}": ${beforeWard} → 0 (FALLBACK: on garde les ${beforeWard} résultats du district)`);
      }
      filtered.forEach(item => { item.wardFilterFallback = true; });
    }
  }
  
  if (livingAreaMin) {
    const before = filtered.length;
    filtered = filtered.filter(item => (item.area || 0) >= parseInt(livingAreaMin));
    console.log(`Filtre surface min (≥${livingAreaMin}m²): ${before} → ${filtered.length}`);
  }
  
  if (livingAreaMax) {
    const before = filtered.length;
    filtered = filtered.filter(item => {
      const area = item.area || 0;
      return area > 0 && area <= parseInt(livingAreaMax);
    });
    console.log(`Filtre surface max (≤${livingAreaMax}m²): ${before} → ${filtered.length}`);
  }
  
  if (bedrooms) {
    const before = filtered.length;
    filtered = filtered.filter(item => item.bedrooms >= parseInt(bedrooms));
    console.log(`Filtre chambres (≥${bedrooms}): ${before} → ${filtered.length}`);
  }
  
  if (legalStatus) {
    const before = filtered.length;
    filtered = filtered.filter(item => {
      if (legalStatus === 'sohong') return item.legalStatus === 'Sổ đỏ/Sổ hồng';
      if (legalStatus === 'hopdong') return item.legalStatus === 'Hợp đồng mua bán';
      if (legalStatus === 'dangcho') return item.legalStatus === 'Đang chờ sổ';
      return true;
    });
    console.log(`Filtre statut légal "${legalStatus}": ${before} → ${filtered.length}`);
  }

  if (propertyType) {
    const typeMapping = getPropertyTypeMapping(propertyType);
    const excludeKw = typeMapping.exclude || [];
    
    const beforeType = filtered.length;
    filtered = filtered.filter(item => {
      const title = removeVietnameseAccents((item.title || '').toLowerCase());
      const itemType = removeVietnameseAccents((item.propertyType || '').toLowerCase());
      const combined = title + ' ' + itemType;
      
      for (const kw of excludeKw) {
        if (combined.includes(removeVietnameseAccents(kw))) {
          return false;
        }
      }
      return true;
    });
    console.log(`Filtre propertyType: ${beforeType} → ${filtered.length}`);
  }

  if (streetWidthMin) {
    filtered = filtered.filter(item => {
      if (!item.streetWidth) return false;
      return item.streetWidth >= parseFloat(streetWidthMin);
    });
  }
  
  return filtered;
}

function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/bán\s*gấp|cần\s*bán|bán\s*nhanh|bán/g, '')
    .replace(/căn\s*hộ|chung\s*cư|apartment/g, '')
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '')
    .substring(0, 30);
}

function deduplicateResults(results) {
  const seen = new Set();
  return results.filter(item => {
    const key = `${normalizeTitle(item.title)}_${Math.round((item.price || 0) / 500000000)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const URGENT_KEYWORDS = [
  { pattern: /bán\s*gấp/i, weight: 25, label: 'Bán gấp' },
  { pattern: /cần\s*bán\s*gấp/i, weight: 25, label: 'Cần bán gấp' },
  { pattern: /cần\s*bán\s*nhanh/i, weight: 20, label: 'Cần bán nhanh' },
  { pattern: /cần\s*bán(?!\s*(gấp|nhanh))/i, weight: 15, label: 'Cần bán' },
  { pattern: /kẹt\s*tiền/i, weight: 25, label: 'Kẹt tiền' },
  { pattern: /cần\s*tiền/i, weight: 20, label: 'Cần tiền' },
  { pattern: /ngộp\s*bank/i, weight: 25, label: 'Ngộp bank' },
  { pattern: /thanh\s*lý/i, weight: 20, label: 'Thanh lý' },
  { pattern: /bán\s*lỗ/i, weight: 25, label: 'Bán lỗ' },
  { pattern: /giá\s*rẻ/i, weight: 15, label: 'Giá rẻ' },
  { pattern: /giá\s*tốt/i, weight: 10, label: 'Giá tốt' },
  { pattern: /bán\s*nhanh/i, weight: 15, label: 'Bán nhanh' },
  { pattern: /chính\s*chủ/i, weight: 10, label: 'Chính chủ' },
  { pattern: /cắt\s*lỗ/i, weight: 25, label: 'Cắt lỗ' },
  { pattern: /hạ\s*giá/i, weight: 20, label: 'Hạ giá' },
  { pattern: /lỗ\s*vốn/i, weight: 20, label: 'Lỗ vốn' },
];

function calculateNegotiationScore(item, avgPricePerM2) {
  let score = 0;
  const details = {
    urgentKeywords: [],
    priceAnalysis: null,
    listingAge: null,
    photoAnalysis: null,
    priceType: null,
    legalStatus: null,
    nlpFactors: []
  };
  
  const title = (item.title || '').toLowerCase();
  const body = (item.body || '').toLowerCase();
  
  let maxUrgentWeight = 0;
  for (const kw of URGENT_KEYWORDS) {
    if (kw.pattern.test(title) || kw.pattern.test(body)) {
      details.urgentKeywords.push(kw.label);
      if (kw.weight > maxUrgentWeight) {
        maxUrgentWeight = kw.weight;
      }
    }
  }
  score += maxUrgentWeight;
  
  if (item.area > 0 && item.price > 0 && avgPricePerM2 > 0) {
    const itemPricePerM2 = item.price / item.area;
    const priceDiff = ((avgPricePerM2 - itemPricePerM2) / avgPricePerM2) * 100;
    
    details.priceAnalysis = {
      itemPricePerM2: Math.round(itemPricePerM2),
      avgPricePerM2: Math.round(avgPricePerM2),
      diffPercent: Math.round(priceDiff),
    };
    
    if (priceDiff >= 20) {
      score += 25;
      details.priceAnalysis.verdict = 'excellent';
    } else if (priceDiff >= 10) {
      score += 20;
      details.priceAnalysis.verdict = 'good';
    } else if (priceDiff >= 5) {
      score += 10;
      details.priceAnalysis.verdict = 'fair';
    } else if (priceDiff >= 0) {
      score += 5;
      details.priceAnalysis.verdict = 'average';
    } else {
      details.priceAnalysis.verdict = 'above_average';
    }
  }
  
  const listTime = item.list_time || 0;
  let daysOnline = 0;
  
  if (listTime > 0) {
    const listTimeMs = listTime > 10000000000 ? listTime : listTime * 1000;
    daysOnline = Math.floor((Date.now() - listTimeMs) / (1000 * 60 * 60 * 24));
    if (daysOnline < 0 || daysOnline > 3650) {
      daysOnline = 0;
    }
  }
  
  details.listingAge = { days: daysOnline };
  
  if (daysOnline > 60) {
    score += 20;
    details.listingAge.verdict = 'very_old';
  } else if (daysOnline > 30) {
    score += 15;
    details.listingAge.verdict = 'old';
  } else if (daysOnline > 14) {
    score += 5;
    details.listingAge.verdict = 'moderate';
  } else {
    details.listingAge.verdict = 'fresh';
  }
  
  const numPhotos = (item.images || []).length || (item.thumbnail ? 1 : 0);
  details.photoAnalysis = { count: numPhotos };
  
  if (numPhotos === 0) {
    score += 10;
    details.photoAnalysis.verdict = 'none';
  } else if (numPhotos <= 2) {
    score += 5;
    details.photoAnalysis.verdict = 'few';
  } else {
    details.photoAnalysis.verdict = 'good';
  }
  
  const priceInBillion = item.price / 1000000000;
  const isRoundPrice = priceInBillion === Math.floor(priceInBillion) || 
                       (priceInBillion * 10) === Math.floor(priceInBillion * 10);
  
  if (isRoundPrice && priceInBillion >= 1) {
    score += 5;
    details.priceType = 'round';
  } else {
    details.priceType = 'precise';
  }
  
  if (item.legalStatus) {
    if (item.legalStatus === 'Sổ đỏ/Sổ hồng') {
      score += 15;
      details.legalStatus = { status: item.legalStatus, verdict: 'excellent' };
    } else if (item.legalStatus === 'Hợp đồng mua bán') {
      score += 8;
      details.legalStatus = { status: item.legalStatus, verdict: 'good' };
    } else if (item.legalStatus === 'Đang chờ sổ') {
      score += 3;
      details.legalStatus = { status: item.legalStatus, verdict: 'pending' };
    }
  } else {
    details.legalStatus = { status: null, verdict: 'unknown' };
  }
  
  if (item.hasMetroNearby) {
    score += 10;
    details.nlpFactors.push({ type: 'bonus', label: '🚇 Gần Metro', points: 10 });
  }
  
  if (item.hasNewRoad) {
    score += 8;
    details.nlpFactors.push({ type: 'bonus', label: '🛣️ Sắp mở đường', points: 8 });
  }
  
  if (item.hasInvestmentPotential) {
    score += 5;
    details.nlpFactors.push({ type: 'bonus', label: '📈 Tiềm năng đầu tư', points: 5 });
  }
  
  if (item.hasLegalIssue) {
    score -= 15;
    details.nlpFactors.push({ type: 'malus', label: '⚠️ Chưa có sổ', points: -15 });
  }
  
  if (item.hasPlanningRisk) {
    score -= 15;
    details.nlpFactors.push({ type: 'malus', label: '🚨 Rủi ro quy hoạch', points: -15 });
  }
  
  const finalScore = Math.min(100, Math.max(0, score));
  
  let negotiationLevel;
  if (finalScore >= 70) {
    negotiationLevel = 'excellent';
  } else if (finalScore >= 50) {
    negotiationLevel = 'good';
  } else if (finalScore >= 30) {
    negotiationLevel = 'moderate';
  } else {
    negotiationLevel = 'low';
  }
  
  return {
    score: finalScore,
    level: negotiationLevel,
    details,
  };
}

function calculateDistrictStats(results) {
  const districtData = {};
  
  for (const item of results) {
    const district = (item.district || 'unknown').toLowerCase().trim();
    if (!district || district === 'unknown') continue;
    
    const area = item.area || item.floorAreaSqm || 0;
    const price = item.price || 0;
    
    if (area > 0 && price > 0) {
      if (!districtData[district]) {
        districtData[district] = {
          prices: [],
          pricesPerM2: [],
          count: 0
        };
      }
      
      const pricePerM2 = price / area;
      districtData[district].prices.push(price);
      districtData[district].pricesPerM2.push(pricePerM2);
      districtData[district].count++;
    }
  }
  
  const districtStats = {};
  
  for (const [district, data] of Object.entries(districtData)) {
    if (data.count < 3) continue;
    
    const sortedPrices = [...data.pricesPerM2].filter(p => p > 1).sort((a, b) => a - b);
    const count = sortedPrices.length;
    
    const p25Index = Math.floor(count * 0.25);
    const p75Index = Math.floor(count * 0.75);
    const medianIndex = Math.floor(count * 0.5);
    
    districtStats[district] = {
      count: data.count,
      avgPricePerM2: Math.round(data.pricesPerM2.reduce((a, b) => a + b, 0) / count),
      medianPricePerM2: Math.round(sortedPrices[medianIndex]),
      minPricePerM2: Math.round(sortedPrices[0]),
      maxPricePerM2: Math.round(sortedPrices[count - 1]),
      lowRange: Math.round(sortedPrices[p25Index]),
      highRange: Math.round(sortedPrices[p75Index]),
    };
  }
  
  return districtStats;
}

function analyzePricePosition(item, districtStats) {
  const district = (item.district || '').toLowerCase().trim();
  const area = item.area || item.floorAreaSqm || 0;
  const price = item.price || 0;
  
  if (!district || area <= 0 || price <= 0 || !districtStats[district]) {
    return null;
  }
  
  const stats = districtStats[district];
  const itemPricePerM2 = price / area;
  
  let position, verdict, percentFromMedian;
  
  percentFromMedian = Math.round(((itemPricePerM2 - stats.medianPricePerM2) / stats.medianPricePerM2) * 100);
  
  if (itemPricePerM2 < stats.lowRange) {
    position = 'below';
    verdict = 'Dưới giá thị trường';
  } else if (itemPricePerM2 > stats.highRange) {
    position = 'above';
    verdict = 'Cao hơn giá thị trường';
  } else {
    position = 'within';
    verdict = 'Giá hợp lý';
  }
  
  return {
    itemPricePerM2: Math.round(itemPricePerM2),
    districtAvg: stats.avgPricePerM2,
    districtMedian: stats.medianPricePerM2,
    districtLowRange: stats.lowRange,
    districtHighRange: stats.highRange,
    districtMin: stats.minPricePerM2,
    districtMax: stats.maxPricePerM2,
    districtCount: stats.count,
    position,
    verdict,
    percentFromMedian,
  };
}

// ============================================
// VERCEL HANDLER (export default)
// ============================================
export default async function handler(req, res) {

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city, district, ward, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, sources, sortBy, keywords, keywordsOnly, legalStatus, maxResults } = req.body || {};

  console.log('=== NOUVELLE RECHERCHE V5 ===');
  console.log('[DEBUG] maxResults =', maxResults);
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax, sortBy, sources, keywords, keywordsOnly }));

  try {
    console.log('--- DEBUG SOURCES ---');
    console.log('SOURCES PARAM =', sources);

    // Récupérer les stats archive en parallèle des recherches
    const [archiveStats, totalArchive, ...sourceResults] = await Promise.all([
      getArchiveStatsByDistrict(city, propertyType),
      getTotalArchiveByDistrict(city),
      // Sources actives : Chotot + Alonhadat
      ...(sources?.includes('chotot') ? [
        fetchChotot({ city, district, ward, priceMin, priceMax, sortBy, propertyType, maxResults })
          .then(results => ({ source: 'chotot', results }))
          .catch(e => { console.log(`Chotot erreur: ${e.message}`); return { source: 'chotot', results: [] }; })
      ] : []),
      ...(sources?.includes('alonhadat') ? [
        fetchAlonhadat({ city, district, ward, propertyType, priceMax, maxResults })
.then(results => ({ source: 'alonhadat', results: results.map(r => {
              const nlpAnalysis = analyzeListingText(r.title || '', r.body || r.description || '');
              return {
                ...r,
                nlpAnalysis,
floors: r.floors || nlpAnalysis.extractedFloors,
streetWidth: r.streetWidth || nlpAnalysis.extractedStreetWidth,
facadeWidth: r.facadeWidth || nlpAnalysis.extractedFacade,
area: r.area || nlpAnalysis.extractedArea,
bedrooms: r.bedrooms || nlpAnalysis.extractedBedrooms,
bathrooms: r.bathrooms || nlpAnalysis.extractedBathrooms,
direction: r.direction || nlpAnalysis.extractedDirection,
legalStatus: r.legalStatus || (nlpAnalysis.extractedLegalStatus === 'so_hong_rieng' ? 'Sổ hồng riêng' : nlpAnalysis.extractedLegalStatus === 'so_hong' ? 'Sổ hồng/Sổ đỏ' : nlpAnalysis.extractedLegalStatus === 'hop_dong' ? 'Hợp đồng mua bán' : nlpAnalysis.extractedLegalStatus === 'gpxd' ? 'GPXD' : nlpAnalysis.extractedLegalStatus === 'giay_tay' ? 'Giấy tay' : nlpAnalysis.extractedLegalStatus === 'cho_so' ? 'Đang chờ sổ' : null),
hasMetroNearby: nlpAnalysis.hasMetroNearby,
hasNewRoad: nlpAnalysis.hasNewRoad,
hasInvestmentPotential: nlpAnalysis.hasInvestmentPotential,
hasLegalIssue: nlpAnalysis.hasLegalIssue,
hasPlanningRisk: nlpAnalysis.hasPlanningRisk,
              };
            }) }))
          .catch(e => { console.log(`Alonhadat erreur: ${e.message}`); return { source: 'alonhadat', results: [] }; })
      ] : [])
    ]);

    let allResults = [];
    console.log(
      'SOURCES AVANT TOUT FILTRAGE',
      sourceResults.map(s => ({
        source: s.source,
        count: s.results?.length || 0
      }))
    );



    const perSourceLimit = (ward && district) ? 1000 : (maxResults || 200);

    for (const { source, results: srcResults } of sourceResults) {
      if (Array.isArray(srcResults) && srcResults.length > 0) {
        let toKeep = srcResults;
        
        // *** FIX: Si un district est spécifié, pré-filtrer par district AVANT la limite ***
        // Sinon on perd des annonces du district recherché dans la masse
        if (district) {
          const d = removeVietnameseAccents(district.toLowerCase());
          const DISTRICT_ALIASES_PREFILT = {
            'thu duc': ['thu duc', 'thanh pho thu duc', 'tp thu duc', 'tp. thu duc', 'quan 2', 'quan 9', 'quan thu duc'],
            'quan 2': ['quan 2', 'thu duc', 'thanh pho thu duc', 'tp thu duc'],
            'quan 9': ['quan 9', 'thu duc', 'thanh pho thu duc', 'tp thu duc'],
          };
          const aliases = DISTRICT_ALIASES_PREFILT[d] || [d];
          
          const districtFiltered = srcResults.filter(item => {
            const itemDistrict = removeVietnameseAccents((item.district || '').toLowerCase());
            const itemWard = removeVietnameseAccents((item.ward || '').toLowerCase());
            
            // Check 1: district field matches any alias
            if (aliases.some(alias => itemDistrict.includes(alias))) return true;
            
            // Check 2: for Thu Duc, check known wards BUT ONLY if district is empty or already Thu Duc
            // (avoid false positives: "Tân Phú" ward exists in both Q7 and Thủ Đức)
            const isSearchingThuDuc = d === 'thu duc' || d === 'quan 2' || d === 'quan 9';
            const districtIsEmpty = !itemDistrict || itemDistrict === 'ho chi minh';
            const districtIsThuDuc = itemDistrict.includes('thu duc') || itemDistrict.includes('quan 2') || itemDistrict.includes('quan 9');
            
            if (isSearchingThuDuc && itemWard && (districtIsEmpty || districtIsThuDuc)) {
              const THU_DUC_WARDS_PRE = [
                'an khanh', 'an loi dong', 'an phu', 'binh chieu', 'binh tho', 'binh trung dong', 'binh trung tay',
                'cat lai', 'hiep binh chanh', 'hiep binh phuoc', 'hiep phu', 'linh chieu', 'linh dong',
                'linh tay', 'linh trung', 'linh xuan', 'long binh', 'long phuoc', 'long thanh my',
                'long truong', 'phu huu', 'phuoc binh', 'phuoc long a', 'phuoc long b',
                'tam binh', 'tam phu', 'tan phu', 'tang nhon phu a', 'tang nhon phu b',
                'thao dien', 'thanh my loi', 'thu thiem', 'truong tho', 'truong thanh', 'thu duc'
              ];
              const wardName = itemWard.replace(/^(phuong|xa|thi tran)\s+/i, '').replace(/\s*\(.*\)\s*$/, '').trim();
              if (THU_DUC_WARDS_PRE.some(w => wardName === w)) return true;
            }
            
            return false;
          });
          
          console.log(`${source}: pré-filtre district "${d}": ${srcResults.length} → ${districtFiltered.length}`);
          toKeep = districtFiltered;
        }
        
        const limited = toKeep.slice(0, perSourceLimit);
        allResults.push(...limited);
        console.log(`${source}: ${srcResults.length} brut → ${limited.length} gardés (limit ${perSourceLimit})`);
      }
    }

    console.log(`TOTAL BRUT: ${allResults.length}`);
    
    let unique = deduplicateResults(allResults);

    unique = applyFilters(unique, { 
      city, district, ward, priceMin, priceMax, 
      livingAreaMin, livingAreaMax, bedrooms, legalStatus,
      propertyType
    });
    console.log(`Après applyFilters: ${unique.length} résultats`);

    const sourceCountAfterFilter = {};
    unique.forEach(r => {
      const src = r.source || 'unknown';
      sourceCountAfterFilter[src] = (sourceCountAfterFilter[src] || 0) + 1;
    });
    console.log('SOURCES APRÈS FILTRAGE:', sourceCountAfterFilter);
    const districtStats = calculateDistrictStats(unique);
    console.log(`Stats districts calculées: ${Object.keys(districtStats).length} districts`);
    
    if (keywordsOnly) {
      const before = unique.length;
      const keywordsToUse = [
        'ban gap', 'ban nhanh', 'can ban gap', 'can ban nhanh', 'can ban',
        'ket tien', 'can tien', 'ngop bank', 'ngop ngan hang',
        'gia re', 'chinh chu', 'mien trung gian',
        'gia thuong luong', 'ban lo', 'cat lo', 'ha gia', 'thanh ly',
        'gap', 'nhanh', 'lo von', 'gia tot'
      ];
      
      unique = unique.filter(item => {
        const title = removeVietnameseAccents((item.title || '').toLowerCase());
        const body = removeVietnameseAccents((item.body || '').toLowerCase());
        const combined = ' ' + title + ' ' + body + ' ';
        
        return keywordsToUse.some(kw => {
          if (kw.length <= 4) {
            return combined.includes(' ' + kw + ' ') || 
                   combined.includes(' ' + kw + ',') || 
                   combined.includes(' ' + kw + '.');
          }
          return combined.includes(kw);
        });
      });
      
      console.log(`Filtre keywordsOnly: ${before} → ${unique.length}`);
    }

    if (keywords && Array.isArray(keywords) && keywords.length > 0) {
      const before = unique.length;
      
      const KEYWORD_PATTERNS = {
        'urgent sale': ['ban gap'],
        'quick sale': ['ban nhanh'],
        'need quick sale': ['can ban nhanh', 'can ban gap'],
        'need money': ['ket tien'],
        'need cash': ['can tien'],
        'cheap price': ['gia re', 'gia tot'],
        'bank pressure': ['ngop bank', 'ngop ngan hang'],
        'direct owner': ['chinh chu'],
        'no agent': ['mien trung gian', 'khong qua moi gioi'],
        'negotiable price': ['gia thuong luong'],
        'selling at loss': ['ban lo', 'cat lo', 'lo von', 'ha gia'],
        'bán gấp': ['ban gap'],
        'bán nhanh': ['ban nhanh'],
        'cần bán nhanh': ['can ban nhanh', 'can ban gap'],
        'kẹt tiền': ['ket tien'],
        'cần tiền': ['can tien'],
        'giá rẻ': ['gia re', 'gia tot'],
        'ngộp bank': ['ngop bank', 'ngop ngan hang'],
        'chính chủ': ['chinh chu'],
        'miễn trung gian': ['mien trung gian', 'khong qua moi gioi'],
        'giá thương lượng': ['gia thuong luong'],
        'bán lỗ': ['ban lo', 'cat lo', 'lo von', 'ha gia'],
      };
      
      const patternsToMatch = [];
      for (const kw of keywords) {
        const patterns = KEYWORD_PATTERNS[kw.toLowerCase()];
        if (patterns) {
          patternsToMatch.push(...patterns);
        }
      }

      if (patternsToMatch.length > 0) {
        const PATTERN_TO_LABEL = {
          'ban gap': 'Bán gấp',
          'ban nhanh': 'Bán nhanh',
          'can ban nhanh': 'Cần bán nhanh',
          'can ban gap': 'Cần bán gấp',
          'ket tien': 'Kẹt tiền',
          'can tien': 'Cần tiền',
          'gia re': 'Giá rẻ',
          'gia tot': 'Giá tốt',
          'ngop bank': 'Ngộp bank',
          'ngop ngan hang': 'Ngộp ngân hàng',
          'chinh chu': 'Chính chủ',
          'mien trung gian': 'Miễn trung gian',
          'khong qua moi gioi': 'Không qua môi giới',
          'gia thuong luong': 'Giá thương lượng',
          'ban lo': 'Bán lỗ',
          'cat lo': 'Cắt lỗ',
          'lo von': 'Lỗ vốn',
          'ha gia': 'Hạ giá'
        };

        unique = unique.map(item => {
          const title = removeVietnameseAccents((item.title || '').toLowerCase());
          const body = removeVietnameseAccents((item.body || '').toLowerCase());
          const combined = ' ' + title + ' ' + body + ' ';

          const matched = patternsToMatch.filter(p => combined.includes(p));

          if (matched.length > 0) {
            item.matchedKeywords = matched.map(p => PATTERN_TO_LABEL[p] || p);
          }
          return item;
        });

        if (keywordsOnly) {
          const before = unique.length;
          unique = unique.filter(item => item.matchedKeywords && item.matchedKeywords.length > 0);
          console.log(`Filtre keywordsOnly: ${before} → ${unique.length}`);
        }
      }
    }

    let sortedResults = [...unique];

    const sourceCounts = {};
    sortedResults.slice(0, 300).forEach(r => {
      sourceCounts[r.source] = (sourceCounts[r.source] || 0) + 1;
    });
    console.log('SOURCES DANS FINAL:', sourceCounts);
    
    const validPricePerM2 = sortedResults
      .filter(item => item.area > 0 && item.price > 0)
      .map(item => item.price / item.area);
    const avgPricePerM2 = validPricePerM2.length > 0 
      ? validPricePerM2.reduce((a, b) => a + b, 0) / validPricePerM2.length 
      : 50000000;

    const avgPricePerM2ForScore = avgPricePerM2 || 50000000;
    sortedResults = sortedResults.map(item => {
      const scoreData = calculateNegotiationScore(item, avgPricePerM2ForScore);
      return {
        ...item,
        negotiationScore: scoreData.score,
        negotiationLevel: scoreData.level,
        scoreDetails: scoreData.details
      };
    });

    if (sortBy === 'price_asc') {
      sortedResults.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_desc') {
      sortedResults.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'score_desc' || !sortBy) {
      sortedResults.sort((a, b) => (b.negotiationScore || 0) - (a.negotiationScore || 0));
    }

    const surfaceDebug = sortedResults.slice(0, 5).map(r => ({
      source: r.source,
      area: r.area,
      floorAreaSqm: r.floorAreaSqm,
      title: r.title?.substring(0, 30)
    }));
    console.log('SURFACE DEBUG:', JSON.stringify(surfaceDebug));

    const results = sortedResults.slice(0, maxResults || 200).map((item, i) => {
      const districtKey = (item.district || '').toLowerCase().trim();
      const pricePosition = analyzePricePosition(item, districtStats);

      return {
        id: item.id || i,
        title: item.title || 'Sans titre',
        price: item.price || 0,
        area: item.area || item.floorAreaSqm || 0,
        source: item.source || 'unknown',
        url: item.url || '#',
        imageUrl: item.thumbnail || '',
        district: item.district || null,
        ward: item.ward || null,
        city: item.city || null,
        postedOn: item.postedOn || null,
        bedrooms: item.bedrooms || null,
        bathrooms: item.bathrooms || null,
        floors: item.floors || null,
        pricePerSqm: item.pricePerSqm || item.pricePerM2 || null,
        legalStatus: item.legalStatus || null,
        direction: item.direction || null,
        streetWidth: item.streetWidth || null,
        facadeWidth: item.facadeWidth || null,
        propertyType: item.propertyType || null,
        address: item.address || null,
        score: item.negotiationScore || item.score || 0,
        matchedKeywords: item.matchedKeywords || [],
        scoreDetails: item.scoreDetails || null,
        pricePosition: pricePosition,
        negotiationLevel: item.negotiationLevel || null,
      };
    });

    const maxAllowed = priceMax ? priceMax * 1_000_000_000 : Infinity;
    const prices = results
      .map(r => r.price)
      .filter(p => p > 0 && p <= maxAllowed);

    const stats = {
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      highestPrice: prices.length ? Math.max(...prices) : 0,
      avgPricePerSqm: Math.round(avgPricePerM2),
      totalResults: results.length,
      totalAvailable: unique.length,
    };

    // ============================================
    // MARKET STATS AVEC ARCHIVE ET TRENDS
    // ============================================
    const marketStats = Object.entries(districtStats).map(([district, data]) => {
      const districtLower = district.toLowerCase();
      const archiveData = archiveStats[districtLower] || null;
      const archiveCount = totalArchive[districtLower] || 0;
      
      // Trend DÉSACTIVÉ - Besoin de 6+ mois de données
      let trend = null;
      let trendPercent = null;

      if (false && archiveData && archiveData.avgPricePerM2 > 0 && archiveData.count >= 500) {
        const currentAvg = data.avgPricePerM2;
        const archiveAvg = archiveData.avgPricePerM2;
        trendPercent = Math.round(((currentAvg - archiveAvg) / archiveAvg) * 100);
        
        if (trendPercent > 2) {
          trend = 'up';
        } else if (trendPercent < -2) {
          trend = 'down';
        } else {
          trend = 'stable';
        }
      }
      
      return {
        district: district.charAt(0).toUpperCase() + district.slice(1),
        count: data.count,
        avgPricePerM2: data.avgPricePerM2,
        medianPricePerM2: data.medianPricePerM2,
        minPricePerM2: data.minPricePerM2,
        maxPricePerM2: data.maxPricePerM2,
        archiveCount: archiveCount,
        trend: trend,
        trendPercent: trendPercent,
      };
    }).sort((a, b) => b.count - a.count);

    console.log(`FINAL: ${results.length} résultats, ${marketStats.length} districts`);
    
    // Dédupliquer par id avant sauvegarde Supabase
    const uniqueMap = new Map();
    for (const item of sortedResults.slice(0, 500)) {
      if (item.id && !uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }
    const uniqueResults = Array.from(uniqueMap.values());
    console.log(`Supabase: ${uniqueResults.length} uniques sur ${sortedResults.length} total`);

    try {
      await saveListingsToSupabase(uniqueResults);
      console.log('Supabase: sauvegarde OK');
    } catch (err) {
      console.error('Erreur sauvegarde Supabase:', err.message);
    }
    
    return res.status(200).json({ success: true, results, stats, marketStats });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message, results: [], stats: {} });
  }
}
