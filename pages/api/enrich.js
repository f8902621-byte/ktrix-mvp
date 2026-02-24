// ============================================
// KTRIX - API ENRICH (Alonhadat Detail Scraper)
// Endpoint: /api/enrich
// Called when user clicks "View Details" on an Alonhadat listing
// Returns real data from detail page (replaces NLP guesses)
// ============================================

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body || {};

  if (!url || !url.includes('alonhadat.com.vn')) {
    return res.status(400).json({ error: 'Invalid Alonhadat URL' });
  }

  if (!SCRAPER_API_KEY) {
    return res.status(500).json({ error: 'SCRAPER_API_KEY not configured' });
  }

  console.log(`[ENRICH] Fetching detail page: ${url}`);

  try {
    const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=true`;
    const response = await fetch(scraperUrl);

    if (!response.ok) {
      console.log(`[ENRICH] HTTP ${response.status}`);
      return res.status(502).json({ error: `ScraperAPI returned ${response.status}` });
    }

    const html = await response.text();
    console.log(`[ENRICH] HTML received: ${html.length} chars`);

    const enriched = {};

    // === AREA (Diện tích) ===
    const areaMatch = html.match(/[Dd]iện\s*tích[^<]*<[^>]*>\s*(\d+(?:[,\.]\d+)?)\s*m/i) ||
                      html.match(/dien\s*tich[^:]*:\s*(\d+(?:[,\.]\d+)?)\s*m/i) ||
                      html.match(/<span[^>]*class="[^"]*square[^"]*"[^>]*>(\d+(?:[,\.]\d+)?)\s*m/i);
    if (areaMatch) {
      enriched.area = parseFloat(areaMatch[1].replace(',', '.'));
      console.log(`[ENRICH] Area: ${enriched.area} m²`);
    }

    // === BEDROOMS (Số phòng ngủ) ===
    const bedroomMatch = html.match(/[Ss]ố\s*phòng\s*ngủ[^<]*<[^>]*>\s*(\d+)/i) ||
                         html.match(/phòng\s*ngủ[^:]*:\s*(\d+)/i) ||
                         html.match(/[Ss]o\s*phong\s*ngu[^<]*<[^>]*>\s*(\d+)/i);
    if (bedroomMatch) {
      enriched.bedrooms = parseInt(bedroomMatch[1]);
      console.log(`[ENRICH] Bedrooms: ${enriched.bedrooms}`);
    }

    // === BATHROOMS (Số phòng tắm / toilet / WC) ===
    const bathMatch = html.match(/[Ss]ố\s*(?:phòng\s*tắm|toilet|WC|wc)[^<]*<[^>]*>\s*(\d+)/i) ||
                      html.match(/(?:phòng\s*tắm|toilet|wc)[^:]*:\s*(\d+)/i);
    if (bathMatch) {
      enriched.bathrooms = parseInt(bathMatch[1]);
      console.log(`[ENRICH] Bathrooms: ${enriched.bathrooms}`);
    }

    // === LEGAL STATUS (Pháp lý) ===
    const legalMatch = html.match(/[Pp]háp\s*lý[^<]*<[^>]*>\s*([^<]+)/i) ||
                       html.match(/phap\s*ly[^:]*:\s*([^<,\n]+)/i);
    if (legalMatch) {
      const legalText = legalMatch[1].trim();
      if (legalText !== '---' && legalText !== '—' && legalText !== '_' && legalText.length > 1) {
        const lt = legalText.toLowerCase();
        if (lt.includes('hồng') || lt.includes('đỏ')) {
          enriched.legalStatus = 'Sổ hồng/Sổ đỏ';
        } else if (lt.includes('chung')) {
          enriched.legalStatus = 'Sổ chung';
        } else if (lt.includes('gpxd') || lt.includes('giấy phép')) {
          enriched.legalStatus = 'GPXD';
        } else if (lt.includes('giấy tay')) {
          enriched.legalStatus = 'Giấy tay';
        } else if (lt.includes('vi bằng')) {
          enriched.legalStatus = 'Vi bằng';
        } else {
          enriched.legalStatus = legalText;
        }
        console.log(`[ENRICH] Legal: ${enriched.legalStatus}`);
      }
    }

    // === FACADE WIDTH (Chiều ngang) ===
    const widthMatch = html.match(/[Cc]hiều\s*ngang[^<]*<[^>]*>\s*(\d+[,.]?\d*)\s*m/i) ||
                       html.match(/chieu\s*ngang[^:]*:\s*(\d+[,.]?\d*)/i);
    if (widthMatch) {
      enriched.facadeWidth = parseFloat(widthMatch[1].replace(',', '.'));
      console.log(`[ENRICH] Facade width: ${enriched.facadeWidth}m`);
    }

    // === DEPTH (Chiều dài) ===
    const depthMatch = html.match(/[Cc]hiều\s*dài[^<]*<[^>]*>\s*(\d+[,.]?\d*)\s*m/i) ||
                       html.match(/chieu\s*dai[^:]*:\s*(\d+[,.]?\d*)/i);
    if (depthMatch) {
      enriched.depth = parseFloat(depthMatch[1].replace(',', '.'));
      console.log(`[ENRICH] Depth: ${enriched.depth}m`);
    }

    // === FLOORS (Số lầu) ===
    const floorMatch = html.match(/[Ss]ố\s*lầu[^<]*<[^>]*>\s*(\d+)/i) ||
                       html.match(/số\s*tầng[^<]*<[^>]*>\s*(\d+)/i) ||
                       html.match(/so\s*lau[^:]*:\s*(\d+)/i);
    if (floorMatch) {
      enriched.floors = parseInt(floorMatch[1]);
      console.log(`[ENRICH] Floors: ${enriched.floors}`);
    }

    // === DIRECTION (Hướng) ===
    const dirMatch = html.match(/[Hh]ướng[^<]*<[^>]*>\s*([^<]+)/i);
    if (dirMatch) {
      const dirText = dirMatch[1].trim();
      if (dirText !== '—' && dirText !== '_' && dirText !== '---' && dirText.length > 0) {
        enriched.direction = dirText;
        console.log(`[ENRICH] Direction: ${enriched.direction}`);
      }
    }

    // === STREET WIDTH (Đường trước nhà) ===
    const streetMatch = html.match(/[Đđ]ường\s*trước\s*nhà[^<]*<[^>]*>\s*(\d+[,.]?\d*)\s*m/i) ||
                        html.match(/duong\s*truoc\s*nha[^:]*:\s*(\d+[,.]?\d*)/i);
    if (streetMatch) {
      enriched.streetWidth = parseFloat(streetMatch[1].replace(',', '.'));
      console.log(`[ENRICH] Street width: ${enriched.streetWidth}m`);
    }

    // === PROPERTY TYPE (Loại BDS) ===
    const typeMatch = html.match(/[Ll]oại\s*BDS[^<]*<[^>]*>\s*([^<]+)/i) ||
                      html.match(/loai\s*bds[^:]*:\s*([^<,\n]+)/i);
    if (typeMatch) {
      const typeText = typeMatch[1].trim().toLowerCase();
      if (typeText.includes('mặt tiền') || typeText.includes('mat tien')) {
        enriched.streetAccess = 'mat_tien';
      } else if (typeText.includes('hẻm') || typeText.includes('hem')) {
        enriched.streetAccess = 'hem';
      }
      console.log(`[ENRICH] Street access: ${enriched.streetAccess || typeText}`);
    }

    // === DIMENSIONS (build from facadeWidth × depth if area not found) ===
    if (!enriched.area && enriched.facadeWidth && enriched.depth) {
      enriched.area = Math.round(enriched.facadeWidth * enriched.depth * 10) / 10;
      console.log(`[ENRICH] Area calculated: ${enriched.facadeWidth} × ${enriched.depth} = ${enriched.area} m²`);
    }

    const fieldCount = Object.keys(enriched).length;
    console.log(`[ENRICH] Done: ${fieldCount} fields extracted`);

    return res.status(200).json({
      success: true,
      enriched,
      fieldsFound: fieldCount
    });

  } catch (error) {
    console.error(`[ENRICH] Error:`, error.message);
    return res.status(500).json({ error: error.message });
  }
}
