const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

// ============================================
// DONNÉES CBRE VIETNAM Q3 2025
// Source: CBRE Vietnam Research & Consulting
// ============================================
const CBRE_DATA = {
  // Ho Chi Minh City
  hcmc: {
    condo: {
      primary: { price: 87000000, growth: 31 },
      secondary: { price: 60000000, growth: 25 },
    },
    landed: {
      primary: { price: 303000000, growth: 15 },
      secondary: { price: 167000000, growth: 10 },
    },
    districts: {
      'quan 1': 150000000,
      'district 1': 150000000,
      'quan 2': 85000000,
      'district 2': 85000000,
      'thu duc': 85000000,
      'quan 3': 120000000,
      'district 3': 120000000,
      'quan 7': 70000000,
      'district 7': 70000000,
      'binh thanh': 65000000,
      'phu nhuan': 75000000,
      'tan binh': 55000000,
      'go vap': 50000000,
      'binh tan': 40000000,
      'quan 9': 45000000,
      'district 9': 45000000,
      'quan 12': 35000000,
      'district 12': 35000000,
    }
  },
  // Hanoi
  hanoi: {
    condo: {
      primary: { price: 90000000, growth: 41 },
      secondary: { price: 58000000, growth: 19 },
    },
    landed: {
      primary: { price: 186000000, growth: 12 },
      secondary: { price: 198000000, growth: 8 },
    },
    districts: {
      'hoan kiem': 200000000,
      'ba dinh': 150000000,
      'tay ho': 120000000,
      'cau giay': 85000000,
      'dong da': 90000000,
      'hai ba trung': 80000000,
      'thanh xuan': 65000000,
      'ha dong': 55000000,
      'long bien': 50000000,
      'nam tu liem': 60000000,
      'hoang mai': 45000000,
    }
  },
  // Da Nang
  danang: {
    condo: {
      primary: { price: 45000000, growth: 5 },
      secondary: { price: 35000000, growth: 3 },
    },
    landed: {
      primary: { price: 80000000, growth: 8 },
      secondary: { price: 65000000, growth: 5 },
    },
    districts: {
      'hai chau': 55000000,
      'thanh khe': 40000000,
      'son tra': 50000000,
      'ngu hanh son': 60000000,
      'lien chieu': 35000000,
    }
  },
  // Binh Duong
  binhduong: {
    condo: {
      primary: { price: 35000000, growth: 10 },
      secondary: { price: 28000000, growth: 8 },
    },
    landed: {
      primary: { price: 45000000, growth: 12 },
      secondary: { price: 38000000, growth: 10 },
    },
    districts: {
      'thu dau mot': 40000000,
      'di an': 35000000,
      'thuan an': 32000000,
    }
  },
  metadata: {
    source: 'CBRE Vietnam Research & Consulting',
    period: 'Q3 2025',
    disclaimer: '© CBRE Vietnam. Données indicatives.',
  }
};

function normalizeCityKey(city) {
  if (!city) return null;
  const c = city.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd');
  
  if (c.includes('ho chi minh') || c.includes('hcm') || c.includes('saigon') || c.includes('sai gon')) return 'hcmc';
  if (c.includes('ha noi') || c.includes('hanoi')) return 'hanoi';
  if (c.includes('da nang') || c.includes('danang')) return 'danang';
  if (c.includes('binh duong')) return 'binhduong';
  return null;
}

function normalizeDistrictKey(district) {
  if (!district) return null;
  return district.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function getCBREAveragePrice(city, propertyType) {
  const cityKey = normalizeCityKey(city);
  if (!cityKey || !CBRE_DATA[cityKey]) return null;
  
  const cityData = CBRE_DATA[cityKey];
  const type = (propertyType || '').toLowerCase();
  
  let segment = 'condo';
  if (type.includes('nha') || type.includes('biet thu') || type.includes('villa') || type.includes('house')) {
    segment = 'landed';
  }
  
  return cityData[segment]?.secondary?.price || cityData.condo?.secondary?.price || null;
}

function getCBREDistrictPrice(city, district) {
  const cityKey = normalizeCityKey(city);
  if (!cityKey || !CBRE_DATA[cityKey]) return null;
  
  const districtKey = normalizeDistrictKey(district);
  if (!districtKey) return null;
  
  const districts = CBRE_DATA[cityKey].districts || {};
  
  for (const [key, price] of Object.entries(districts)) {
    if (districtKey.includes(key) || key.includes(districtKey)) {
      return price;
    }
  }
  
  return null;
}

function analyzePriceVsCBRE(item, city, propertyType) {
  if (!item.area || item.area <= 0 || !item.price || item.price <= 0) {
    return null;
  }
  
  const itemPricePerM2 = item.price / item.area;
  
  let referencePrice = getCBREDistrictPrice(city, item.district);
  let referenceType = 'district';
  
  if (!referencePrice) {
    referencePrice = getCBREAveragePrice(city, propertyType);
    referenceType = 'city';
  }
  
  if (!referencePrice) return null;
  
  const diffPercent = Math.round(((referencePrice - itemPricePerM2) / referencePrice) * 100);
  
  return {
    itemPricePerM2: Math.round(itemPricePerM2),
    cbrePrice: referencePrice,
    diffPercent,
    referenceType,
    location: item.district || city,
    dataSource: CBRE_DATA.metadata.source,
    dataPeriod: CBRE_DATA.metadata.period,
  };
}

function getCBREPriceScore(cbreAnalysis) {
  if (!cbreAnalysis) return 0;
  
  const diff = cbreAnalysis.diffPercent;
  
  if (diff >= 25) return 25;
  if (diff >= 15) return 20;
  if (diff >= 10) return 15;
  if (diff >= 5) return 10;
  if (diff >= 0) return 5;
  return 0;
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
};

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
    return '15000';
  }
  if (cityNormalized.includes('nha trang')) {
    return '15100';
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
  const { city, priceMin, priceMax, sortBy } = params;
  
  const regionCode = getChototRegion(city);
  console.log(`Chotot: ville="${city}" → region=${regionCode}`);
  
  const baseParams = new URLSearchParams();
  baseParams.append('cg', '1000');
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
  
  console.log(`Chotot TOTAL: ${allAds.length} annonces`);
  
  return allAds
    .filter(ad => ad.price && ad.price > 0)
    .map(ad => ({
      id: `chotot_${ad.list_id}`,
      title: ad.subject || 'Không có tiêu đề',
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
      postedOn: ad.list_time ? new Date(ad.list_time * 1000).toLocaleDateString('vi-VN') : '',
      list_time: ad.list_time || 0,
      category: ad.category || null,
      propertyType: ad.category_name || '',
      pricePerM2: ad.price_million_per_m2 || null,
    }));
}

// ============================================
// NHADAT247 API
// ============================================
async function fetchNhadat247() {
  const NHADAT247_ACTOR_ID = 'outlandish_bookcases~nhadat247-scraper';
  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${NHADAT247_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`);
    if (!response.ok) {
      console.log('Nhadat247: API non disponible');
      return [];
    }
    const data = await response.json();
    console.log(`Nhadat247: ${(data || []).length} annonces récupérées`);
    return (data || []).map(item => ({
      id: item.id || `nhadat247_${Math.random()}`,
      title: item.title || '',
      price: item.price || 0,
      area: item.area || 0,
      district: item.district || '',
      city: item.city || 'Hồ Chí Minh',
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      thumbnail: item.imageUrl || '',
      images: item.imageUrl ? [item.imageUrl] : [],
      url: item.url || '',
      source: 'nhadat247.com.vn',
      postedOn: item.postedDate || '',
      list_time: 0,
      category: null,
    }));
  } catch (error) {
    console.error('Nhadat247 error:', error);
    return [];
  }
}

// ============================================
// BATDONGSAN API
// ============================================
async function fetchBatdongsan() {
  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []).filter(item => item.price > 0).map(item => ({
      id: item.id || `batdongsan_${Math.random()}`,
      title: item.title || '',
      price: item.price || 0,
      area: item.floorAreaSqm || item.area || 0,
      district: item.district || '',
      city: item.city || '',
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      thumbnail: item.thumbnail || item.images?.[0] || '',
      images: item.images || [],
      url: item.url || '',
      source: 'batdongsan.com.vn',
      postedOn: item.postedOn || '',
      propertyType: item.propertyType || '',
    }));
  } catch (error) {
    console.error('Batdongsan error:', error);
    return [];
  }
}

// ============================================
// FILTRES
// ============================================
function applyFilters(results, filters) {
  const { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms } = filters;
  let filtered = [...results];
  
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => item.price >= min);
  }
  
  if (priceMax) {
    const max = parseFloat(priceMax) * 1000000000;
    filtered = filtered.filter(item => item.price > 0 && item.price <= max);
  }
  
  if (district) {
    const d = district.toLowerCase();
    filtered = filtered.filter(item => 
      (item.district || '').toLowerCase().includes(d) || 
      (item.title || '').toLowerCase().includes(d)
    );
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
  
  if (propertyType && !propertyType.toLowerCase().includes('tất cả')) {
    const type = propertyType.toLowerCase();
    let keywords = [];
    if (type.includes('căn hộ') || type.includes('chung cư')) keywords = ['căn hộ', 'chung cư', 'apartment', 'cc', 'ccmn'];
    else if (type.includes('biệt thự')) keywords = ['biệt thự', 'villa'];
    else if (type.includes('nhà')) keywords = ['nhà'];
    else if (type.includes('đất')) keywords = ['đất'];
    
    if (keywords.length > 0) {
      filtered = filtered.filter(item => {
        const t = (item.title || '').toLowerCase();
        return keywords.some(k => t.includes(k));
      });
    }
  }
  
  return filtered;
}

// ============================================
// DÉDUPLICATION
// ============================================
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

// ============================================
// SCORE DE NÉGOCIATION (avec CBRE)
// ============================================
const URGENT_KEYWORDS = [
  { pattern: /bán\s*gấp/i, weight: 25, label: 'Bán gấp' },
  { pattern: /cần\s*bán\s*gấp/i, weight: 25, label: 'Cần bán gấp' },
  { pattern: /kẹt\s*tiền/i, weight: 25, label: 'Kẹt tiền' },
  { pattern: /cần\s*tiền/i, weight: 20, label: 'Cần tiền' },
  { pattern: /ngộp\s*bank/i, weight: 25, label: 'Ngộp bank' },
  { pattern: /thanh\s*lý/i, weight: 20, label: 'Thanh lý' },
  { pattern: /bán\s*lỗ/i, weight: 25, label: 'Bán lỗ' },
  { pattern: /giá\s*rẻ/i, weight: 15, label: 'Giá rẻ' },
  { pattern: /bán\s*nhanh/i, weight: 15, label: 'Bán nhanh' },
  { pattern: /chính\s*chủ/i, weight: 10, label: 'Chính chủ' },
  { pattern: /cắt\s*lỗ/i, weight: 25, label: 'Cắt lỗ' },
  { pattern: /hạ\s*giá/i, weight: 20, label: 'Hạ giá' },
];

function calculateNegotiationScore(item, avgPricePerM2, city, propertyType) {
  let score = 0;
  const details = {
    urgentKeywords: [],
    priceAnalysis: null,
    cbreAnalysis: null,
    listingAge: null,
    photoAnalysis: null,
    priceType: null,
  };
  
  const title = (item.title || '').toLowerCase();
  
  // 1. Mots-clés urgents (max 25 points)
  let maxUrgentWeight = 0;
  for (const kw of URGENT_KEYWORDS) {
    if (kw.pattern.test(title) || kw.pattern.test(item.title || '')) {
      details.urgentKeywords.push(kw.label);
      if (kw.weight > maxUrgentWeight) {
        maxUrgentWeight = kw.weight;
      }
    }
  }
  score += maxUrgentWeight;
  
  // 2. Analyse prix CBRE (prioritaire, max 25 points)
  const cbreAnalysis = analyzePriceVsCBRE(item, city, propertyType);
  if (cbreAnalysis) {
    details.cbreAnalysis = cbreAnalysis;
    score += getCBREPriceScore(cbreAnalysis);
  } else if (item.area > 0 && item.price > 0 && avgPricePerM2 > 0) {
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
  
  // 3. Durée en ligne (max 20 points)
  const postedOn = item.postedOn || '';
  const listTime = item.list_time || 0;
  
  let daysOnline = 0;
  if (listTime > 0) {
    const listTimeMs = listTime > 10000000000 ? listTime : listTime * 1000;
    daysOnline = Math.floor((Date.now() - listTimeMs) / (1000 * 60 * 60 * 24));
    if (daysOnline < 0 || daysOnline > 3650) daysOnline = 0;
  } else if (postedOn) {
    const match = postedOn.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const postedDate = new Date(match[3], match[2] - 1, match[1]);
      daysOnline = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOnline < 0 || daysOnline > 3650) daysOnline = 0;
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
  
  // 4. Analyse photos (max 10 points)
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
  
  // 5. Prix rond (max 5 points)
  const priceInBillion = item.price / 1000000000;
  const isRoundPrice = priceInBillion === Math.floor(priceInBillion) || 
                       (priceInBillion * 10) === Math.floor(priceInBillion * 10);
  
  if (isRoundPrice && priceInBillion >= 1) {
    score += 5;
    details.priceType = 'round';
  } else {
    details.priceType = 'precise';
  }
  
  const finalScore = Math.min(100, score);
  
  let negotiationLevel;
  if (finalScore >= 70) negotiationLevel = 'excellent';
  else if (finalScore >= 50) negotiationLevel = 'good';
  else if (finalScore >= 30) negotiationLevel = 'moderate';
  else negotiationLevel = 'low';
  
  return { score: finalScore, level: negotiationLevel, details };
}

function calculateScore(item) {
  const result = calculateNegotiationScore(item, 50000000, null, null);
  return result.score;
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }

  const { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms, sources, sortBy, keywords, keywordsOnly } = body;

  console.log('=== NOUVELLE RECHERCHE ===');
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax, sortBy, sources }));

  try {
    let allResults = [];
    
    if (sources?.includes('chotot')) {
      const chototResults = await fetchChotot({ city, priceMin, priceMax, sortBy });
      allResults.push(...chototResults);
    }
    
    if (sources?.includes('batdongsan')) {
      const batdongsanResults = await fetchBatdongsan();
      const filtered = applyFilters(batdongsanResults, { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
      console.log(`Batdongsan: ${batdongsanResults.length} → ${filtered.length} filtrés`);
      allResults.push(...filtered);
    }
    
    if (sources?.includes('nhadat247')) {
      const cityNormalized = removeVietnameseAccents(city || '');
      const isHCM = cityNormalized.includes('ho chi minh') || 
                    cityNormalized.includes('saigon') || 
                    cityNormalized.includes('hcm') ||
                    cityNormalized.includes('tphcm');
      
      if (isHCM) {
        const nhadat247Results = await fetchNhadat247();
        const filtered = applyFilters(nhadat247Results, { city, district, propertyType, priceMin, priceMax, livingAreaMin, livingAreaMax, bedrooms });
        console.log(`Nhadat247 (HCM): ${nhadat247Results.length} → ${filtered.length} filtrés`);
        allResults.push(...filtered);
      } else {
        console.log(`Nhadat247: ignoré (ville=${city} n'est pas HCM)`);
      }
    }
    
    console.log(`TOTAL BRUT: ${allResults.length}`);
    
    if (propertyType && !propertyType.toLowerCase().includes('tất cả') && !propertyType.toLowerCase().includes('all')) {
      const type = propertyType.toLowerCase();
      let categoryCode = null;
      let kwds = [];
      
      if (type.includes('căn hộ') || type.includes('chung cư') || type.includes('apartment')) {
        categoryCode = 1010;
        kwds = ['căn hộ', 'chung cư', 'apartment', 'penthouse'];
      } else if (type.includes('biệt thự') || type.includes('villa')) {
        categoryCode = 1030;
        kwds = ['biệt thự', 'villa'];
      } else if (type.includes('nhà') || type.includes('house')) {
        categoryCode = 1020;
        kwds = ['nhà'];
      } else if (type.includes('đất') || type.includes('land')) {
        categoryCode = 1040;
        kwds = ['đất', 'lô đất'];
      }
      
      if (categoryCode || kwds.length > 0) {
        const before = allResults.length;
        allResults = allResults.filter(item => {
          if (item.category && categoryCode) return item.category === categoryCode;
          const t = (item.title || '').toLowerCase();
          return kwds.some(k => t.includes(k));
        });
        console.log(`Filtre type "${propertyType}" (code=${categoryCode}): ${before} → ${allResults.length}`);
      }
    }
    
    let unique = deduplicateResults(allResults);
    
    if (keywordsOnly) {
      const before = unique.length;
      const vietnameseKeywords = [
        'bán gấp', 'bán nhanh', 'cần bán nhanh', 'kẹt tiền', 'cần tiền', 
        'giá rẻ', 'ngộp bank', 'chính chủ', 'miễn trung gian', 
        'giá thương lượng', 'bán lỗ', 'cắt lỗ', 'hạ giá', 'thanh lý'
      ];
      unique = unique.filter(item => {
        const title = removeVietnameseAccents(item.title || '');
        return vietnameseKeywords.some(kw => title.includes(removeVietnameseAccents(kw)));
      });
      console.log(`Filtre keywordsOnly: ${before} → ${unique.length}`);
    }
    
    let sortedResults = [...unique];
    if (sortBy === 'price_asc') {
      sortedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sortedResults.sort((a, b) => b.price - a.price);
    } else {
      sortedResults = sortedResults.map(item => ({ ...item, score: calculateScore(item) }));
      sortedResults.sort((a, b) => b.score - a.score);
    }
    
    const validPricePerM2 = sortedResults
      .filter(item => item.area > 0 && item.price > 0)
      .map(item => item.price / item.area);
    const avgPricePerM2 = validPricePerM2.length > 0 
      ? validPricePerM2.reduce((a, b) => a + b, 0) / validPricePerM2.length 
      : 50000000;
    
    const results = sortedResults.slice(0, 100).map((item, i) => {
      const negotiation = calculateNegotiationScore(item, avgPricePerM2, city, propertyType);
      
      return {
        id: item.id || i,
        title: item.title || 'Sans titre',
        price: item.price || 0,
        pricePerSqm: item.area > 0 ? Math.round(item.price / item.area) : 0,
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
        cbreAnalysis: negotiation.details.cbreAnalysis,
        hasUrgentKeyword: negotiation.details.urgentKeywords.length > 0,
        urgentKeywords: negotiation.details.urgentKeywords,
        isNew: /hôm nay|phút|today/i.test(item.postedOn || ''),
        postedOn: item.postedOn || '',
        daysOnline: negotiation.details.listingAge?.days || 0,
      };
    });

    const prices = results.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      highestPrice: prices.length ? Math.max(...prices) : 0,
      avgPricePerSqm: Math.round(avgPricePerM2),
      totalResults: results.length,
      totalAvailable: unique.length,
      cbreDataAvailable: !!normalizeCityKey(city),
    };

    console.log(`FINAL: ${results.length} résultats, CBRE: ${stats.cbreDataAvailable ? 'OUI' : 'NON'}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, results, stats })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message, results: [], stats: {} })
    };
  }
};
