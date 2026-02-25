// ============================================
// KTRIX - API SAVED SEARCHES (per beta tester)
// Endpoint: /api/saved-searches
// GET: list saved searches for a beta code
// POST: save a new search
// DELETE: remove a saved search
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // === GET: List saved searches for a beta code ===
  if (req.method === 'GET') {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No beta code provided' });
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('beta_code', code.toUpperCase().trim())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SAVED-SEARCHES] GET error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ searches: data || [] });
    } catch (err) {
      console.error('[SAVED-SEARCHES] GET exception:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // === POST: Save a new search ===
  if (req.method === 'POST') {
    const { code, name, params } = req.body || {};

    if (!code || !name || !params) {
      return res.status(400).json({ error: 'Missing code, name, or params' });
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          beta_code: code.toUpperCase().trim(),
          name: name,
          params: params
        })
        .select()
        .single();

      if (error) {
        console.error('[SAVED-SEARCHES] POST error:', error);
        return res.status(500).json({ error: error.message });
      }

      console.log(`[SAVED-SEARCHES] Saved "${name}" for ${code}`);
      return res.status(200).json({ success: true, search: data });
    } catch (err) {
      console.error('[SAVED-SEARCHES] POST exception:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // === DELETE: Remove a saved search ===
  if (req.method === 'DELETE') {
    const { id, code } = req.body || {};

    if (!id || !code) {
      return res.status(400).json({ error: 'Missing id or code' });
    }

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id)
        .eq('beta_code', code.toUpperCase().trim());

      if (error) {
        console.error('[SAVED-SEARCHES] DELETE error:', error);
        return res.status(500).json({ error: error.message });
      }

      console.log(`[SAVED-SEARCHES] Deleted search ${id} for ${code}`);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[SAVED-SEARCHES] DELETE exception:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
