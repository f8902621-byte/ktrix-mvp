/**
 * K Trix - Alonhadat Scraper via ScraperAPI
 * Fonction Netlify pour récupérer les annonces immobilières de alonhadat.com.vn
 */

const https = require('https');

// Configuration
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Mapping des villes Alonhadat
const CITY_MAPPING = {
  'ho-chi-minh': { name: 'Hồ Chí Minh', code: 1 },
  'ha-noi': { name: 'Hà Nội', code: 2 },
  'da-nang': { name: 'Đà Nẵng', code: 3 },
  'hai-phong': { name: 'Hải Phòng', code: 4 },
  'can-tho': { name: 'Cần Thơ', code: 5 },
  'binh-duong': { name: 'Bình Dương', code: 6 },
  'dong-nai': { name: 'Đồng Nai', code: 7 },
  'khanh-hoa': { name: 'Khánh Hòa', code: 8 },
  'lam-dong': { name: 'Lâm Đồng', code: 9 },
  'ba-ria-vung-tau': { name: 'Bà Rịa - Vũng Tàu', code: 10 },
  'quang-ninh': { name: 'Quảng Ninh', code: 11 },
  'thanh-hoa': { name: 'Thanh Hóa', code: 12 },
  'nghe-an': { name: 'Nghệ An', code: 13 },
  'thua-thien-hue': { name: 'Thừa Thiên Huế', code: 14 },
};

// Mapping des types de biens Alonhadat
const PROPERTY_TYPE_MAPPING = {
  'nha-dat': { name: 'Nhà đất', code: 1, ktrix: 'Nhà ở' },
  'can-ho-chung-cu': { name: 'Căn hộ chung cư', code: 2, ktrix: 'Căn hộ chung cư' },
  'biet-thu': { name: 'Biệt thự', code: 3, ktrix: 'Biệt thự' },
  'dat-nen': { name: 'Đất nền', code: 4, ktrix: 'Đất' },
  'nha-mat-tien': { name: 'Nhà mặt tiền', code: 5, ktrix: 'Nhà ở' },
  'nha-xuong-kho': { name: 'Nhà xưởng, kho', code: 6, ktrix: 'Kho, nhà xưởng' },
  'mat-bang': { name: 'Mặt bằng', code: 7, ktrix: 'Mặt bằng' },
  'van-phong': { name: 'Văn phòng', code: 8, ktrix: 'Văn phòng' },
  'shophouse': { name: 'Shophouse', code: 9, ktrix: 'Shophouse' },
};

/**
 * Construire l'URL Alonhadat pour la recherche
 */
function buildAlonhadatUrl(params) {
  const { city = 'ho-chi-minh', propertyType = 'nha-dat', page = 1, transactionType = 'can-ban' } = params;
  
  // Format: https://alonhadat.com.vn/nha-dat/can-ban/nha-dat/1/ho-chi-minh/trang--1.html
  // Ou pour biệt thự: https://alonhadat.com.vn/nha-dat/can-ban/biet-thu/3/ho-chi-minh/trang--1.html
  
  const propType = PROPERTY_TYPE_MAPPING[propertyType] || PROPERTY_TYPE_MAPPING['nha-dat'];
  const cityData = CITY_MAPPING[city] || CITY_MAPPING['ho-chi-minh'];
  
  return `https://alonhadat.com.vn/nha-dat/${transactionType}/${propertyType}/${propType.code}/${city}/trang--${page}.html`;
}

/**
 * Scraper une page via ScraperAPI
 */
async function scrapeWithScraperAPI(targetUrl) {
  return new Promise((resolve, reject) => {
    const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=vn`;
    
    console.log(`[Alonhadat] Scraping: ${targetUrl}`);
    
    const startTime = Date.now();
    
    https.get(scraperUrl, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`[Alonhadat] Response: ${response.statusCode} (${duration}ms, ${(data.length/1024).toFixed(1)}KB)`);
        
        if (response.statusCode === 200) {
          resolve({ success: true, html: data, duration });
        } else {
          resolve({ success: false, error: `HTTP ${response.statusCode}`, duration });
        }
      });
    }).on('error', (err) => {
      console.log(`[Alonhadat] Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Parser le HTML Alonhadat pour extraire les annonces
 */
function parseAlonhadatListings(html, city, propertyType) {
  const listings = [];
  
  // Regex pour extraire les articles (property-item)
  const articleRegex = /<article[^>]*class="property-item"[^>]*>([\s\S]*?)<\/article>/gi;
  let articleMatch;
  
  while ((articleMatch = articleRegex.exec(html)) !== null) {
    const articleHtml = articleMatch[1];
    
    try {
      const listing = extractListingData(articleHtml, city, propertyType);
      if (listing && listing.title) {
        listings.push(listing);
      }
    } catch (e) {
      console.log(`[Alonhadat] Parse error: ${e.message}`);
    }
  }
  
  console.log(`[Alonhadat] Parsed ${listings.length} listings`);
  return listings;
}

/**
 * Extraire les données d'une annonce individuelle
 */
function extractListingData(articleHtml, city, propertyType) {
  const listing = {
    source: 'alonhadat',
    city: CITY_MAPPING[city]?.name || city,
    property_type: PROPERTY_TYPE_MAPPING[propertyType]?.ktrix || 'Nhà ở',
    scraped_at: new Date().toISOString(),
  };
  
  // Extraire l'URL et l'ID
  const urlMatch = articleHtml.match(/href="([^"]*\.html)"/i);
  if (urlMatch) {
    listing.url = `https://alonhadat.com.vn${urlMatch[1]}`;
    // Extraire l'ID depuis l'URL
    const idMatch = urlMatch[1].match(/(\d+)\.html/);
    if (idMatch) {
      listing.external_id = `alonhadat_${idMatch[1]}`;
    }
  }
  
  // Extraire le titre
  const titleMatch = articleHtml.match(/class="property-title"[^>]*>([^<]+)</i) ||
                     articleHtml.match(/itemprop="name"[^>]*>([^<]+)</i) ||
                     articleHtml.match(/<h1[^>]*>([^<]+)</i);
  if (titleMatch) {
    listing.title = titleMatch[1].trim();
  }
  
  // Extraire le prix
  const priceMatch = articleHtml.match(/class="price"[^>]*>([^<]+)</i) ||
                     articleHtml.match(/(\d+[\d.,]*\s*(tỷ|triệu|tr))/i);
  if (priceMatch) {
    listing.price_raw = priceMatch[1].trim();
    listing.price = parsePrice(priceMatch[1]);
  }
  
  // Extraire la surface
  const areaMatch = articleHtml.match(/(\d+[\d.,]*)\s*m²/i) ||
                    articleHtml.match(/(\d+[\d.,]*)\s*m2/i);
  if (areaMatch) {
    listing.area = parseFloat(areaMatch[1].replace(',', '.'));
  }
  
  // Extraire l'adresse/district
  const addressMatch = articleHtml.match(/class="address"[^>]*>([^<]+)</i) ||
                       articleHtml.match(/class="location"[^>]*>([^<]+)</i);
  if (addressMatch) {
    listing.address = addressMatch[1].trim();
    // Extraire le district
    const districtMatch = listing.address.match(/(quận|huyện|q\.?)\s*([^,]+)/i);
    if (districtMatch) {
      listing.district = districtMatch[2].trim();
    }
  }
  
  // Extraire l'image
  const imageMatch = articleHtml.match(/src="([^"]*\.(jpg|jpeg|png|webp)[^"]*)"/i);
  if (imageMatch) {
    listing.image = imageMatch[1].startsWith('http') ? imageMatch[1] : `https://alonhadat.com.vn${imageMatch[1]}`;
  }
  
  // Extraire la date
  const dateMatch = articleHtml.match(/datetime="([^"]+)"/i);
  if (dateMatch) {
    listing.posted_date = dateMatch[1];
  }
  
  // Extraire les caractéristiques (chambres, toilettes, étages)
  const bedroomMatch = articleHtml.match(/(\d+)\s*(pn|phòng ngủ|bedroom)/i);
  if (bedroomMatch) {
    listing.bedrooms = parseInt(bedroomMatch[1]);
  }
  
  const bathroomMatch = articleHtml.match(/(\d+)\s*(wc|toilet|phòng tắm)/i);
  if (bathroomMatch) {
    listing.bathrooms = parseInt(bathroomMatch[1]);
  }
  
  const floorMatch = articleHtml.match(/(\d+)\s*(tầng|lầu|floor)/i);
  if (floorMatch) {
    listing.floors = parseInt(floorMatch[1]);
  }
  
  return listing;
}

/**
 * Parser le prix en VND
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;
  
  const cleanPrice = priceStr.toLowerCase().replace(/[^\d.,tỷriệu]/g, '');
  
  // Tỷ = milliards
  if (priceStr.toLowerCase().includes('tỷ')) {
    const match = priceStr.match(/([\d.,]+)/);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      return value * 1000000000; // Convertir en VND
    }
  }
  
  // Triệu = millions
  if (priceStr.toLowerCase().includes('triệu') || priceStr.toLowerCase().includes('tr')) {
    const match = priceStr.match(/([\d.,]+)/);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      return value * 1000000; // Convertir en VND
    }
  }
  
  // Déjà en VND
  const numMatch = priceStr.match(/([\d.,]+)/);
  if (numMatch) {
    return parseFloat(numMatch[1].replace(/[.,]/g, ''));
  }
  
  return null;
}

/**
 * Sauvegarder les annonces dans Supabase
 */
async function saveToSupabase(listings) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('[Alonhadat] Supabase not configured, skipping save');
    return { saved: 0, errors: 0 };
  }
  
  const https = require('https');
  const url = new URL(`${SUPABASE_URL}/rest/v1/listings`);
  
  let saved = 0;
  let errors = 0;
  
  for (const listing of listings) {
    try {
      // Upsert basé sur external_id
      const data = JSON.stringify({
        ...listing,
        updated_at: new Date().toISOString()
      });
      
      const options = {
        hostname: url.hostname,
        path: `${url.pathname}?on_conflict=external_id`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      
      await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          if (res.statusCode === 201 || res.statusCode === 200) {
            saved++;
          } else {
            errors++;
          }
          resolve();
        });
        req.on('error', () => { errors++; resolve(); });
        req.write(data);
        req.end();
      });
    } catch (e) {
      errors++;
    }
  }
  
  console.log(`[Alonhadat] Saved: ${saved}, Errors: ${errors}`);
  return { saved, errors };
}

/**
 * Handler principal Netlify
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  // Vérifier l'API Key
  if (!SCRAPER_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'SCRAPER_API_KEY not configured' })
    };
  }
  
  try {
    // Parser les paramètres
    const params = event.queryStringParameters || {};
    const city = params.city || 'ho-chi-minh';
    const propertyType = params.propertyType || params.property_type || 'nha-dat';
    const page = parseInt(params.page) || 1;
    const maxPages = parseInt(params.maxPages) || 1;
    const save = params.save !== 'false';
    
    console.log(`[Alonhadat] Search: city=${city}, type=${propertyType}, pages=${maxPages}`);
    
    let allListings = [];
    let totalScraped = 0;
    
    // Scraper les pages demandées
    for (let p = page; p < page + maxPages; p++) {
      const url = buildAlonhadatUrl({ city, propertyType, page: p });
      const result = await scrapeWithScraperAPI(url);
      
      if (result.success) {
        const listings = parseAlonhadatListings(result.html, city, propertyType);
        allListings = allListings.concat(listings);
        totalScraped++;
        
        // Pause entre les requêtes pour éviter le rate limiting
        if (p < page + maxPages - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      } else {
        console.log(`[Alonhadat] Failed page ${p}: ${result.error}`);
      }
    }
    
    // Sauvegarder dans Supabase si demandé
    let saveResult = { saved: 0, errors: 0 };
    if (save && allListings.length > 0) {
      saveResult = await saveToSupabase(allListings);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source: 'alonhadat',
        city: CITY_MAPPING[city]?.name || city,
        propertyType: PROPERTY_TYPE_MAPPING[propertyType]?.name || propertyType,
        pagesScraped: totalScraped,
        totalListings: allListings.length,
        saved: saveResult.saved,
        errors: saveResult.errors,
        listings: allListings
      })
    };
    
  } catch (error) {
    console.error('[Alonhadat] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
