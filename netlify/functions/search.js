// ============================================
// TRAXHOME MVP - SEARCH ENHANCED
// Chotot uniquement + Extraction de texte
// ============================================

// ============================================
// MAPPING DES VILLES
// ============================================
const CHOTOT_REGIONS = {
  'hồ chí minh': '13000',
  'hà nội': '12000',
  'đà nẵng': '15000',
  'bình dương': '13100',
  'đồng nai': '13200',
  'hải phòng': '12100',
  'cần thơ': '14000',
  'khánh hòa': '15100',
  'bà rịa - vũng tàu': '13300',
  'quảng ninh': '12200',
  'lâm đồng': '15200',
  'long an': '13400',
  'bắc ninh': '12300',
  'thanh hóa': '11000',
  'nghệ an': '11100',
  'thừa thiên huế': '11200',
};

const CITY_ALIASES = {
  'hồ chí minh': ['hcm', 'tphcm', 'sài gòn', 'saigon', 'sg', 'ho chi minh'],
  'hà nội': ['hanoi', 'hn', 'ha noi'],
  'đà nẵng': ['danang', 'đn', 'da nang'],
  'bình dương': ['binh duong', 'bd'],
  'đồng nai': ['dong nai', 'bien hoa'],
  'hải phòng': ['hai phong', 'hp'],
  'cần thơ': ['can tho', 'ct'],
  'khánh hòa': ['khanh hoa', 'nha trang'],
  'bà rịa - vũng tàu': ['vung tau', 'brvt', 'ba ria'],
  'quảng ninh': ['quang ninh', 'ha long', 'hạ long'],
  'lâm đồng': ['lam dong', 'da lat', 'đà lạt'],
  'thừa thiên huế': ['hue', 'huế', 'thua thien'],
};

function normalizeCity(city) {
  if (!city) return 'hồ chí minh';
  const cityLower = city.toLowerCase().trim();
  
  if (CHOTOT_REGIONS[cityLower]) return cityLower;
  
  for (const [mainCity, aliases] of Object.entries(CITY_ALIASES)) {
    if (aliases.some(alias => cityLower.includes(alias) || alias.includes(cityLower))) {
      return mainCity;
    }
  }
  
  return 'hồ chí minh';
}

function getChototRegion(city) {
  const normalized = normalizeCity(city);
  return CHOTOT_REGIONS[normalized] || '13000';
}

// ============================================
// EXTRACTION DE TEXTE - INFORMATIONS DÉTAILLÉES
// ============================================
function extractTextInfo(text) {
  const textLower = (text || '').toLowerCase();
  
  // Statut légal
  let legalStatus = null;
  if (textLower.includes('sổ hồng') || textLower.includes('sohong') || textLower.includes('sh')) {
    legalStatus = 'Sổ Hồng';
  } else if (textLower.includes('sổ đỏ') || textLower.includes('sodo') || textLower.includes('sđ')) {
    legalStatus = 'Sổ Đỏ';
  } else if (textLower.includes('giấy tờ hợp lệ') || textLower.includes('pháp lý rõ ràng')) {
    legalStatus = 'Giấy tờ hợp lệ';
  }
  
  // Parking
  const hasParking = /garage|ô tô|oto|xe hơi|đỗ xe|đậu xe|hầm xe|parking/i.test(textLower);
  
  // Piscine
  const hasPool = /hồ bơi|bể bơi|pool|swimming/i.test(textLower);
  
  // Largeur rue (mặt tiền đường X m)
  let streetWidth = null;
  const streetMatch = textLower.match(/đường\s*(\d+(?:[.,]\d+)?)\s*m|hẻm\s*(\d+(?:[.,]\d+)?)\s*m|ngõ\s*(\d+(?:[.,]\d+)?)\s*m/);
  if (streetMatch) {
    streetWidth = parseFloat((streetMatch[1] || streetMatch[2] || streetMatch[3]).replace(',', '.'));
  }
  
  // Faces ouvertes (mặt tiền, 2 mặt tiền, etc.)
  let openFaces = 1; // Par défaut
  if (/4\s*mặt\s*tiền|4\s*mt|bốn\s*mặt/i.test(textLower)) {
    openFaces = 4;
  } else if (/3\s*mặt\s*tiền|3\s*mt|ba\s*mặt/i.test(textLower)) {
    openFaces = 3;
  } else if (/2\s*mặt\s*tiền|2\s*mt|hai\s*mặt|góc/i.test(textLower)) {
    openFaces = 2;
  } else if (/mặt\s*tiền|mt\s|mặt\s*đường|mặt\s*phố/i.test(textLower)) {
    openFaces = 1;
  }
  
  // Dimensions terrain (DxR ou longueur x largeur)
  let landDimensions = null;
  const dimMatch = textLower.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*m?/);
  if (dimMatch) {
    landDimensions = {
      length: parseFloat(dimMatch[1].replace(',', '.')),
      width: parseFloat(dimMatch[2].replace(',', '.'))
    };
  }
  
  // Mots-clés urgents détaillés
  const urgentKeywords = [];
  if (/bán\s*gấp|cần\s*bán\s*gấp/i.test(textLower)) urgentKeywords.push('Bán gấp');
  if (/bán\s*nhanh/i.test(textLower)) urgentKeywords.push('Bán nhanh');
  if (/cần\s*tiền|kẹt\s*tiền/i.test(textLower)) urgentKeywords.push('Cần tiền');
  if (/thanh\s*lý/i.test(textLower)) urgentKeywords.push('Thanh lý');
  if (/lỗ|dưới\s*giá/i.test(textLower)) urgentKeywords.push('Lỗ');
  if (/ngộp/i.test(textLower)) urgentKeywords.push('Ngộp');
  if (/chính\s*chủ/i.test(textLower)) urgentKeywords.push('Chính chủ');
  
  return {
    legalStatus,
    hasParking,
    hasPool,
    streetWidth,
    openFaces,
    landDimensions,
    urgentKeywords,
  };
}

// ============================================
// CHOTOT API - 300 RÉSULTATS
// ============================================
async function fetchChotot(params) {
  const { city, priceMin, priceMax, sortBy } = params;
  
  const regionCode = getChototRegion(city);
  console.log(`Chotot: ville="${city}" → region=${regionCode}`);
  
  const baseParams = new URLSearchParams();
  baseParams.append('cg', '1000'); // Catégorie immobilier
  baseParams.append('region_v2', regionCode);
  baseParams.append('st', 's,k'); // À vendre
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
        console.log(`Chotot offset=${offset}: +${data.ads.length}`);
      } else {
        break;
      }
    } catch (error) {
      console.error(`Chotot error offset=${offset}:`, error.message);
    }
  }
  
  console.log(`Chotot TOTAL: ${allAds.length}`);
  
  return allAds
    .filter(ad => ad.price && ad.price > 0)
    .map(ad => {
      const description = ad.body || ad.subject || '';
      const textInfo = extractTextInfo(description + ' ' + (ad.subject || ''));
      
      // Calculer l'âge de l'annonce
      const listTime = ad.list_time ? ad.list_time * 1000 : Date.now();
      const ageInDays = Math.floor((Date.now() - listTime) / (1000 * 60 * 60 * 24));
      
      return {
        id: `chotot_${ad.list_id}`,
        title: ad.subject || '',
        description: description,
        price: ad.price || 0,
        area: ad.size || ad.area || 0,
        district: ad.area_name || '',
        city: ad.region_name || '',
        bedrooms: ad.rooms || null,
        bathrooms: ad.toilets || null,
        floors: ad.floors || null,
        thumbnail: ad.image || '',
        images: ad.images || [],
        url: `https://www.chotot.com/${ad.list_id}.htm`,
        source: 'chotot.com',
        listTime: listTime,
        ageInDays: ageInDays,
        postedOn: ad.list_time ? new Date(ad.list_time * 1000).toLocaleDateString('vi-VN') : '',
        propertyType: ad.category_name || '',
        // Coordonnées pour Google Maps
        latitude: ad.latitude || ad.lat || null,
        longitude: ad.longitude || ad.lng || null,
        // Informations extraites du texte
        ...textInfo,
      };
    });
}

// ============================================
// FILTRES & DÉDUPLICATION
// ============================================
function applyFilters(results, filters) {
  const { 
    propertyType, priceMin, priceMax, 
    livingAreaMin, livingAreaMax, 
    bedrooms, bathrooms,
    hasParking, hasPool, streetWidthMin
  } = filters;
  
  let filtered = [...results];
  
  // Filtre prix
  if (priceMin) {
    const min = parseFloat(priceMin) * 1000000000;
    filtered = filtered.filter(item => item.price >= min);
  }
  
  if (priceMax) {
    const max = parseFloat(priceMax) * 1000000000;
    filtered = filtered.filter(item => item.price > 0 && item.price <= max);
  }
  
  // Filtre surface
  if (livingAreaMin) {
    filtered = filtered.filter(item => (item.area || 0) >= parseInt(livingAreaMin));
  }
  
  if (livingAreaMax) {
    filtered = filtered.filter(item => {
      const area = item.area || 0;
      return area > 0 && area <= parseInt(livingAreaMax);
    });
  }
  
  // Filtre chambres
  if (bedrooms) {
    filtered = filtered.filter(item => (item.bedrooms || 0) >= parseInt(bedrooms));
  }
  
  // Filtre salles de bain
  if (bathrooms) {
    filtered = filtered.filter(item => (item.bathrooms || 0) >= parseInt(bathrooms));
  }
  
  // Filtre parking
  if (hasParking === true || hasParking === 'true') {
    filtered = filtered.filter(item => item.hasParking === true);
  }
  
  // Filtre piscine
  if (hasPool === true || hasPool === 'true') {
    filtered = filtered.filter(item => item.hasPool === true);
  }
  
  // Filtre largeur rue
  if (streetWidthMin) {
    filtered = filtered.filter(item => {
      return item.streetWidth && item.streetWidth >= parseFloat(streetWidthMin);
    });
  }
  
  // Filtre type de bien
  if (propertyType && !propertyType.toLowerCase().includes('tất cả')) {
    const type = propertyType.toLowerCase();
    let keywords = [];
    if (type.includes('căn hộ') || type.includes('chung cư')) {
      keywords = ['căn hộ', 'chung cư', 'apartment', 'cc', 'ccmn'];
    } else if (type.includes('biệt thự')) {
      keywords = ['biệt thự', 'villa'];
    } else if (type.includes('nhà')) {
      keywords = ['nhà'];
    } else if (type.includes('đất')) {
      keywords = ['đất'];
    }
    
    if (keywords.length > 0) {
      filtered = filtered.filter(item => {
        const t = (item.title || '').toLowerCase();
        return keywords.some(k => t.includes(k));
      });
    }
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

function calculateScore(item) {
  let score = 50;
  
  // Mots-clés urgents
  if (item.urgentKeywords && item.urgentKeywords.length > 0) {
    score += item.urgentKeywords.length * 5;
  }
  
  // Image présente
  if (item.thumbnail) score += 5;
  
  // Annonce récente (< 3 jours)
  if (item.ageInDays !== undefined && item.ageInDays <= 3) score += 15;
  else if (item.ageInDays !== undefined && item.ageInDays <= 7) score += 10;
  
  // Bon rapport qualité/prix
  if (item.area > 0 && item.price > 0 && item.price / item.area < 50000000) score += 10;
  
  // Statut légal clair
  if (item.legalStatus) score += 5;
  
  // Parking
  if (item.hasParking) score += 3;
  
  // Mặt tiền
  if (item.openFaces && item.openFaces >= 2) score += 5;
  
  return Math.min(100, score);
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

  const startTime = Date.now();
  
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }

  const { 
    city, district, propertyType, 
    priceMin, priceMax, 
    livingAreaMin, livingAreaMax, 
    bedrooms, bathrooms,
    hasParking, hasPool, streetWidthMin,
    sources, sortBy 
  } = body;

  console.log('=== NOUVELLE RECHERCHE ===');
  console.log('Params:', JSON.stringify({ city, propertyType, priceMin, priceMax, bedrooms, bathrooms }));

  try {
    // Récupérer les données Chotot
    const chototResults = await fetchChotot({ city, priceMin, priceMax, sortBy });
    
    console.log(`TOTAL BRUT: ${chototResults.length}`);
    
    // Appliquer les filtres
    let filteredResults = applyFilters(chototResults, { 
      propertyType, priceMin, priceMax, 
      livingAreaMin, livingAreaMax, 
      bedrooms, bathrooms,
      hasParking, hasPool, streetWidthMin
    });
    console.log(`Après filtres: ${filteredResults.length}`);
    
    // Déduplication
    const unique = deduplicateResults(filteredResults);
    console.log(`Après dédup: ${unique.length}`);
    
    // Score et tri
    let sortedResults = unique.map(item => ({ ...item, score: calculateScore(item) }));
    
    if (sortBy === 'price_asc') {
      sortedResults.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sortedResults.sort((a, b) => b.price - a.price);
    } else {
      sortedResults.sort((a, b) => b.score - a.score);
    }
    
    // Limiter à 100 et formater
    const results = sortedResults.slice(0, 100).map((item, i) => ({
      id: item.id || i,
      title: item.title || 'Sans titre',
      description: (item.description || '').substring(0, 500), // 500 premiers caractères
      price: item.price || 0,
      pricePerSqm: item.area > 0 ? Math.round(item.price / item.area) : 0,
      city: item.city || city || '',
      district: item.district || '',
      floorArea: item.area || 0,
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      floors: item.floors || 0,
      imageUrl: item.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image',
      images: item.images || [],
      url: item.url || '#',
      source: item.source || 'chotot.com',
      score: item.score,
      // Nouveaux champs
      ageInDays: item.ageInDays || 0,
      isNew: item.ageInDays !== undefined && item.ageInDays <= 3,
      legalStatus: item.legalStatus || null,
      hasParking: item.hasParking || false,
      hasPool: item.hasPool || false,
      streetWidth: item.streetWidth || null,
      openFaces: item.openFaces || 1,
      landDimensions: item.landDimensions || null,
      urgentKeywords: item.urgentKeywords || [],
      hasUrgentKeyword: (item.urgentKeywords || []).length > 0,
      postedOn: item.postedOn || '',
      // Coordonnées Google Maps
      latitude: item.latitude || null,
      longitude: item.longitude || null,
    }));

    const prices = results.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length ? Math.min(...prices) : 0,
      highestPrice: prices.length ? Math.max(...prices) : 0,
      totalResults: results.length,
      totalAvailable: unique.length,
    };

    const duration = Date.now() - startTime;
    console.log(`FINAL: ${results.length} résultats en ${duration}ms`);

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
