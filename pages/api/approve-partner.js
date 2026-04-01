import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, pending_code } = req.body || {};

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Récupérer la demande en attente
    const { data: pending, error: fetchError } = await supabase
      .from('beta_testers')
      .select('*')
      .eq('code', pending_code)
      .eq('code_type', 'partner_pending')
      .single();

    if (fetchError || !pending) {
      return res.status(404).json({ error: 'Pending application not found' });
    }

    // Générer le vrai code partenaire
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const partnerCode = `KTRIX-FB-${suffix}`;

    // Calculer expiration 1 an
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Mettre à jour l'entrée : partner_pending → partner
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

    // Envoyer l'email avec Resend
    const memberCount = pending.notes?.replace('Membres: ', '') || '';

    await resend.emails.send({
      from: 'K Trix <noreply@ktrix.ai>',
      to: pending.email,
      subject: `✅ Votre code partenaire K Trix — ${pending.partner_group_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #f1f5f9; padding: 40px 32px; border-radius: 16px;">
          <img src="https://www.ktrix.ai/Ktrixlogo.png" alt="K Trix" style="height: 48px; margin-bottom: 24px;" />
          
          <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 8px;">
            Bienvenue dans le programme partenaire K Trix ! 🎉
          </h1>
          <p style="color: #94a3b8; margin: 0 0 32px; font-size: 16px;">
            Votre demande pour <strong style="color: #e2e8f0;">${pending.partner_group_name}</strong> a été approuvée.
          </p>

          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Votre code partenaire</p>
            <p style="font-family: monospace; font-size: 28px; font-weight: 700; color: #38bdf8; letter-spacing: 3px; margin: 0 0 8px;">${partnerCode}</p>
            <p style="color: #475569; font-size: 12px; margin: 0;">Valide 1 an · Accès permanent au programme</p>
          </div>

          <h2 style="font-size: 16px; font-weight: 600; color: #e2e8f0; margin: 0 0 12px;">Comment utiliser votre code :</h2>
          <ol style="color: #94a3b8; padding-left: 20px; margin: 0 0 32px; line-height: 1.8;">
            <li>Allez sur <a href="https://www.ktrix.ai/partner" style="color: #38bdf8;">ktrix.ai/partner</a></li>
            <li>Cliquez sur "Get started"</li>
            <li>Entrez votre code : <strong style="color: #e2e8f0; font-family: monospace;">${partnerCode}</strong></li>
            <li>Importez vos annonces et regardez-les apparaître sur K Trix !</li>
          </ol>

          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <p style="color: #10b981; font-weight: 600; margin: 0 0 8px;">🎁 Bannière promotionnelle offerte</p>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              En tant que nouveau partenaire, votre groupe bénéficie d'un emplacement publicitaire gratuit sur K Trix pendant 6 mois.
              Envoyez-nous vos bannières aux formats :<br/>
              <strong style="color: #e2e8f0;">• Desktop : 728×90 px</strong><br/>
              <strong style="color: #e2e8f0;">• Mobile : 320×100 px</strong><br/>
              à <a href="mailto:contact@ktrix.ai" style="color: #38bdf8;">contact@ktrix.ai</a>
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
