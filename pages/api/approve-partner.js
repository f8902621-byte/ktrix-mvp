import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const EMAIL_CONTENT = {
  vn: {
    subject: (groupName) => `✅ Mã đối tác K Trix của bạn — ${groupName}`,
    welcome: 'Chào mừng bạn đến với chương trình đối tác K Trix! 🎉',
    approved: (groupName) => `Yêu cầu của bạn cho <strong>${groupName}</strong> đã được chấp thuận.`,
    code_label: 'MÃ ĐỐI TÁC CỦA BẠN',
    validity: 'Hiệu lực 1 năm · Truy cập thường xuyên vào chương trình',
    how_to: 'Cách sử dụng mã của bạn:',
    steps: (code) => [
      `Truy cập <a href="https://www.ktrix.ai/partner" style="color: #38bdf8;">ktrix.ai/partner</a>`,
      `Nhấp vào "Bắt đầu ngay"`,
      `Nhập mã của bạn: <strong style="font-family: monospace;">${code}</strong>`,
      `Nhập tin đăng của bạn và xem chúng xuất hiện trên K Trix!`,
    ],
    banner_title: '🎁 Bannière quảng cáo miễn phí',
    banner_desc: (uploadUrl) => `Với tư cách là đối tác mới, nhóm của bạn được hưởng một vị trí quảng cáo miễn phí trên K Trix trong 6 tháng. Hãy gửi cho chúng tôi bannière của bạn theo định dạng:<br/>
      <strong>• Desktop: 728×90 px</strong><br/>
      <strong>• Mobile: 320×100 px</strong><br/>
      Hoặc tải lên trực tiếp tại: <a href="${uploadUrl}" style="color: #38bdf8;">${uploadUrl}</a>`,
    contact: 'tại <a href="mailto:contact@ktrix.ai" style="color: #38bdf8;">contact@ktrix.ai</a>',
  },
  en: {
    subject: (groupName) => `✅ Your K Trix partner code — ${groupName}`,
    welcome: 'Welcome to the K Trix partner program! 🎉',
    approved: (groupName) => `Your application for <strong>${groupName}</strong> has been approved.`,
    code_label: 'YOUR PARTNER CODE',
    validity: 'Valid 1 year · Permanent program access',
    how_to: 'How to use your code:',
    steps: (code) => [
      `Go to <a href="https://www.ktrix.ai/partner" style="color: #38bdf8;">ktrix.ai/partner</a>`,
      `Click "Get started"`,
      `Enter your code: <strong style="font-family: monospace;">${code}</strong>`,
      `Import your listings and watch them appear on K Trix!`,
    ],
    banner_title: '🎁 Free promotional banner',
    banner_desc: (uploadUrl) => `As a new partner, your group benefits from a free advertising spot on K Trix for 6 months. Send us your banners at:<br/>
      <strong>• Desktop: 728×90 px</strong><br/>
      <strong>• Mobile: 320×100 px</strong><br/>
      Or upload directly at: <a href="${uploadUrl}" style="color: #38bdf8;">${uploadUrl}</a>`,
    contact: 'at <a href="mailto:contact@ktrix.ai" style="color: #38bdf8;">contact@ktrix.ai</a>',
  },
  fr: {
    subject: (groupName) => `✅ Votre code partenaire K Trix — ${groupName}`,
    welcome: 'Bienvenue dans le programme partenaire K Trix ! 🎉',
    approved: (groupName) => `Votre demande pour <strong>${groupName}</strong> a été approuvée.`,
    code_label: 'VOTRE CODE PARTENAIRE',
    validity: 'Valide 1 an · Accès permanent au programme',
    how_to: 'Comment utiliser votre code :',
    steps: (code) => [
      `Allez sur <a href="https://www.ktrix.ai/partner" style="color: #38bdf8;">ktrix.ai/partner</a>`,
      `Cliquez sur "Commencer"`,
      `Entrez votre code : <strong style="font-family: monospace;">${code}</strong>`,
      `Importez vos annonces et regardez-les apparaître sur K Trix !`,
    ],
    banner_title: '🎁 Bannière promotionnelle offerte',
    banner_desc: (uploadUrl) => `En tant que nouveau partenaire, votre groupe bénéficie d'un emplacement publicitaire gratuit sur K Trix pendant 6 mois. Envoyez-nous vos bannières aux formats :<br/>
      <strong>• Desktop : 728×90 px</strong><br/>
      <strong>• Mobile : 320×100 px</strong><br/>
      Ou uploadez directement ici : <a href="${uploadUrl}" style="color: #38bdf8;">${uploadUrl}</a>`,
    contact: 'à <a href="mailto:contact@ktrix.ai" style="color: #38bdf8;">contact@ktrix.ai</a>',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, pending_code } = req.body || {};

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: pending, error: fetchError } = await supabase
      .from('beta_testers')
      .select('*')
      .eq('code', pending_code)
      .eq('code_type', 'partner_pending')
      .single();

    if (fetchError || !pending) {
      return res.status(404).json({ error: 'Pending application not found' });
    }

    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const partnerCode = `KTRIX-FB-${suffix}`;

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { error: updateError } = await supabase
      .from('beta_testers')
      .update({
        code: partnerCode,
        code_type: 'partner',
        is_active: true,
        expires_at: expiresAt.toISOString(),
        email: pending.email,
      })
      .eq('code', pending_code);

    if (updateError) throw updateError;

    // Déterminer la langue — vn, en, ou fr (défaut: en)
    const lang = ['vn', 'en', 'fr'].includes(pending.language) ? pending.language : 'en';
    const t = EMAIL_CONTENT[lang];
    const uploadUrl = 'https://www.ktrix.ai/banner-upload';
    const stepsHtml = t.steps(partnerCode).map((s, i) => `<li style="margin-bottom: 8px;">${i + 1}. ${s}</li>`).join('');

    await resend.emails.send({
      from: 'K Trix <noreply@ktrix.ai>',
      to: pending.email,
      subject: t.subject(pending.partner_group_name),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #f1f5f9; padding: 40px 32px; border-radius: 16px;">
          <img src="https://www.ktrix.ai/Ktrixlogo.png" alt="K Trix" style="height: 48px; margin-bottom: 24px;" />

          <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px;">
            ${t.welcome}
          </h1>
          <p style="color: #94a3b8; margin: 0 0 32px; font-size: 16px;">
            ${t.approved(pending.partner_group_name)}
          </p>

          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">${t.code_label}</p>
            <p style="font-family: monospace; font-size: 28px; font-weight: 700; color: #38bdf8; letter-spacing: 3px; margin: 0 0 8px;">${partnerCode}</p>
            <p style="color: #475569; font-size: 12px; margin: 0;">${t.validity}</p>
          </div>

          <h2 style="font-size: 16px; font-weight: 600; color: #e2e8f0; margin: 0 0 12px;">${t.how_to}</h2>
          <ol style="color: #94a3b8; padding-left: 0; margin: 0 0 32px; list-style: none; line-height: 1.8;">
            ${stepsHtml}
          </ol>

          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <p style="color: #10b981; font-weight: 600; margin: 0 0 8px;">${t.banner_title}</p>
            <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.7;">
              ${t.banner_desc(uploadUrl)}
            </p>
          </div>

          <p style="color: #475569; font-size: 13px; text-align: center; margin: 0;">
            © 2026 K Trix · Ho Chi Minh City, Vietnam<br/>
            <a href="https://www.ktrix.ai" style="color: #38bdf8;">ktrix.ai</a> ·
            <a href="mailto:contact@ktrix.ai" style="color: #38bdf8;">contact@ktrix.ai</a>
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, code: partnerCode });
  } catch (err) {
    console.error('Approve partner error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
