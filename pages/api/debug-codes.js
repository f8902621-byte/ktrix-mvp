// /pages/api/debug-codes.js
// Endpoint temporaire pour voir les ward codes Chotot
// Accès: https://ktrix-mvp.vercel.app/api/debug-codes

export default async function handler(req, res) {
  try {
    // Appel interne à l'API search avec Chotot seul
    const baseUrl = req.headers.host.includes('localhost') 
      ? `http://${req.headers.host}` 
      : `https://${req.headers.host}`;
    
    const searchResponse = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: 'Hồ Chí Minh',
        district: 'Thủ Đức',
        ward: 'Thảo Điền',
        propertyType: 'Nhà ở',
        priceMax: '30',
        sources: ['chotot'],
        maxResults: 200
      })
    });
    
    const data = await searchResponse.json();
    
    const html = `<!DOCTYPE html>
<html><head><title>K Trix Debug - Chotot Codes</title>
<style>
  body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #0f0; }
  pre { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
  h1 { color: #e94560; }
  h2 { color: #ffc107; }
  .count { color: #00bcd4; font-size: 18px; }
</style>
</head><body>
<h1>🔍 K Trix Debug - Chotot Ward Codes</h1>
<p>Recherche: Thảo Điền, Thủ Đức - Nhà ở - Max 30 tỷ</p>
<p class="count">Résultats Chotot: ${data.results?.length || 0}</p>

<h2>📊 _debug data:</h2>
<pre>${data._debug ? JSON.stringify(data._debug, null, 2) : 'Pas de _debug (aucune annonce Thu Duc trouvée)'}</pre>

<h2>📋 Résumé rapide:</h2>
${data._debug ? `
<p>Thu Duc ads: <b>${data._debug.thuDucAdsCount}</b></p>
<p>area_v2 codes: <b>${JSON.stringify(data._debug.areaV2Codes)}</b></p>
<h3 style="color:#ffc107">Wards Q2 cũ (Thảo Điền devrait être ici):</h3>
<pre>${JSON.stringify(data._debug.q2CuWards, null, 2)}</pre>
<h3 style="color:#ffc107">Top 30 wards:</h3>
<pre>${JSON.stringify(data._debug.wardCodesTop30, null, 2)}</pre>
` : '<p>Aucune donnée debug</p>'}
</body></html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
    
  } catch (error) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(`<h1>Erreur</h1><pre>${error.message}\n${error.stack}</pre>`);
  }
}
