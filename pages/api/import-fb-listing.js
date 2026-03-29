import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Nettoie le HTML pour extraire le texte brut
function extractTextFromHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
    .slice(0, 8000);
}

// Appel Claude pour extraire les données immobilières
async function extractListingData(rawText, listingUrl) {
  const prompt = `Tu es un expert en immobilier vietnamien. Analyse ce texte brut d'une annonce immobilière et extrait les informations structurées.

Texte de l'annonce :
"""
${rawText}
"""

URL source : ${listingUrl}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte (null si information non trouvée) :
{
  "title": "titre de l'annonce",
  "price": 0,
  "price_unit": "ty",
  "area": 0,
  "city": "nom de la ville en vietnamien",
  "district": "nom du district",
  "ward": "nom du quartier ou null",
  "street": "adresse ou null",
  "property_type": "type de bien (Nhà ở / Căn hộ / Đất / Nhà biệt thự / Shophouse / Văn phòng / Mặt bằng)",
  "bedrooms": 0,
  "bathrooms": 0,
  "floors": 0,
  "legal_status": "Sổ đỏ/Sổ hồng ou null",
  "direction": "hướng ou null",
  "furnishing": "nội thất ou null",
  "street_width": 0,
  "facade_width": 0,
  "contact_phone": "numéro de téléphone ou null",
  "description": "description courte en 2-3 phrases",
  "keywords": ["liste", "de", "mots", "clés"],
  "negotiation_score": 50
}

Règles :
- price doit être en millions de VND (ex: 5 tỷ = 5000, 500 triệu = 500)
- area en m²
- negotiation_score entre 0 et 100 selon les signaux (bán gấp=80, thương lượng=70, normal=50)
- Si le texte ne contient pas d'annonce immobilière valide, retourne {"error": "not_a_listing"}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  return JSON.parse(jsonMatch[0]);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { listingUrl, postText, groupUrl, groupName, betaCode } = req.body;

  if (!groupUrl) {
    return res.status(400).json({ error: 'groupUrl is required' });
  }

  if (!postText && !listingUrl) {
    return res.status(400).json({ error: 'Either postText or listingUrl is required' });
  }

  try {
    let rawText = '';

    // ── Étape 1 : Utiliser postText si fourni, sinon tenter le fetch ──
    if (postText && postText.trim().length > 50) {
      // Cas principal : l'utilisateur a collé le texte directement
      rawText = postText.trim().slice(0, 8000);
    } else if (listingUrl) {
      // Fallback : tenter le scraping (marche parfois sur mobile/liens publics)
      try {
        const fetchRes = await fetch(listingUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; KTrixBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
        const html = await fetchRes.text();
        rawText = extractTextFromHtml(html);
      } catch (fetchErr) {
        console.error('Fetch error:', fetchErr.message);
        return res.status(422).json({
          error: 'fetch_failed',
          message: 'Could not fetch the Facebook page. Please paste the post text directly.',
        });
      }
    }

    if (!rawText || rawText.length < 50) {
      return res.status(422).json({
        error: 'empty_content',
        message: 'The content is too short or empty. Please paste the full post text.',
      });
    }

    // ── Étape 2 : Extraction NLP via Claude ──
    let extracted;
    try {
      extracted = await extractListingData(rawText, listingUrl || '');
    } catch (nlpErr) {
      console.error('NLP error:', nlpErr.message);
      return res.status(500).json({ error: 'nlp_failed', message: 'AI extraction failed.' });
    }

    if (extracted.error === 'not_a_listing') {
      return res.status(422).json({
        error: 'not_a_listing',
        message: 'This content does not appear to contain a real estate listing.',
      });
    }

    // ── Étape 3 : Construire l'objet listing ──
    const listingId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const priceInMillions = extracted.price || 0;

    const listing = {
      id: listingId,
      source: 'facebook',
      title: extracted.title || 'Annonce Facebook',
      price: priceInMillions,
      area: extracted.area || null,
      price_per_m2: extracted.area && priceInMillions
        ? Math.round(priceInMillions / extracted.area)
        : null,
      city: extracted.city || null,
      district: extracted.district || null,
      ward: extracted.ward || null,
      property_type: extracted.property_type || null,
      bedrooms: extracted.bedrooms || null,
      bathrooms: extracted.bathrooms || null,
      floors: extracted.floors || null,
      street_width: extracted.street_width || null,
      facade_width: extracted.facade_width || null,
      legal_status: extracted.legal_status || null,
      direction: extracted.direction || null,
      furnishing: extracted.furnishing || null,
      url: listingUrl || null,
      facebook_group_url: groupUrl,
      facebook_group_name: groupName || null,
      contact_phone: extracted.contact_phone || null,
      negotiation_score: extracted.negotiation_score || 50,
      is_active: true,
      first_seen: new Date().toISOString().split('T')[0],
      last_seen: new Date().toISOString().split('T')[0],
    };

    // ── Étape 4 : Sauvegarder dans Supabase ──
    // Upsert sur url si disponible, sinon insert simple
    let saved, dbError;
    if (listingUrl) {
      ({ data: saved, error: dbError } = await supabase
        .from('listings')
        .upsert(listing, { onConflict: 'url' })
        .select()
        .single());
    } else {
      ({ data: saved, error: dbError } = await supabase
        .from('listings')
        .insert(listing)
        .select()
        .single());
    }

    if (dbError) {
      console.error('DB error:', dbError);
      return res.status(500).json({ error: 'db_failed', message: 'Failed to save listing.' });
    }

    // ── Étape 5 : Retourner le résultat ──
    return res.status(200).json({
      success: true,
      listing: {
        id: listingId,
        title: listing.title,
        price: listing.price,
        area: listing.area,
        city: listing.city,
        district: listing.district,
        property_type: listing.property_type,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        legal_status: listing.legal_status,
        contact_phone: listing.contact_phone,
        facebook_group_name: listing.facebook_group_name,
        facebook_group_url: listing.facebook_group_url,
        url: listing.url,
        negotiation_score: listing.negotiation_score,
        description: extracted.description,
      },
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
