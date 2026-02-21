// pages/api/admin-data.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'EraKor@153';

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

    // Extend expiration (6 months for top testers)
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
    return res.status(400).json({ error: 'Invalid action' });

  } catch (err) {
    console.error('Admin error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
