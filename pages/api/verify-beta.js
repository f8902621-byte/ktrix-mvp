// pages/api/verify-beta.js
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
    // Check code in database
    const { data, error } = await supabase
      .from('beta_testers')
      .select('*')
      .eq('code', trimmed)
      .single();

    if (error || !data) {
      return res.status(200).json({ valid: false, error: 'Code not found' });
    }

    // Check if active
    if (!data.is_active) {
      return res.status(200).json({ valid: false, error: 'Code deactivated' });
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(200).json({ valid: false, error: 'Code expired' });
    }

    // Check if registered (has email)
    if (!data.email || data.email === '' || data.email === 'EMPTY') {
      return res.status(200).json({ valid: false, needsRegistration: true, error: 'Registration required' });
    }

    // Update last access
    await supabase
      .from('beta_testers')
      .update({ last_search_at: new Date().toISOString() })
      .eq('code', trimmed);

    return res.status(200).json({ 
      valid: true, 
      tester: {
        first_name: data.first_name,
        last_name: data.last_name,
        code: data.code
      }
    });

  } catch (err) {
    console.error('Beta verification error:', err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
