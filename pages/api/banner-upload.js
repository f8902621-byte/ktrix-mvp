import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { beta_code, image_desktop_base64, image_mobile_base64, image_desktop_type, image_mobile_type } = req.body || {};

  if (!beta_code || !image_desktop_base64 || !image_mobile_base64) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Vérifier que le code partenaire est valide et actif
    const { data: partner, error: partnerError } = await supabase
      .from('beta_testers')
      .select('code, is_active, code_type, partner_group_name, partner_group_url, expires_at')
      .eq('code', beta_code.toUpperCase())
      .eq('code_type', 'partner')
      .eq('is_active', true)
      .single();

    if (partnerError || !partner) {
      return res.status(403).json({ error: 'invalid_code' });
    }

    // Vérifier expiration du partenariat
    if (partner.expires_at && new Date(partner.expires_at) < new Date()) {
      return res.status(403).json({ error: 'expired_code' });
    }

    // Vérifier si une bannière existe déjà pour ce partenaire
    const { data: existing } = await supabase
      .from('ad_banners')
      .select('id')
      .eq('partner_code', beta_code.toUpperCase())
      .single();

    const timestamp = Date.now();
    const codeSlug = beta_code.toUpperCase().replace(/[^A-Z0-9]/g, '-');

    // Upload image desktop
    const desktopBuffer = Buffer.from(image_desktop_base64.split(',')[1] || image_desktop_base64, 'base64');
    const desktopExt = (image_desktop_type || 'image/jpeg').split('/')[1];
    const desktopPath = `${codeSlug}/desktop-${timestamp}.${desktopExt}`;

    const { error: desktopError } = await supabase.storage
      .from('ad-banners')
      .upload(desktopPath, desktopBuffer, {
        contentType: image_desktop_type || 'image/jpeg',
        upsert: true,
      });
    if (desktopError) throw desktopError;

    // Upload image mobile
    const mobileBuffer = Buffer.from(image_mobile_base64.split(',')[1] || image_mobile_base64, 'base64');
    const mobileExt = (image_mobile_type || 'image/jpeg').split('/')[1];
    const mobilePath = `${codeSlug}/mobile-${timestamp}.${mobileExt}`;

    const { error: mobileError } = await supabase.storage
      .from('ad-banners')
      .upload(mobilePath, mobileBuffer, {
        contentType: image_mobile_type || 'image/jpeg',
        upsert: true,
      });
    if (mobileError) throw mobileError;

    // Construire les URLs publiques
    const { data: desktopUrl } = supabase.storage.from('ad-banners').getPublicUrl(desktopPath);
    const { data: mobileUrl } = supabase.storage.from('ad-banners').getPublicUrl(mobilePath);

    // Calculer expiration 6 mois
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    if (existing) {
      // Mettre à jour la bannière existante
      await supabase
        .from('ad_banners')
        .update({
          image_url_desktop: desktopUrl.publicUrl,
          image_url_mobile: mobileUrl.publicUrl,
          is_active: true,
          expires_at: expiresAt.toISOString(),
        })
        .eq('partner_code', beta_code.toUpperCase());
    } else {
      // Créer une nouvelle bannière
      await supabase
        .from('ad_banners')
        .insert({
          partner_code: beta_code.toUpperCase(),
          group_name: partner.partner_group_name,
          group_url: partner.partner_group_url,
          image_url_desktop: desktopUrl.publicUrl,
          image_url_mobile: mobileUrl.publicUrl,
          is_active: true,
          expires_at: expiresAt.toISOString(),
        });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Banner upload error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
