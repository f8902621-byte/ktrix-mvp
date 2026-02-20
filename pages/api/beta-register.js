// pages/api/beta-register.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { last_name, first_name, email, age, sector, device } = req.body;

  // Validation
  if (!last_name || !email || !sector) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if email already registered
    const { data: existing } = await supabase
      .from('beta_testers')
      .select('code')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(200).json({ 
        success: true, 
        code: existing.code,
        message: 'already_registered'
      });
    }

    // Find first available code (unregistered)
    const { data: available, error: findError } = await supabase
      .from('beta_testers')
      .select('id, code')
      .or('email.eq.,email.eq.EMPTY')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (findError || !available) {
      return res.status(200).json({ 
        success: false, 
        error: 'No codes available. Beta is full.' 
      });
    }

    // Assign code to tester
    const { error: updateError } = await supabase
      .from('beta_testers')
      .update({
        last_name: last_name.trim(),
        first_name: first_name ? first_name.trim() : null,
        email: email.trim().toLowerCase(),
        age: age || null,
        sector: sector,
        device: device || 'desktop',
        registered_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', available.id);

    if (updateError) {
      console.error('Registration error:', updateError);
      return res.status(500).json({ success: false, error: 'Registration failed' });
    }

    return res.status(200).json({ 
      success: true, 
      code: available.code,
      message: 'registered'
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
