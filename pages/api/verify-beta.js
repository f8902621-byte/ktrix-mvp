import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, error: 'No code provided' });
  }
  const trimmed = code.toUpperCase().trim();

  try {
    const { data, error } = await supabase
      .from('beta_testers')
      .select('*')
      .eq('code', trimmed)
      .single();

    if (error || !data) {
      return res.status(200).json({ valid: false, error: 'Code not found' });
    }

    if (!data.is_active) {
      return res.status(200).json({ valid: false, error: 'Code deactivated' });
    }

    // Types de codes permanents (pas d'expiration)
    const isAdminCode = trimmed.startsWith('KTRIX-ADMIN');
    const isPartnerCode = trimmed.startsWith('KTRIX-FB-') || data.code_type === 'partner';
    const isPermanent = isAdminCode || isPartnerCode;

    // Vérification expiration (sauf codes permanents)
    if (!isPermanent && data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(200).json({ valid: false, error: 'Code expired' });
    }

    // Vérification inscription (sauf codes permanents qui n'ont pas besoin d'email)
    if (!isPermanent && (!data.email || data.email === '' || data.email === 'EMPTY')) {
      return res.status(200).json({ valid: false, needsRegistration: true, error: 'Registration required' });
    }

    // Mise à jour last access
    await supabase
      .from('beta_testers')
      .update({ last_search_at: new Date().toISOString() })
      .eq('code', trimmed);

    // Calcul jours restants
    let daysRemaining = null;
    if (!isPermanent && data.expires_at) {
      const msRemaining = new Date(data.expires_at) - new Date();
      daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    }

    return res.status(200).json({
      valid: true,
      isPartner: isPartnerCode,
      isAdmin: isAdminCode,
      tester: {
        first_name: data.first_name || (isPartnerCode ? 'Partenaire' : null),
        last_name: data.last_name,
        code: data.code,
        code_type: data.code_type || 'beta',
        expires_at: data.expires_at,
        days_remaining: daysRemaining,
        partner_group_url: data.partner_group_url || null,
        partner_group_name: data.partner_group_name || null,
      }
    });
  } catch (err) {
    console.error('Beta verification error:', err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
