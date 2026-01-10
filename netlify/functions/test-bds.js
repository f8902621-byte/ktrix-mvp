// netlify/functions/test-bds.js

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const targetUrl = 'https://batdongsan.com.vn/ban-can-ho-chung-cu-tp-hcm?gcn=5-ty';
    const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=vn`;
    
    console.log('[BDS Test] Fetching via ScraperAPI...');
    const startTime = Date.now();
    
    const response = await fetch(scraperUrl);
    const duration = Date.now() - startTime;
    
    console.log(`[BDS Test] Response: ${response.status} (${duration}ms)`);
    
    if (!response.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: `HTTP ${response.status}`,
          duration
        })
      };
    }
    
    const html = await response.text();
    
    // Vérifier si on a du contenu Batdongsan
    const hasListings = html.includes('js__card') || html.includes('product-item') || html.includes('re__card');
    const hasBlocked = html.includes('blocked') || html.includes('captcha') || html.includes('Access Denied');
    
    // Compter les annonces potentielles
    const cardCount = (html.match(/js__card|re__card|product-item/gi) || []).length;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        duration,
        htmlLength: html.length,
        hasListings,
        hasBlocked,
        cardCount,
        sample: html.substring(0, 1000) // Premier 1000 caractères pour debug
      }, null, 2)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
