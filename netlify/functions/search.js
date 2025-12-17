const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    body = {};
  }

  const { city, propertyType, priceMax, bedrooms } = body;

  try {
    const datasetUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/last/dataset/items?token=${APIFY_API_TOKEN}`;
    
    const response = await fetch(datasetUrl);
    
    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    let results = await response.json();

    // Filtrer les résultats sans prix
    results = results.filter(item => item.price && item.price > 0);

    // Filtrer par prix max (convertir Tỷ en VND)
    if (priceMax) {
      const priceMaxVND = parseFloat(priceMax) * 1000000000;
      results = results.filter(item => item.price <= priceMaxVND);
    }

    // Filtrer par nombre de chambres
    if (bedrooms) {
      results = results.filter(item => item.bedrooms >= parseInt(bedrooms));
    }

    // Mapper les données au format frontend
    const mappedResults = results.slice(0, 50).map((item, index) => ({
      id: item.id || index,
      title: item.title || 'Sans titre',
      price: item.price || 0,
      pricePerSqm: item.floorAreaSqm && item.price ? Math.round(item.price / item.floorAreaSqm) : 0,
      city: city || 'Vietnam',
      district: item.address || '',
      address: item.address || '',
      floorArea: item.floorAreaSqm || 0,
      bedrooms: item.bedrooms || 0,
      imageUrl: item.thumbnail || item.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image',
      url: item.url || '#',
      score: Math.floor(Math.random() * 30) + 70,
      hasUrgentKeyword: item.title?.toLowerCase().includes('gấp') || item.title?.toLowerCase().includes('urgent') || false,
      isNew: item.postedOn?.includes('hôm nay') || item.postedOn?.includes('today') || false
    }));

    const prices = mappedResults.map(r => r.price).filter(p => p > 0);
    const stats = {
      lowestPrice: prices.length > 0 ? Math.min(...prices) : 0,
      highestPrice: prices.length > 0 ? Math.max(...prices) : 0,
      totalResults: mappedResults.length
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        results: mappedResults,
        stats
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        results: [],
        stats: { lowestPrice: 0, highestPrice: 0, totalResults: 0 }
      })
    };
  }
};
