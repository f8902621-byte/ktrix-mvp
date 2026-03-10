import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code, message, reply_email } = req.body || {};
  if (!code || !message) return res.status(400).json({ error: 'Missing fields' });

  const { error } = await supabase
    .from('feedbacks')
    .insert({ beta_code: code, message, reply_email: reply_email || null });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
