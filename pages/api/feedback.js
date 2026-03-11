import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { beta_code, message } = req.body;

  if (!beta_code || !message?.trim()) {
    return res.status(400).json({ error: 'Missing fields' });
  }

const { error } = await supabase
  .from('feedbacks')
  .insert({ beta_code, message: message.trim(), reply_email: reply_email || null });

if (error) {
  console.error('Feedback insert error:', error);
  return res.status(500).json({ error: 'Failed to save feedback' });
}

return res.status(200).json({ success: true });
}
