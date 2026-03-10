import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { beta_code, message, reply_email } = req.body;

    if (!beta_code || !message) {
      return res.status(400).json({ error: 'Champs manquants' });
    }

    const { error } = await supabase
      .from('feedbacks')
      .insert([{ beta_code, message, reply_email }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Méthode non autorisée' });
}
