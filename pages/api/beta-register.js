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

  const {
    first_name, last_name, email, age, city,
    sector, agency_type, experience,
    proof_website, proof_linkedin, proof_facebook, proof_instagram, proof_other,
    links, other_activity, cgu_accepted, lang,
  } = req.body;

  // Validation
  if (!first_name || !age || !city || !sector) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!cgu_accepted) {
    return res.status(400).json({ error: 'CGU must be accepted' });
  }

  try {
    // Check if email already registered (only if email provided)
    if (email) {
      const { data: existing } = await supabase
        .from('beta_testers')
        .select('code')
        .eq('email', email.trim().toLowerCase())
        .not('email', 'is', null)
        .single();

      if (existing) {
        return res.status(200).json({
          success: true,
          code: existing.code,
          message: 'already_registered',
        });
      }
    }

    // Find first available code slot
    const { data: available, error: findError } = await supabase
      .from('beta_testers')
      .select('id, code')
      .or('email.is.null,email.eq.')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (findError || !available) {
      return res.status(200).json({
        success: false,
        error: 'No codes available. Beta is full.',
      });
    }

    // Calculate expiry: 15 days from now
    const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

    // Assign code to tester with all fields
    const { error: updateError } = await supabase
      .from('beta_testers')
      .update({
        first_name: first_name.trim(),
        last_name: last_name ? last_name.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        age: age || null,
        city: city.trim(),
        sector: sector,
        agency_type: agency_type || null,
        experience: experience || null,
        proof_website: proof_website || false,
        proof_linkedin: proof_linkedin || false,
        proof_facebook: proof_facebook || false,
        proof_instagram: proof_instagram || false,
        proof_other: proof_other || false,
        links: links ? links.trim() : null,
        other_activity: other_activity ? other_activity.trim() : null,
        cgu_accepted: cgu_accepted,
        lang: lang || 'en',
        registered_at: new Date().toISOString(),
        expires_at: expiresAt,
        device: req.headers['user-agent'] || 'unknown',
      })
      .eq('id', available.id);

    if (updateError) {
      console.error('Registration error:', updateError);
      return res.status(500).json({ success: false, error: 'Registration failed' });
    }

    return res.status(200).json({
      success: true,
      code: available.code,
      message: 'registered',
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
