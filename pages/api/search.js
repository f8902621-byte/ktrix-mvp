// ============================================
// KTRIX - API SEARCH V5 (Vercel Compatible)
// Version V5 — Chotot + Alonhadat + Market Stats
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
    'quan 2': '13002', '2': '13002',
    'quan 3': '13003', '3': '13003',
    'quan 4': '13004', '4': '13004',
    'quan 5': '13005', '5': '13005',
    'quan 6': '13006', '6': '13006',
    'quan 7': '13007', '7': '13007',
    'quan 8': '13008', '8': '13008',
    'quan 9': '13009', '9': '13009',
    'quan 10': '13010', '10': '13010',
    'quan 11': '13011', '11': '13011',
    'quan 12': '13012', '12': '13012',
    'binh tan': '13013',
    'binh thanh': '13014',
    'go vap': '13015',
    'phu nhuan': '13016',
    'tan binh': '13017',
    'tan phu': '13018',
    'thu duc': '13019', 'thanh pho thu duc': '13019', 'tp thu duc': '13019', 'tp. thu duc': '13019',
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

  return analysis;
}

// ============================================
// MAPPING UNIVERSEL DES TYPES DE BIENS
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
    include: ['nhà riêng', 'nhà ở', 'nhà phố'],
    exclude: ['biệt thự', 'villa', 'nghỉ dưỡng', 'resort']
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
    include: ['shophouse', 'nhà phố thương mại'],
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

  // Filtre par district DÉSACTIVÉ - codes Chotot obsolètes depuis fusion Thủ Đức 2021
  const districtCode = getChototDistrictCode(regionCode, district);
  if (districtCode) {
    console.log(`Chotot: district="${district}" → area_v2=${districtCode} (SKIP - filtrage post-requête)`);
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
  const maxPages = Math.ceil((params.maxResults || 200) / 50);
  const offsets = [0, 50, 100, 150, 200, 250].slice(0, maxPages);
  console.log(`Chotot URL DEBUG: https://gateway.chotot.com/v1/public/ad-listing?${baseParams.toString()}&o=0`);
  
  for (const offset of offsets) {
    try {
      const url = `https://gateway.chotot.com/v1/public/ad-listing?${baseParams}&o=${offset}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.ads && data.ads.length > 0) {
        allAds.push(...data.ads);
        console.log(`Chotot offset=${offset}: +${data.ads.length} (total API: ${data.total})`);
      } else {
        break;
      }
    } catch (error) {
      console.error(`Chotot error offset=${offset}:`, error.message);
    }
  }
  
  console.log(`Chotot TOTAL brut: ${allAds.length} annonces`);
  
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

  return results;
}

// ============================================
// ALONHADAT SCRAPER AVEC PAGINATION
// ============================================
async function fetchAlonhadat(params) {
  const { city, district, ward, propertyType, priceMax, maxResults } = params;
  
  if (!SCRAPER_API_KEY) {
    console.log('Alonhadat: SCRAPER_API_KEY non configuré, skip');
    return [];
  }
  
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

  const maxPages = maxResults >= 200 ? 3 : maxResults >= 100 ? 2 : 1;
  
  console.log(`Alonhadat: scraping ${maxPages} pages`);
  
  let allListings = [];
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const targetUrl = page === 1 
        ? `https://alonhadat.com.vn/can-ban-${typeSlug}/${citySlug}`
        : `https://alonhadat.com.vn/can-ban-${typeSlug}/${citySlug}/trang-${page}`;
      
      const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true`;
      
      console.log(`Alonhadat page ${page}: ${targetUrl}`);
      
      const response = await fetch(scraperUrl);
      if (!response.ok) {
        console.log(`Alonhadat page ${page}: HTTP ${response.status}`);
        break;
      }
      
      const html = await response.text();
      const listings = parseAlonhadatHtml(html, city);
      
      console.log(`Alonhadat page ${page}: ${listings.length} annonces`);
      
      if (listings.length === 0) break;
      
      allListings.push(...listings);
      
      if (page < maxPages) {
        await new Promise(r => setTimeout(r, 500));
      }
      
    } catch (error) {
      console.log(`Alonhadat page ${page} erreur: ${error.message}`);
      break;
    }
  }
  
  console.log(`Alonhadat TOTAL: ${allListings.length} annonces`);
  
  // FALLBACK: si trop peu de résultats, relancer en "nha-dat"
  if (allListings.length < 10 && typeSlug !== 'nha-dat') {
    console.log(`Alonhadat: seulement ${allListings.length} résultats pour "${typeSlug}", fallback → nha-dat`);
    
    for (let page = 1; page <= 2; page++) {
      try {
        const fallbackUrl = page === 1
          ? `https://alonhadat.com.vn/can-ban-nha-dat/${citySlug}`
          : `https://alonhadat.com.vn/can-ban-nha-dat/${citySlug}/trang-${page}`;
        
        const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(fallbackUrl)}&render=true`;
        const response = await fetch(scraperUrl);
        if (!response.ok) break;
        
        const html = await response.text();
        const listings = parseAlonhadatHtml(html, city);
        if (listings.length === 0) break;
        
        allListings.push(...listings);
        if (page < 2) await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        break;
      }
    }
    console.log(`Alonhadat après fallback: ${allListings.length} annonces`);
  }
  
  return allListings;
}

function parseAlonhadatHtml(html, city) {
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
      listing.district = localityMatch ? localityMatch[1].trim() : '';
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
    
    console.log(`[ALONHADAT DETAIL] ${listing.title?.substring(0, 30)} → Legal: ${listing.legalStatus || '?'}`);
    
  } catch (e) {
    console.log(`[ALONHADAT DETAIL ERROR] ${e.message}`);
  }
  
  return listing;
}

async function enrichTopAlonhadatListings(listings, maxEnrich = 10) {
  const alonhadatWithoutLegal = listings.filter(l => 
    l.source === 'alonhadat' && !l.legalStatus
  );
  
  const toEnrich = alonhadatWithoutLegal.slice(0, maxEnrich);
  
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
  
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => {
      return item.price >= min;
    });
  }
  
  if (priceMax) {
    const maxTy = parseFloat(priceMax);

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
  }

  if (district) {
    const d = removeVietnameseAccents(district.toLowerCase());
    const beforeCount = filtered.length;
    filtered = filtered.filter(item => {
      const itemDistrict = removeVietnameseAccents((item.district || '').toLowerCase());
      const itemTitle = removeVietnameseAccents((item.title || '').toLowerCase());
      const itemAddress = removeVietnameseAccents((item.address || '').toLowerCase());
      const combined = itemDistrict + ' ' + itemTitle + ' ' + itemAddress;
      const matches = combined.includes(d);
      if (!matches && itemDistrict) {
        console.log(`District filter: "${d}" not in "${itemDistrict}" | title: ${itemTitle.substring(0, 30)}`);
      }
      return matches;
    });
    console.log(`District filter: "${d}" → ${beforeCount} → ${filtered.length}`);
  }

  if (ward) {
    const w = removeVietnameseAccents(ward.toLowerCase());
    filtered = filtered.filter(item => {
      const itemWard = removeVietnameseAccents((item.ward || '').toLowerCase());
      const itemTitle = removeVietnameseAccents((item.title || '').toLowerCase());
      const itemAddress = removeVietnameseAccents((item.address || '').toLowerCase());
      const combined = itemWard + ' ' + itemTitle + ' ' + itemAddress;
      return combined.includes(w);
    });
  }
  
  if (livingAreaMin) {
    filtered = filtered.filter(item => (item.area || 0) >= parseInt(livingAreaMin));
  }
  
  if (livingAreaMax) {
    filtered = filtered.filter(item => {
      const area = item.area || 0;
      return area > 0 && area <= parseInt(livingAreaMax);
    });
  }
  
  if (bedrooms) {
    filtered = filtered.filter(item => item.bedrooms >= parseInt(bedrooms));
  }
  
  if (legalStatus) {
    filtered = filtered.filter(item => {
      if (legalStatus === 'sohong') return item.legalStatus === 'Sổ đỏ/Sổ hồng';
      if (legalStatus === 'hopdong') return item.legalStatus === 'Hợp đồng mua bán';
      if (legalStatus === 'dangcho') return item.legalStatus === 'Đang chờ sổ';
      return true;
    });
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
    
    const sortedPrices = [...data.pricesPerM2].sort((a, b) => a - b);
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
          .then(results => ({ source: 'alonhadat', results }))
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

    const perSourceLimit = maxResults || 200;

    for (const { source, results: srcResults } of sourceResults) {
      if (Array.isArray(srcResults) && srcResults.length > 0) {
        const limited = srcResults.slice(0, perSourceLimit);
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
