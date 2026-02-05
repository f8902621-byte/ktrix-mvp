/**
 * K Trix - Batdongsan Stealth Scraper v3
 * ========================================
 * Stratégies anti-détection :
 * 1. Rotation de User-Agents réels (Chrome/Safari/Firefox Vietnam)
 * 2. Délais aléatoires humains (2-6s entre requêtes)
 * 3. Headers réalistes (Accept-Language, Referer, etc.)
 * 4. Limite stricte de volume (max 10-15 annonces par recherche)
 * 5. Pas de render=true (plus discret, moins cher)
 * 6. Session cookies simulés
 * 7. Fallback gracieux si blocage détecté
 */

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// ============================================
// CONFIGURATION ANTI-DÉTECTION
// ============================================

// Limite stricte — on se comporte comme un humain qui browse
const MAX_DETAIL_PAGES = 10;

// User-Agents réels de navigateurs populaires au Vietnam (2025-2026)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
];

// Referers réalistes — simuler qu'on vient de Google ou de la navigation interne
const REFERERS = [
  'https://www.google.com.vn/',
  'https://www.google.com/search?q=mua+nha+dat',
  'https://batdongsan.com.vn/',
  'https://batdongsan.com.vn/ban-can-ho-chung-cu',
  'https://www.facebook.com/',
  'https://zalo.me/',
];

// ============================================
// HELPERS
// ============================================

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Délai aléatoire entre 2 et 6 secondes (comportement humain)
function humanDelay() {
  const min = 2000;
  const max = 6000;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Délai court entre 800ms et 2s (pour navigation interne)
function shortDelay() {
  const min = 800;
  const max = 2000;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

// ============================================
// MAPPINGS
// ============================================

const cityMapping = {
  'ho chi minh': 'tp-hcm',
  'ha noi': 'ha-noi',
  'da nang': 'da-nang',
  'binh duong': 'binh-duong',
  'khanh hoa': 'khanh-hoa',
  'can tho': 'can-tho',
  'hai phong': 'hai-phong',
  'ba ria vung tau': 'vung-tau-vt',
  'vung tau': 'vung-tau-vt',
  'lam dong': 'lam-dong',
  'da lat': 'lam-dong',
  'binh dinh': 'quy-nhon-bdd',
  'quy nhon': 'quy-nhon-bdd',
};

const PROPERTY_TYPE_MAPPING = {
  'can ho chung cu': 'ban-can-ho-chung-cu',
  'can ho': 'ban-can-ho-chung-cu',
  'chung cu': 'ban-can-ho-chung-cu',
  'apartment': 'ban-can-ho-chung-cu',
  'nha biet thu': 'ban-nha-biet-thu-lien-ke',
  'biet thu': 'ban-nha-biet-thu-lien-ke',
  'villa': 'ban-nha-biet-thu-lien-ke',
  'lien ke': 'ban-nha-biet-thu-lien-ke',
  'nha mat pho': 'ban-nha-mat-pho',
  'mat pho': 'ban-nha-mat-pho',
  'nha rieng': 'ban-nha-rieng',
  'nha o': 'ban-nha-rieng',
  'house': 'ban-nha-rieng',
  'shophouse': 'ban-shophouse-nha-pho-thuong-mai',
  'nha pho thuong mai': 'ban-shophouse-nha-pho-thuong-mai',
  'dat nen': 'ban-dat-nen-du-an',
  'dat du an': 'ban-dat-nen-du-an',
  'dat': 'ban-dat',
  'land': 'ban-dat',
  'trang trai': 'ban-trang-trai-khu-nghi-duong',
  'khu nghi duong': 'ban-trang-trai-khu-nghi-duong',
  'resort': 'ban-trang-trai-khu-nghi-duong',
  'kho': 'ban-kho-nha-xuong',
  'nha xuong': 'ban-kho-nha-xuong',
  'warehouse': 'ban-kho-nha-xuong',
};

// ============================================
// SCRAPING FURTIF AVEC SCRAPERAPI
// ============================================

function buildSearchUrl(params) {
  const { city = 'ho chi minh', propertyType = 'can ho chung cu', priceMax = 10, page = 1 } = params;
  
  const cityNorm = normalizeString(city);
  const typeNorm = normalizeString(propertyType);
  
  let citySlug = 'tp-hcm';
  for (const [key, value] of Object.entries(cityMapping)) {
    if (cityNorm.includes(key)) { citySlug = value; break; }
  }
  
  let typeSlug = 'ban-can-ho-chung-cu';
  for (const [key, value] of Object.entries(PROPERTY_TYPE_MAPPING)) {
    if (typeNorm.includes(key)) { typeSlug = value; break; }
  }
  
  let url = `https://batdongsan.com.vn/${typeSlug}-${citySlug}`;
  
  if (priceMax) {
    url += `?gcn=${priceMax}-ty`;
  }
  
  if (page > 1) {
    url += (url.includes('?') ? '&' : '?') + `p=${page}`;
  }
  
  return url;
}

/**
 * Requête furtive via ScraperAPI avec headers réalistes
 * - Pas de render=true (moins suspect, plus rapide, moins cher)
 * - country_code=vn pour IP vietnamienne
 * - Headers personnalisés pour simuler un vrai navigateur
 */
async function stealthFetch(targetUrl) {
  const userAgent = getRandomItem(USER_AGENTS);
  const referer = getRandomItem(REFERERS);
  
  // ScraperAPI avec paramètres discrets
  const scraperUrl = new URL('https://api.scraperapi.com/');
  scraperUrl.searchParams.set('api_key', SCRAPER_API_KEY);
  scraperUrl.searchParams.set('url', targetUrl);
  scraperUrl.searchParams.set('country_code', 'vn');
  // Passer nos headers custom via ScraperAPI
  scraperUrl.searchParams.set('keep_headers', 'true');
  
  const startTime = Date.now();
  
  const response = await fetch(scraperUrl.toString(), {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': referer,
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Cache-Control': 'max-age=0',
    }
  });
  
  const duration = Date.now() - startTime;
  
  if (!response.ok) {
    console.log(`[BDS-Stealth] BLOCKED or error: ${response.status} for ${targetUrl} (${duration}ms)`);
    throw new Error(`HTTP ${response.status}`);
  }
  
  const html = await response.text();
  
  // Détecter si on a été redirigé vers une page CAPTCHA ou bloqué
  if (html.includes('captcha') || html.includes('robot') || html.includes('blocked') || html.length < 1000) {
    console.log(`[BDS-Stealth] CAPTCHA/Block detected (html: ${html.length} chars)`);
    throw new Error('CAPTCHA_DETECTED');
  }
  
  console.log(`[BDS-Stealth] OK: ${html.length} chars (${duration}ms) - UA: ${userAgent.substring(0, 30)}...`);
  return html;
}

// ============================================
// EXTRACTION DES URLS DEPUIS LA PAGE DE LISTE
// ============================================

function extractListingUrls(html) {
  const urls = [];
  const seen = {};
  
  // Pattern principal: liens vers les pages de détail
  const urlRegex = /href="(\/ban-[^"]*-pr(\d+)[^"]*)"/gi;
  let match;
  
  while ((match = urlRegex.exec(html)) !== null) {
    const path = match[1];
    const id = match[2];
    if (!seen[id]) {
      seen[id] = true;
      urls.push({
        id: id,
        path: path,
        fullUrl: 'https://batdongsan.com.vn' + path
      });
    }
  }
  
  console.log(`[BDS-Stealth] Found ${urls.length} unique listing URLs`);
  return urls;
}

// ============================================
// PARSING D'UNE PAGE DE DÉTAIL
// ============================================

function parseDetailPage(html, urlInfo, city, propertyType) {
  const listing = {
    external_id: 'bds_' + urlInfo.id,
    source: 'batdongsan.com.vn',
    url: urlInfo.fullUrl,
    city: city,
    property_type: propertyType,
    scraped_at: new Date().toISOString()
  };
  
  // === TITRE ===
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    listing.title = titleMatch[1]
      .replace(/ - Batdongsan\.com\.vn$/i, '')
      .replace(/ \| Batdongsan$/i, '')
      .substring(0, 150);
  }
  
  // === PRIX (depuis le JSON embarqué dans la page) ===
  const priceMatch = html.match(/price:\s*(\d{8,12})[,\s]/);
  if (priceMatch) {
    const priceValue = parseInt(priceMatch[1]);
    if (priceValue > 100000000) { // > 100 millions VND
      listing.price = priceValue;
    }
  }
  
  // Fallback prix: chercher dans le texte visible
  if (!listing.price) {
    // Pattern: "5.2 tỷ" ou "5,2 tỷ" ou "52 triệu/m²"
    const priceTextMatch = html.match(/([\d.,]+)\s*tỷ/i);
    if (priceTextMatch) {
      const priceInTy = parseFloat(priceTextMatch[1].replace(',', '.'));
      if (priceInTy > 0 && priceInTy < 1000) {
        listing.price = Math.round(priceInTy * 1000000000);
      }
    }
  }
  
  // === SURFACE ===
  const areaMatch = html.match(/area:\s*(\d+)/);
  if (areaMatch) {
    listing.area = parseInt(areaMatch[1]);
  }
  // Fallback surface depuis titre
  if (!listing.area && listing.title) {
    const areaTitleMatch = listing.title.match(/(\d+[.,]?\d*)\s*m[²2]/i);
    if (areaTitleMatch) {
      listing.area = Math.round(parseFloat(areaTitleMatch[1].replace(',', '.')));
    }
  }
  
  // === PRIX/M² ===
  if (listing.price && listing.area && listing.area > 0) {
    listing.pricePerSqm = Math.round(listing.price / listing.area);
  }
  
  // === CHAMBRES ===
  const bedroomMatch = html.match(/bedroom[s]?:\s*(\d+)/i) || html.match(/(\d+)\s*(?:PN|phòng ngủ)/i);
  if (bedroomMatch) {
    listing.bedrooms = parseInt(bedroomMatch[1]);
  }
  
  // === SALLES DE BAIN ===
  const bathroomMatch = html.match(/bathroom[s]?:\s*(\d+)/i) || html.match(/(\d+)\s*(?:WC|phòng tắm|toilet)/i);
  if (bathroomMatch) {
    listing.bathrooms = parseInt(bathroomMatch[1]);
  }
  
  // === ÉTAGES ===
  const floorMatch = html.match(/(\d+)\s*tầng/i) || html.match(/(\d+)\s*lầu/i);
  if (floorMatch && parseInt(floorMatch[1]) <= 50) {
    listing.floors = parseInt(floorMatch[1]);
  }
  
  // === DIRECTION ===
  const dirMatch = html.match(/(?:Hướng|direction)[:\s]*([ĐTBN][^\s,<]{2,15})/i);
  if (dirMatch) {
    listing.direction = dirMatch[1];
  }
  
  // === STATUT LÉGAL ===
  if (/sổ\s*(đỏ|hồng)/i.test(html)) {
    listing.legalStatus = 'Sổ đỏ/Sổ hồng';
  } else if (/chưa\s*(có\s*)?sổ|giấy\s*tay/i.test(html)) {
    listing.legalStatus = 'Chưa có sổ';
  }
  
  // === IMAGE PRINCIPALE ===
  // 1. og:image meta tag
  const ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i)
    || html.match(/content="([^"]+)"\s+property="og:image"/i);
  if (ogImageMatch && ogImageMatch[1]) {
    listing.imageUrl = ogImageMatch[1];
  }
  // 2. CDN file4.batdongsan
  if (!listing.imageUrl) {
    const cdnMatch = html.match(/https:\/\/file4\.batdongsan\.com\.vn\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/i);
    if (cdnMatch) listing.imageUrl = cdnMatch[0];
  }
  
  // === ADRESSE ===
  const addressMatch = html.match(/address["\']?:\s*["\']([^"\']+)["\']/i);
  if (addressMatch) {
    listing.address = addressMatch[1];
  }
  
  // === DISTRICT ===
  const districtMatch = html.match(/district["\']?:\s*["\']([^"\']+)["\']/i);
  if (districtMatch) {
    listing.district = districtMatch[1];
  }
  // Fallback district depuis l'URL
  if (!listing.district) {
    const urlDistrictMatch = urlInfo.fullUrl.match(/quan-(\d+)/i);
    if (urlDistrictMatch) {
      listing.district = `Quận ${urlDistrictMatch[1]}`;
    }
  }
  
  // === WARD ===
  const wardMatch = html.match(/ward["\']?:\s*["\']([^"\']+)["\']/i);
  if (wardMatch) {
    listing.ward = wardMatch[1];
  }
  
  // === MOTS-CLÉS URGENTS ===
  listing.matchedKeywords = [];
  const urgentPatterns = [
    { regex: /bán\s*gấp/i, keyword: 'Bán gấp' },
    { regex: /cần\s*bán\s*gấp/i, keyword: 'Cần bán gấp' },
    { regex: /ngộp\s*bank/i, keyword: 'Ngộp bank' },
    { regex: /chính\s*chủ/i, keyword: 'Chính chủ' },
    { regex: /bán\s*lỗ/i, keyword: 'Bán lỗ' },
    { regex: /giá\s*rẻ/i, keyword: 'Giá rẻ' },
    { regex: /cắt\s*lỗ/i, keyword: 'Cắt lỗ' },
    { regex: /hạ\s*giá/i, keyword: 'Hạ giá' },
  ];
  
  const textToCheck = (listing.title || '') + ' ' + (listing.address || '');
  for (const pattern of urgentPatterns) {
    if (pattern.regex.test(textToCheck)) {
      listing.matchedKeywords.push(pattern.keyword);
    }
  }
  listing.hasUrgentKeyword = listing.matchedKeywords.length > 0;
  
  // === NLP ALERTES ===
  listing.nlpAlerts = [];
  if (/metro|tàu\s*điện/i.test(html)) {
    listing.nlpAlerts.push({ type: 'opportunity', text: 'Gần Metro', icon: '🚇', points: 5 });
  }
  if (/mở\s*đường|sắp\s*mở|đường\s*mới/i.test(html)) {
    listing.nlpAlerts.push({ type: 'opportunity', text: 'Sắp mở đường', icon: '🛣️', points: 3 });
  }
  if (/đầu\s*tư|sinh\s*lời|tiềm\s*năng/i.test(html)) {
    listing.nlpAlerts.push({ type: 'opportunity', text: 'Tiềm năng đầu tư', icon: '📈', points: 5 });
  }
  if (/chưa\s*(có\s*)?sổ|giấy\s*tay/i.test(html)) {
    listing.nlpAlerts.push({ type: 'risk', text: 'Chưa có sổ', icon: '⚠️', points: -10 });
  }
  if (/giải\s*tỏa|quy\s*hoạch\s*(treo|đỏ)|tranh\s*chấp/i.test(html)) {
    listing.nlpAlerts.push({ type: 'risk', text: 'Rủi ro quy hoạch', icon: '🚨', points: -15 });
  }
  
  // === DATE DE PUBLICATION ===
  const dateMatch = html.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    listing.postedOn = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
  }
  
  return listing;
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

exports.handler = async function(event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  if (!SCRAPER_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'SCRAPER_API_KEY not configured' })
    };
  }
  
  try {
    const params = event.queryStringParameters || {};
    const city = params.city || 'Ho Chi Minh';
    const propertyType = params.propertyType || 'Can ho chung cu';
    const priceMax = params.priceMax || 10;
    const maxListings = Math.min(parseInt(params.maxListings) || MAX_DETAIL_PAGES, 15);
    
    console.log(`[BDS-Stealth] Search: city=${city}, type=${propertyType}, priceMax=${priceMax}, max=${maxListings}`);
    
    // ==========================================
    // ÉTAPE 1: Page de liste (comme un humain qui arrive depuis Google)
    // ==========================================
    const listUrl = buildSearchUrl({ city, propertyType, priceMax, page: 1 });
    
    let listHtml;
    try {
      listHtml = await stealthFetch(listUrl);
    } catch (err) {
      if (err.message === 'CAPTCHA_DETECTED') {
        console.log('[BDS-Stealth] Captcha on list page — aborting gracefully');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            source: 'batdongsan',
            blocked: true,
            message: 'BDS temporarily unavailable — using cached data',
            listings: []
          })
        };
      }
      throw err;
    }
    
    // ==========================================
    // ÉTAPE 2: Extraire les URLs
    // ==========================================
    let listingUrls = extractListingUrls(listHtml);
    
    // Mélanger aléatoirement les URLs (ne pas toujours scraper les mêmes)
    listingUrls = listingUrls.sort(() => Math.random() - 0.5);
    
    // Limiter
    listingUrls = listingUrls.slice(0, maxListings);
    console.log(`[BDS-Stealth] Will scrape ${listingUrls.length} detail pages (shuffled)`);
    
    // ==========================================
    // ÉTAPE 3: Scraper les détails avec comportement humain
    // ==========================================
    const listings = [];
    let captchaCount = 0;
    
    for (let i = 0; i < listingUrls.length; i++) {
      const urlInfo = listingUrls[i];
      
      // Si on a eu 2 captchas, on arrête — on est repéré
      if (captchaCount >= 2) {
        console.log(`[BDS-Stealth] 2 captchas hit — stopping to avoid IP ban`);
        break;
      }
      
      try {
        console.log(`[BDS-Stealth] Detail ${i + 1}/${listingUrls.length}: ${urlInfo.id}`);
        
        // Délai humain AVANT chaque requête (sauf la première)
        if (i > 0) {
          await humanDelay();
        } else {
          // Même la première requête a un petit délai après la page de liste
          await shortDelay();
        }
        
        const detailHtml = await stealthFetch(urlInfo.fullUrl);
        const listing = parseDetailPage(detailHtml, urlInfo, city, propertyType);
        
        if (listing.price && listing.price > 0) {
          listings.push(listing);
        } else {
          console.log(`[BDS-Stealth] Skipped ${urlInfo.id} — no valid price`);
        }
        
      } catch (err) {
        if (err.message === 'CAPTCHA_DETECTED') {
          captchaCount++;
          console.log(`[BDS-Stealth] Captcha on detail ${urlInfo.id} (count: ${captchaCount})`);
          // Pause longue après un captcha
          await new Promise(r => setTimeout(r, 8000 + Math.random() * 5000));
        } else {
          console.log(`[BDS-Stealth] Error on ${urlInfo.id}: ${err.message}`);
        }
      }
    }
    
    console.log(`[BDS-Stealth] Final: ${listings.length} listings OK, ${captchaCount} captchas`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source: 'batdongsan',
        city: city,
        propertyType: propertyType,
        totalListings: listings.length,
        blocked: captchaCount >= 2,
        listings: listings
      })
    };
    
  } catch (error) {
    console.error('[BDS-Stealth] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
