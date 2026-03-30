import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { city, district, propertyType, priceMax, priceMin } = req.body;

  try {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('source', 'facebook')
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString().split('T')[0]);

    if (city) query = query.ilike('city', `%${city}%`);
    if (district) query = query.ilike('district', `%${district}%`);
    if (propertyType && propertyType !== 'Tất cả nhà đất') {
      query = query.ilike('property_type', `%${propertyType}%`);
    }
    if (priceMin && Number(priceMin) > 0) {
      query = query.gte('price', Number(priceMin) * 1000);
    }
    if (priceMax && Number(priceMax) > 0) {
      query = query.lte('price', Number(priceMax) * 1000);
    }

    query = query.order('last_seen', { ascending: false }).limit(50);

    const { data, error } = await query;
    if (error) throw error;

    const results = (data || []).map(listing => ({
      id: listing.id,
      source: 'facebook',
      title: listing.title || 'Annonce Facebook',
      price: listing.price ? listing.price * 1000000 : null,
      area: listing.area,
      floorArea: listing.area,
      city: listing.city,
      district: listing.district,
      ward: listing.ward,
      address: [listing.street, listing.ward, listing.district, listing.city].filter(Boolean).join(', '),
      propertyType: listing.property_type,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      floors: listing.floors,
      legalStatus: listing.legal_status,
      imageUrl: listing.thumbnail || null,
      url: listing.url,
      facebookGroupUrl: listing.facebook_group_url,
      facebookGroupName: listing.facebook_group_name,
      facebook_group_name: listing.facebook_group_name,
      facebook_group_url: listing.facebook_group_url,
      score: listing.negotiation_score || 50,
      negotiationScore: listing.negotiation_score || 50,
      postedOn: listing.first_seen,
      expiresAt: listing.expires_at,
      isNew: listing.first_seen === new Date().toISOString().split('T')[0],
      urgentKeywords: [],
      matchedKeywords: [],
      pricePerSqm: listing.price_per_m2 ? listing.price_per_m2 * 1000000 : null,
    }));

    return res.status(200).json({ results, total: results.length });

  } catch (err) {
    console.error('[search-fb-listings] error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
