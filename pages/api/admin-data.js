import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export default async function handler(req, res) {
  const { password, action, code, data: actionData } = req.body || {};
  // Auth check
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
    // Reset complet d'un testeur — remet le code à disposition
    if (action === 'reset_full') {
      const { error } = await supabase
        .from('beta_testers')
        .update({
          first_name: null,
          last_name: null,
          email: null,
          age: null,
          city: null,
          sector: null,
          search_count: 0,
          registered_at: null,
          expires_at: null,
          notes: null,
          feedback: null,
          status: 'active',
          is_active: true,
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
    // ── RAZ GÉNÉRALE — vide feedbacks + saved_searches + reset tous les beta_testers sauf KTRIX-ADMIN0 ──
    if (action === 'reset_all_test_data') {
      // 1. Vider la table feedbacks
      const { error: e1 } = await supabase
        .from('feedbacks')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // condition toujours vraie = tout supprimer
      if (e1) throw e1;

      // 2. Vider la table saved_searches
      const { error: e2 } = await supabase
        .from('saved_searches')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (e2) throw e2;

      // 3. Reset tous les beta_testers sauf KTRIX-ADMIN0
      const { error: e3 } = await supabase
        .from('beta_testers')
        .update({
          first_name: null,
          last_name: null,
          email: null,
          age: null,
          city: null,
          sector: null,
          search_count: 0,
          last_search_at: null,
          other_activity: null,
          registered_at: null,
          expires_at: null,
          notes: null,
          feedback: null,
          status: 'active',
          is_active: true,
        })
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
