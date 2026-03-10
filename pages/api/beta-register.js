// pages/api/beta-register.js
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Templates email trilingues
const getEmailContent = (lang, first_name, code, expiresAt) => {
  const expiryDate = new Date(expiresAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const templates = {
    vn: {
      subject: '🎉 Mã truy cập K Trix Beta của bạn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #f0f8ff; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #00d4ff; font-size: 28px; margin: 0;">K Trix</h1>
            <p style="color: rgba(240,248,255,0.5); margin: 4px 0 0;">Phân tích bất động sản thông minh</p>
          </div>
          <p style="font-size: 16px;">Xin chào <strong>${first_name}</strong>,</p>
          <p style="color: rgba(240,248,255,0.8);">Chúc mừng! Bạn đã được chấp nhận vào chương trình Beta K Trix. Đây là mã truy cập của bạn:</p>
          <div style="background: rgba(0,212,255,0.1); border: 2px solid #00d4ff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: rgba(240,248,255,0.6); margin: 0 0 8px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Mã truy cập của bạn</p>
            <p style="color: #00d4ff; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: 4px; font-family: monospace;">${code}</p>
          </div>
          <p style="color: rgba(240,248,255,0.6); font-size: 13px;">⏳ Mã có hiệu lực đến: <strong style="color: #ff8c00;">${expiryDate}</strong></p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="https://ktrix-mvp.vercel.app/search" style="background: #00d4ff; color: #0a0e1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              🚀 Bắt đầu ngay
            </a>
          </div>
          <p style="color: rgba(240,248,255,0.4); font-size: 12px; text-align: center;">K Trix Beta · Liên hệ: feedback@ktrix.ai</p>
        </div>
      `
    },
    fr: {
      subject: '🎉 Votre code d\'accès K Trix Beta',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #f0f8ff; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #00d4ff; font-size: 28px; margin: 0;">K Trix</h1>
            <p style="color: rgba(240,248,255,0.5); margin: 4px 0 0;">Analyse immobilière intelligente</p>
          </div>
          <p style="font-size: 16px;">Bonjour <strong>${first_name}</strong>,</p>
          <p style="color: rgba(240,248,255,0.8);">Félicitations ! Vous avez été accepté(e) dans le programme Beta K Trix. Voici votre code d'accès :</p>
          <div style="background: rgba(0,212,255,0.1); border: 2px solid #00d4ff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: rgba(240,248,255,0.6); margin: 0 0 8px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Votre code d'accès</p>
            <p style="color: #00d4ff; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: 4px; font-family: monospace;">${code}</p>
          </div>
          <p style="color: rgba(240,248,255,0.6); font-size: 13px;">⏳ Code valable jusqu'au : <strong style="color: #ff8c00;">${expiryDate}</strong></p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="https://ktrix-mvp.vercel.app/search" style="background: #00d4ff; color: #0a0e1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              🚀 Commencer maintenant
            </a>
          </div>
          <p style="color: rgba(240,248,255,0.4); font-size: 12px; text-align: center;">K Trix Beta · Contact : feedback@ktrix.ai</p>
        </div>
      `
    },
    en: {
      subject: '🎉 Your K Trix Beta Access Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #f0f8ff; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #00d4ff; font-size: 28px; margin: 0;">K Trix</h1>
            <p style="color: rgba(240,248,255,0.5); margin: 4px 0 0;">Smart Real Estate Analysis</p>
          </div>
          <p style="font-size: 16px;">Hello <strong>${first_name}</strong>,</p>
          <p style="color: rgba(240,248,255,0.8);">Congratulations! You've been accepted into the K Trix Beta program. Here is your access code:</p>
          <div style="background: rgba(0,212,255,0.1); border: 2px solid #00d4ff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: rgba(240,248,255,0.6); margin: 0 0 8px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Your access code</p>
            <p style="color: #00d4ff; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: 4px; font-family: monospace;">${code}</p>
          </div>
          <p style="color: rgba(240,248,255,0.6); font-size: 13px;">⏳ Code valid until: <strong style="color: #ff8c00;">${expiryDate}</strong></p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="https://www.ktrix.ai/search?code=${code}" style="background: #00d4ff; color: #0a0e1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              🚀 Start now
            </a>
          </div>
          <p style="color: rgba(240,248,255,0.4); font-size: 12px; text-align: center;">K Trix Beta · Contact: feedback@ktrix.ai</p>
        </div>
      `
    }
  };

  return templates[lang] || templates['en'];
};

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
    // Check if email already registered
    if (email) {
      const { data: existing } = await supabase
        .from('beta_testers')
        .select('code')
        .eq('email', email.trim().toLowerCase())
        .not('email', 'is', null)
        .single();

      if (existing) {
        // Renvoyer l'email si déjà inscrit
        if (email) {
          const emailContent = getEmailContent(lang || 'en', first_name, existing.code, new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString());
          await resend.emails.send({
            from: 'K Trix <contact@ktrix.ai>',
            to: email.trim().toLowerCase(),
            subject: emailContent.subject,
            html: emailContent.html,
          }).catch(err => console.error('Resend error (already registered):', err));
        }
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

    // Assign code to tester
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

    // ✅ ENVOI EMAIL AUTOMATIQUE
    if (email) {
      const emailContent = getEmailContent(lang || 'en', first_name, available.code, expiresAt);
      await resend.emails.send({
        from: 'K Trix <contact@ktrix.ai>',
        to: email.trim().toLowerCase(),
        subject: emailContent.subject,
        html: emailContent.html,
      }).catch(err => console.error('Resend error:', err));
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
