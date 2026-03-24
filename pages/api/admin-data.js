import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  const { password, action, code, data: actionData } = req.body || {};

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // GET all testers
    if (req.method === 'POST' && action === 'list') {
      const { data, error } = await supabase
        .from('beta_testers')
        .select('*')
        .order('registered_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ testers: data });
    }

    // ── NOUVEAU : Créer un code partenaire FB ──
    if (action === 'create_partner') {
      const { group_name, group_url, city, notes } = actionData || {};
      if (!group_name || !group_url) {
        return res.status(400).json({ error: 'group_name and group_url are required' });
      }
      // Générer un code unique KTRIX-FB-XXXX
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newCode = `KTRIX-FB-${suffix}`;

      const { data: newPartner, error } = await supabase
        .from('beta_testers')
        .insert({
          code: newCode,
          code_type: 'partner',
          partner_group_name: group_name,
          partner_group_url: group_url,
          city: city || null,
          notes: notes || null,
          is_active: true,
          email: 'PARTNER', // marqueur spécial
          first_name: group_name,
          registered_at: new Date().toISOString(),
          expires_at: null, // permanent
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, partner: newPartner, code: newCode });
    }

    // ── NOUVEAU : Lister les codes partenaires ──
    if (action === 'list_partners') {
      const { data, error } = await supabase
        .from('beta_testers')
        .select('*')
        .eq('code_type', 'partner')
        .order('registered_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ partners: data || [] });
    }

    // Toggle active status
    if (action === 'toggle') {
      const { data: tester } = await supabase
        .from('beta_testers')
        .select('is_active')
        .eq('code', code)
        .single();
      const { error } = await supabase
        .from('beta_testers')
        .update({ is_active: !tester.is_active })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // Extend expiration
    if (action === 'extend') {
      const days = actionData?.days || 180;
      const { error } = await supabase
        .from('beta_testers')
        .update({
          expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // Add note
    if (action === 'note') {
      const { error } = await supabase
        .from('beta_testers')
        .update({ notes: actionData?.note || '' })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // Reset search count
    if (action === 'reset') {
      const { error } = await supabase
        .from('beta_testers')
        .update({ search_count: 0 })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // Reset complet d'un testeur
    if (action === 'reset_full') {
      const { error } = await supabase
        .from('beta_testers')
        .update({
          first_name: null, last_name: null, email: null,
          age: null, city: null, sector: null,
          search_count: 0, registered_at: null, expires_at: null,
          notes: null, feedback: null, status: 'active', is_active: true,
        })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // Liste tous les feedbacks
    if (action === 'list_feedbacks') {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ feedbacks: data || [] });
    }

    // RAZ générale
    if (action === 'reset_all_test_data') {
      const { error: e1 } = await supabase.from('feedbacks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('saved_searches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (e2) throw e2;
      const { error: e3 } = await supabase
        .from('beta_testers')
        .update({
          first_name: null, last_name: null, email: null,
          age: null, city: null, sector: null,
          search_count: 0, last_search_at: null, other_activity: null,
          registered_at: null, expires_at: null,
          notes: null, feedback: null, status: 'active', is_active: true,
        })
        .eq('code_type', 'beta') // ne touche PAS aux partenaires ni aux admins
        .neq('code', 'KTRIX-ADMIN0');
      if (e3) throw e3;
      return res.status(200).json({ success: true, message: 'RAZ complète effectuée' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Admin error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
