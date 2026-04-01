import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { group_name, group_url, member_count, admin_name, email, city, language } = req.body || {};

  if (!group_name || !group_url || !member_count || !admin_name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Vérifier si cet email ou ce groupe a déjà postulé
    const { data: existing } = await supabase
      .from('beta_testers')
      .select('id, code_type')
      .or(`email.eq.${email},partner_group_url.eq.${group_url}`)
      .in('code_type', ['partner', 'partner_pending'])
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'already_applied' });
    }

    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const pendingCode = `PENDING-FB-${suffix}`;

    const { error: insertError } = await supabase
      .from('beta_testers')
      .insert({
        code: pendingCode,
        code_type: 'partner_pending',
        partner_group_name: group_name,
        partner_group_url: group_url,
        first_name: admin_name,
        email: email,
        city: city || null,
        language: language || 'en',
        notes: `Membres: ${member_count}`,
        is_active: false,
        registered_at: new Date().toISOString(),
        expires_at: null,
      });

    if (insertError) throw insertError;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Partner apply error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
