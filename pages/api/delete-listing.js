import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { listing_id, beta_code } = req.body || {};

  if (!listing_id || !beta_code) {
    return res.status(400).json({ error: 'listing_id and beta_code are required' });
  }

  try {
    // Vérifier que le code partenaire est valide et actif
    const { data: partner, error: partnerError } = await supabase
      .from('beta_testers')
      .select('code, is_active, code_type')
      .eq('code', beta_code.toUpperCase())
      .eq('code_type', 'partner')
      .eq('is_active', true)
      .single();

    if (partnerError || !partner) {
      return res.status(403).json({ error: 'Invalid or inactive partner code' });
    }

    // Vérifier que l'annonce appartient bien à ce partenaire
    const { data: listing, error: listingError } = await supabase
      .from('facebook_listings')
      .select('id, beta_code, is_active')
      .eq('id', listing_id)
      .eq('beta_code', beta_code.toUpperCase())
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found or not owned by this partner' });
    }

    // Masquer l'annonce (is_active = false)
    const { error: updateError } = await supabase
      .from('facebook_listings')
      .update({ is_active: false })
      .eq('id', listing_id);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete listing error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
