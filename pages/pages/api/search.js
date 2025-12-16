// API Route pour appeler Apify et récupérer les données immobilières
import { ApifyClient } from 'apify-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      city,
      district,
      propertyType,
      priceMax,
      livingAreaMin,
      livingAreaMax,
      bedrooms,
      keywords = [],
      numSites = 5
    } = req.body;

    if (!city || !priceMax || !propertyType) {
      return res.status(400).json({ 
        error: 'Critères obligatoires manquants: ville, prix max, type de bien' 
      });
    }

    const client = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });

    const input = {
      country: 'vn',
      listingType: 'sale',
      maxItems: numSites * 10,
      
      filters: {
        city: city,
        ...(district && { district: district }),
        propertyType: mapPropertyType(propertyType),
        ...(priceMax && { maxPrice: parseInt(priceMax) }),
        ...(livingAreaMin && { minArea: parseInt(livingAreaMin) }),
        ...(livingAreaMax && { maxArea: parseInt(livingAreaMax) }),
        ...(bedrooms && { bedrooms: parseInt(bedrooms) })
      }
    };

    console.log('🔍 Lancement scraper Apify:', input);

    const run = await client.actor(process.env.APIFY_ACTOR_ID).call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`📊 ${items.length} annonces récupérées`);

    const processedResults = items.map(property => {
      const score = calculateMatchScore(property, req.body);
      const hasUrgentKeyword = detectUrgentKeywords(property, keywords);
      
      return {
        id: property.id || property.url,
        title: property.title,
        price: property.price,
        pricePerSqm: property.floorArea ? Math.round(property.price / property.floorArea) : 0,
        city: property.city || city,
        district: property.district,
        address: property.address,
        floorArea: property.floorArea,
        landArea: property.landArea,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        description: property.description || '',
        imageUrl: property.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image',
        propertyType: property.propertyType,
        url: property.url,
        score: score,
        hasUrgentKeyword: hasUrgentKeyword,
        postedDate: property.postedDate,
        isNew: isNewListing(property.postedDate)
      };
    });

    processedResults.sort((a, b) => b.score - a.score);

    const stats = {
      lowestPrice: Math.min(...processedResults.map(p => p.price)),
      highestPrice: Math.max(...processedResults.map(p => p.price)),
      averagePrice: Math.round(
        processedResults.reduce((sum, p) => sum + p.price, 0) / processedResults.length
      ),
      totalResults: processedResults.length
    };

    return res.status(200).json({
      success: true,
      results: processedResults,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Erreur API:', error);
    
    return res.status(500).json({
      error: 'Erreur lors de la recherche',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

function calculateMatchScore(property, criteria) {
  let score = 0;
  let maxScore = 0;

  maxScore += 20;
  if (criteria.city && property.city?.toLowerCase().includes(criteria.city.toLowerCase())) {
    score += 20;
  }

  maxScore += 25;
  if (criteria.priceMax) {
    const maxPrice = parseFloat(criteria.priceMax);
    if (property.price <= maxPrice) {
      score += 25;
    } else if (property.price <= maxPrice * 1.1) {
      score += 15;
    }
  }

  maxScore += 20;
  if (criteria.livingAreaMin || criteria.livingAreaMax) {
    const minArea = parseFloat(criteria.livingAreaMin) || 0;
    const maxArea = parseFloat(criteria.livingAreaMax) || Infinity;
    if (property.floorArea >= minArea && property.floorArea <= maxArea) {
      score += 20;
    } else if (property.floorArea >= minArea * 0.9 && property.floorArea <= maxArea * 1.1) {
      score += 10;
    }
  }

  maxScore += 15;
  if (criteria.bedrooms) {
    const reqBedrooms = parseInt(criteria.bedrooms);
    if (property.bedrooms === reqBedrooms) {
      score += 15;
    } else if (Math.abs(property.bedrooms - reqBedrooms) === 1) {
      score += 8;
    }
  }

  maxScore += 10;
  if (criteria.district && property.district?.toLowerCase().includes(criteria.district.toLowerCase())) {
    score += 10;
  }

  maxScore += 10;
  if (criteria.keywords && criteria.keywords.length > 0) {
    const hasKeyword = criteria.keywords.some(kw => 
      property.description?.toLowerCase().includes(kw.toLowerCase()) ||
      property.title?.toLowerCase().includes(kw.toLowerCase())
    );
    if (hasKeyword) {
      score += 10;
    }
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
}

function detectUrgentKeywords(property, keywords) {
  if (!keywords || keywords.length === 0) return false;
  
  const text = `${property.description} ${property.title}`.toLowerCase();
  const urgentWords = ['bán gấp', 'bán nhanh', 'kẹt tiền', 'cần tiền', 'thanh lý'];
  
  return urgentWords.some(word => text.includes(word)) || 
         keywords.some(kw => text.includes(kw.toLowerCase()));
}

function isNewListing(postedDate) {
  if (!postedDate) return false;
  const date = new Date(postedDate);
  const now = new Date();
  const diffHours = (now - date) / (1000 * 60 * 60);
  return diffHours < 48;
}

function mapPropertyType(vnType) {
  const typeMap = {
    'Căn hộ chung cư': 'apartment',
    'Căn hộ nghỉ dưỡng': 'condo',
    'Nhà ở': 'house',
    'Nhà biệt thự': 'villa',
    'Studio': 'studio',
    'Shophouse': 'shophouse',
    'Văn phòng': 'office',
    'Đất': 'land'
  };
  
  return typeMap[vnType] || 'apartment';
}
