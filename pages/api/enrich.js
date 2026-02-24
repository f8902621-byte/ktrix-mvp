// ============================================
// KTRIX - API ENRICH (Alonhadat Detail Scraper)
// Endpoint: /api/enrich
// Called when user clicks "View Details" on an Alonhadat listing
// Returns real data from detail page (replaces NLP guesses)
// V2 — Fixed regex for Alonhadat table HTML format
// ============================================

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// Helper: extract value from Alonhadat detail page
// Handles both formats:
//   <td>Label</td><td>Value</td>        (table format)
//   <td>Label</td>\n<td>Value</td>      (table with newlines)
//   Label</...><...>Value                (generic tag pairs)
function extractField(html, labelPattern) {
  // Format 1: <td>Label</td> ... <td>Value</td> (table rows)
  const tableRegex = new RegExp(
    labelPattern + '[^<]*</(?:td|th|span|div)>\\s*<(?:td|th|span|div)[^>]*>\\s*([^<]+)',
    'i'
  );
  const tableMatch = html.match(tableRegex);
  if (tableMatch) {
    const val = tableMatch[1].trim();
    if (val && val !== '---' && val !== '—' && val !== '_' && val !== '' && !val.includes('Xem chi')) {
      return val;
    }
  }

  // Format 2: Label</tag> whitespace/tags <tag>Value (more flexible)
  const flexRegex = new RegExp(
    labelPattern + '[^<]*<\\/[^>]+>\\s*(?:<[^>]+>\\s*)*([^<]{1,100})',
    'i'
  );
  const flexMatch = html.match(flexRegex);
  if (flexMatch) {
    const val = flexMatch[1].trim();
    if (val && val !== '---' && val !== '—' && val !== '_' && val !== '' && !val.includes('Xem chi')) {
      return val;
    }
  }

  return null;
}

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

    // === AREA (Diện tích) — PRIORITÉ : lire le chiffre affiché ===
    // Format header: "Diện tích: 100 m²" ou "Diện tích</span><span>100 m²"
    const areaHeaderMatch = html.match(/[Dd]iện\s*tích[:\s]*(\d+(?:[,\.]\d+)?)\s*m/i);
    if (areaHeaderMatch) {
      enriched.area = parseFloat(areaHeaderMatch[1].replace(',', '.'));
      console.log(`[ENRICH] Area (header): ${enriched.area} m²`);
    }
    // Format table: <td>Diện tích</td><td>100 m²</td>
    if (!enriched.area) {
      const areaVal = extractField(html, '[Dd]iện\\s*tích');
      if (areaVal) {
        const num = areaVal.match(/(\d+(?:[,\.]\d+)?)/);
        if (num) {
          enriched.area = parseFloat(num[1].replace(',', '.'));
          console.log(`[ENRICH] Area (table): ${enriched.area} m²`);
        }
      }
    }

    // === BEDROOMS (Số phòng ngủ) ===
    const bedsVal = extractField(html, '[Ss]ố\\s*phòng\\s*ngủ');
    if (bedsVal) {
      const num = bedsVal.match(/(\d+)/);
      if (num) {
        enriched.bedrooms = parseInt(num[1]);
        console.log(`[ENRICH] Bedrooms: ${enriched.bedrooms}`);
      }
    }

    // === BATHROOMS (Số phòng tắm / toilet / WC) ===
    const bathVal = extractField(html, '[Ss]ố\\s*(?:phòng\\s*tắm|toilet|WC|wc)');
    if (bathVal) {
      const num = bathVal.match(/(\d+)/);
      if (num) {
        enriched.bathrooms = parseInt(num[1]);
        console.log(`[ENRICH] Bathrooms: ${enriched.bathrooms}`);
      }
    }

    // === LEGAL STATUS (Pháp lý) ===
    const legalVal = extractField(html, '[Pp]háp\\s*l[yý]');
    if (legalVal) {
      const lt = legalVal.toLowerCase();
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
      } else if (lt.includes('hợp đồng')) {
        enriched.legalStatus = 'Hợp đồng mua bán';
      } else {
        enriched.legalStatus = legalVal;
      }
      console.log(`[ENRICH] Legal: ${enriched.legalStatus}`);
    }

    // === FACADE WIDTH (Chiều ngang) ===
    const widthVal = extractField(html, '[Cc]hiều\\s*ngang');
    if (widthVal) {
      const num = widthVal.match(/(\d+(?:[,\.]\d+)?)/);
      if (num) {
        enriched.facadeWidth = parseFloat(num[1].replace(',', '.'));
        console.log(`[ENRICH] Facade width: ${enriched.facadeWidth}m`);
      }
    }

    // === DEPTH (Chiều dài) ===
    const depthVal = extractField(html, '[Cc]hiều\\s*dài');
    if (depthVal) {
      const num = depthVal.match(/(\d+(?:[,\.]\d+)?)/);
      if (num) {
        enriched.depth = parseFloat(num[1].replace(',', '.'));
        console.log(`[ENRICH] Depth: ${enriched.depth}m`);
      }
    }

    // === FLOORS (Số lầu / Số tầng) ===
    const floorVal = extractField(html, '[Ss]ố\\s*(?:lầu|tầng)');
    if (floorVal) {
      const num = floorVal.match(/(\d+)/);
      if (num) {
        enriched.floors = parseInt(num[1]);
        console.log(`[ENRICH] Floors: ${enriched.floors}`);
      }
    }

    // === DIRECTION (Hướng) ===
    const dirVal = extractField(html, '[Hh]ướng');
    if (dirVal && dirVal.length < 20) {
      enriched.direction = dirVal;
      console.log(`[ENRICH] Direction: ${enriched.direction}`);
    }

    // === STREET WIDTH (Đường trước nhà) ===
    const streetVal = extractField(html, '[Đđ]ường\\s*trước\\s*nhà');
    if (streetVal) {
      const num = streetVal.match(/(\d+(?:[,\.]\d+)?)/);
      if (num) {
        enriched.streetWidth = parseFloat(num[1].replace(',', '.'));
        console.log(`[ENRICH] Street width: ${enriched.streetWidth}m`);
      }
    }

    // === PROPERTY TYPE / STREET ACCESS (Loại BDS) ===
    const typeVal = extractField(html, '[Ll]oại\\s*BDS');
    if (typeVal) {
      const tt = typeVal.toLowerCase();
      if (tt.includes('mặt tiền') || tt.includes('mat tien')) {
        enriched.streetAccess = 'mat_tien';
      } else if (tt.includes('trong hẻm') || tt.includes('hẻm') || tt.includes('hem')) {
        enriched.streetAccess = 'hem';
      }
      console.log(`[ENRICH] Street access: ${enriched.streetAccess || typeVal}`);
    }

    // === DIMENSIONS → fallback area ONLY if area not already found ===
    if (!enriched.area && enriched.facadeWidth && enriched.depth) {
      enriched.area = Math.round(enriched.facadeWidth * enriched.depth * 10) / 10;
      enriched.areaCalculated = true;
      console.log(`[ENRICH] Area CALCULATED: ${enriched.facadeWidth} × ${enriched.depth} = ${enriched.area} m²`);
    }

    const fieldCount = Object.keys(enriched).length;
    console.log(`[ENRICH] Done: ${fieldCount} fields extracted from ${url}`);

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
