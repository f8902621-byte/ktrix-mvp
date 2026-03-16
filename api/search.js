// ============================================
// KTRIX - API SEARCH (Vercel Compatible)
// ============================================

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

// ============================================
// SUPABASE - STOCKAGE DES ANNONCES
// ============================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function saveListingsToSupabase(listings) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || listings.length === 0) {
    return [];
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const records = listings.map(item => ({
      id: item.id,
      source: item.source || 'unknown',
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
    detectedKeywords: []
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
          analysis.detectedKeywords.push(`Hẻm ${width}m`);
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
            analysis.detectedKeywords.push(`Hẻm ${width}m`);
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
      analysis.detectedKeywords.push(`${analysis.extractedFloors} tầng`);
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
        analysis.detectedKeywords.push(`MT ${facade}m`);
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
      analysis.detectedKeywords.push(`Hướng ${analysis.extractedDirection}`);
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
      analysis.detectedKeywords.push(`Thu nhập ${match[1]}tr/tháng`);
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
      analysis.detectedKeywords.push(`${match[1]}tr/m²`);
      break;
    }
  }

  if (/metro|tàu\s*điện/i.test(text)) {
    analysis.hasMetroNearby = true;
    analysis.detectedKeywords.push('🚇 Gần Metro');
  }
  if (/mở\s*đường|sắp\s*mở|đường\s*mới|quy\s*hoạch\s*đường/i.test(text)) {
    analysis.hasNewRoad = true;
    analysis.detectedKeywords.push('🛣️ Sắp mở đường');
  }
  if (/đầu\s*tư|sinh\s*lời|tăng\s*giá|tiềm\s*năng/i.test(text)) {
    analysis.hasInvestmentPotential = true;
    analysis.detectedKeywords.push('📈 Tiềm năng đầu tư');
  }

  if (/chưa\s*(có\s*)?sổ|giấy\s*tay|không\s*sổ/i.test(text)) {
    analysis.hasLegalIssue = true;
    analysis.detectedKeywords.push('⚠️ Chưa có sổ');
  }
  if (/giải\s*tỏa|quy\s*hoạch\s*(treo|đỏ)|tranh\s*chấp/i.test(text)) {
    analysis.hasPlanningRisk = true;
    analysis.detectedKeywords.push('🚨 Rủi ro quy hoạch');
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
    batdongsan: null,
    include: [],
    exclude: []
  },
  'can_ho_chung_cu': {
    label: { vn: 'Căn hộ chung cư', en: 'Apartment', fr: 'Appartement' },
    chotot: 1010,
    batdongsan: 'ban-can-ho-chung-cu',
    include: ['căn hộ', 'chung cư', 'apartment', 'cc'],
    exclude: ['nghỉ dưỡng', 'condotel', 'resort', 'studio']
  },
  'can_ho_nghi_duong': {
    label: { vn: 'Căn hộ nghỉ dưỡng', en: 'Resort Condo', fr: 'Appart. Vacances' },
    chotot: 1010,
    batdongsan: 'ban-can-ho-chung-cu',
    include: ['nghỉ dưỡng', 'condotel', 'resort'],
    exclude: []
  },
  'studio': {
    label: { vn: 'Studio', en: 'Studio', fr: 'Studio' },
    chotot: 1010,
    batdongsan: 'ban-can-ho-chung-cu',
    include: ['studio'],
    exclude: []
  },
  'nha_o': {
    label: { vn: 'Nhà ở', en: 'House', fr: 'Maison' },
    chotot: 1020,
    batdongsan: 'ban-nha-rieng',
    include: ['nhà riêng', 'nhà ở', 'nhà phố'],
    exclude: ['biệt thự', 'villa', 'nghỉ dưỡng', 'resort']
  },
  'nha_biet_thu': {
    label: { vn: 'Nhà biệt thự', en: 'Villa', fr: 'Villa' },
    chotot: 1020,
    batdongsan: 'ban-nha-biet-thu-lien-ke',
    include: ['biệt thự', 'villa', 'liền kề'],
    exclude: ['nghỉ dưỡng', 'resort']
  },
  'nha_nghi_duong': {
    label: { vn: 'Nhà nghỉ dưỡng', en: 'Resort House', fr: 'Maison Vacances' },
    chotot: 1020,
    batdongsan: 'ban-nha-rieng',
    include: ['nghỉ dưỡng', 'resort'],
    exclude: []
  },
  'shophouse': {
    label: { vn: 'Shophouse', en: 'Shophouse', fr: 'Shophouse' },
    chotot: 1030,
    batdongsan: 'ban-shophouse-nha-pho-thuong-mai',
    include: ['shophouse', 'nhà phố thương mại'],
    exclude: []
  },
  'van_phong': {
    label: { vn: 'Văn phòng', en: 'Office', fr: 'Bureau' },
    chotot: 1030,
    batdongsan: null,
    include: ['văn phòng', 'office', 'officetel'],
    exclude: []
  },
  'cua_hang': {
    label: { vn: 'Cửa hàng', en: 'Shop', fr: 'Boutique' },
    chotot: 1030,
    batdongsan: 'ban-shophouse-nha-pho-thuong-mai',
    include: ['cửa hàng', 'shop', 'ki ốt', 'kiot'],
    exclude: []
  },
  'mat_bang': {
    label: { vn: 'Mặt bằng', en: 'Premises', fr: 'Local commercial' },
    chotot: 1030,
    batdongsan: 'ban-shophouse-nha-pho-thuong-mai',
    include: ['mặt bằng', 'mặt tiền'],
    exclude: ['shophouse', 'văn phòng', 'kho']
  },
  'kho_nha_xuong': {
    label: { vn: 'Kho, nhà xưởng', en: 'Warehouse', fr: 'Entrepôt' },
    chotot: 1030,
    batdongsan: 'ban-kho-nha-xuong',
    include: ['kho', 'nhà xưởng', 'xưởng', 'warehouse'],
    exclude: []
  },
  'dat': {
    label: { vn: 'Đất', en: 'Land', fr: 'Terrain' },
    chotot: 1040,
    batdongsan: 'ban-dat-dat-nen',
    include: ['đất', 'đất nền', 'lô đất'],
    exclude: ['nghỉ dưỡng', 'resort']
  },
  'dat_nghi_duong': {
    label: { vn: 'Đất nghỉ dưỡng', en: 'Resort Land', fr: 'Terrain Vacances' },
    chotot: 1040,
    batdongsan: 'ban-dat-dat-nen',
    include: ['nghỉ dưỡng', 'resort'],
    exclude: []
  },
  'bat_dong_san_khac': {
    label: { vn: 'Bất động sản khác', en: 'Other', fr: 'Autre bien' },
    chotot: 1000,
    batdongsan: null,
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
  const { city, priceMin, priceMax, sortBy, propertyType } = params;
  
  const regionCode = getChototRegion(city);
  const typeMapping = getPropertyTypeMapping(propertyType);
  
  console.log(`Chotot: ville="${city}" → region=${regionCode}, type="${propertyType}" → code=${typeMapping.chotot}`);
  
  const baseParams = new URLSearchParams();
  baseParams.append('cg', typeMapping.chotot.toString());
  baseParams.append('region_v2', regionCode);
  baseParams.append('st', 's,k');
  baseParams.append('limit', '50');
  
  if (priceMin || priceMax) {
    const minPrice = priceMin ? Math.round(parseFloat(priceMin) * 1000000000) : 0;
    const maxPrice = priceMax ? Math.round(parseFloat(priceMax) * 1000000000) : 999999999999;
    baseParams.append('price', `${minPrice}-${maxPrice}`);
  }
  
  if (sortBy === 'price_asc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'asc');
  } else if (sortBy === 'price_desc') {
    baseParams.append('sort_by', 'price');
    baseParams.append('sort_dir', 'desc');
  }
  
  const allAds = [];
  const offsets = [0, 50, 100, 150, 200, 250];
  
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
        detectedKeywords: nlpAnalysis.detectedKeywords,
      };
    });
  
  if (typeMapping.include.length > 0 || typeMapping.exclude.length > 0) {
    const beforeFilter = results.length;
    results = filterByKeywords(results, typeMapping.include, typeMapping.exclude);
    console.log(`Chotot filtre mots-clés: ${beforeFilter} → ${results.length}`);
  }

  return results;
}

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
  const { city, district, ward, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, legalStatus, streetWidthMin } = filters;
  let filtered = [...results];
  
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => {
      if (item.source === 'batdongsan.com.vn' && (!item.price || item.price === 0)) {
        return true;
      }
      return item.price >= min;
    });
  }
  
  if (priceMax) {
    const max = parseFloat(priceMax) * 1000000000;
    filtered = filtered.filter(item => {
      if (item.source === 'batdongsan.com.vn' && (!item.price || item.price === 0)) {
        return true;
      }
      return item.price > 0 && item.price <= max;
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
      return combined.includes(d);
    });
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
    details.nlpFactors.push({ 
      type: 'bonus', 
      label: '🚇 Gần Metro', 
      points: 10
    });
  }
  
  if (item.hasNewRoad) {
    score += 8;
    details.nlpFactors.push({ 
      type: 'bonus', 
      label: '🛣️ Sắp mở đường', 
      points: 8
    });
  }
  
  if (item.hasInvestmentPotential) {
    score += 5;
    details.nlpFactors.push({ 
      type: 'bonus', 
      label: '📈 Tiềm năng đầu tư', 
      points: 5
    });
  }
  
  if (item.hasLegalIssue) {
    score -= 15;
    details.nlpFactors.push({ 
      type: 'malus', 
      label: '⚠️ Chưa có sổ', 
      points: -15
    });
  }
  
  if (item.hasPlanningRisk) {
    score -= 15;
    details.nlpFactors.push({ 
      type: 'malus', 
      label: '🚨 Rủi ro quy hoạch', 
      points: -15
    });
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

  const { city, district, ward, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, sources, sortBy, keywords, keywordsOnly, legalStatus } = req.body || {};

  console.log('=== NOUVELLE RECHERCHE ===');
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax, sortBy, sources }));

  try {
    const sourcePromises = [];
    
    if (sources?.includes('chotot')) {
      sourcePromises.push(
        fetchChotot({ city, priceMin, priceMax, sortBy, propertyType })
          .then(results => ({ source: 'chotot', results }))
          .catch(e => { console.log(`Chotot erreur: ${e.message}`); return { source: 'chotot', results: [] }; })
      );
    }

    const sourceResults = await Promise.all(sourcePromises);

    let allResults = [];
    const typeMapping = getPropertyTypeMapping(propertyType);

    for (const { source, results } of sourceResults) {
      if (results && results.length > 0) {
        let typeFiltered = results;
        if (typeMapping.include.length > 0 || typeMapping.exclude.length > 0) {
          const beforeType = results.length;
          typeFiltered = filterByKeywords(results, typeMapping.include, typeMapping.exclude);
          console.log(`${source}: filtrage type ${beforeType} → ${typeFiltered.length}`);
        }
        
        const filtered = applyFilters(typeFiltered, { city, district, ward, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, legalStatus });
        console.log(`${source}: ${results.length} → ${typeFiltered.length} (type) → ${filtered.length} (autres filtres)`);
        allResults.push(...filtered);
      }
    }

    console.log(`TOTAL BRUT: ${allResults.length}`);
    
    let unique = deduplicateResults(allResults);
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
    
    let sortedResults = [...unique];
    if (sortBy === 'price_asc') {
      sortedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sortedResults.sort((a, b) => b.price - a.price);
    }
    
    const validPricePerM2 = sortedResults
      .filter(item => item.area > 0 && item.price > 0)
      .map(item => item.price / item.area);
    const avgPricePerM2 = validPricePerM2.length > 0 
      ? validPricePerM2.reduce((a, b) => a + b, 0) / validPricePerM2.length 
      : 50000000;

    const results = sortedResults.slice(0, 200).map((item, i) => {
      const negotiation = calculateNegotiationScore(item, avgPricePerM2);
      const pricePosition = analyzePricePosition(item, districtStats);
      
      return {
        id: item.id || i,
        title: item.title || 'Sans titre',
        price: item.price || 0,
        pricePerSqm: (() => {
  const area = item.area || item.floorAreaSqm || item.floorArea || item.size || 0;
  const price = item.price || 0;
  if (area > 0 && price > 0) {
    const ppm2 = Math.round(price / area);
    if (ppm2 >= 1000000 && ppm2 <= 500000000) return ppm2;
  }
  if (item.pricePerM2 && item.pricePerM2 > 0) return Math.round(item.pricePerM2);
  if (item.price_million_per_m2 && item.price_million_per_m2 > 0) return Math.round(item.price_million_per_m2 * 1000000);
  return null;
})(),
        avgPricePerSqm: Math.round(avgPricePerM2),
        city: item.city || city || '',
        district: item.district || '',
        address: item.address || '',
        floorArea: item.area || 0,
        bedrooms: item.bedrooms || 0,
        bathrooms: item.bathrooms || 0,
        imageUrl: item.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image',
        images: item.images || [],
        url: item.url || '#',
        source: item.source || 'unknown',
        score: negotiation.score,
        negotiationLevel: negotiation.level,
        negotiationDetails: negotiation.details,
        hasUrgentKeyword: negotiation.details.urgentKeywords.length > 0,
        urgentKeywords: negotiation.details.urgentKeywords,
        isNew: /hôm nay|phút|today/i.test(item.postedOn || ''),
        postedOn: item.postedOn || '',
        daysOnline: negotiation.details.listingAge?.days || 0,
        legalStatus: item.legalStatus || null,
        direction: item.direction || null,
        floors: item.floors || null,
        streetWidth: item.streetWidth || null,
        facadeWidth: item.facadeWidth || null,
        furnishing: item.furnishing || null,
        extractedRentalIncome: item.extractedRentalIncome || null,
        hasMetroNearby: item.hasMetroNearby || false,
        hasNewRoad: item.hasNewRoad || false,
        hasInvestmentPotential: item.hasInvestmentPotential || false,
        hasLegalIssue: item.hasLegalIssue || false,
        hasPlanningRisk: item.hasPlanningRisk || false,
        detectedKeywords: item.detectedKeywords || [],
        pricePosition: pricePosition,
      };
    });

    const prices = results.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      highestPrice: prices.length ? Math.max(...prices) : 0,
      avgPricePerSqm: Math.round(avgPricePerM2),
      totalResults: results.length,
      totalAvailable: unique.length,
    };

    console.log(`FINAL: ${results.length} résultats`);

    return res.status(200).json({ success: true, results, stats });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message, results: [], stats: {} });
  }
}
