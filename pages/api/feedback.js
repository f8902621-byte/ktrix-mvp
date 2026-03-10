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

  // Récupérer le feedback existant pour l'append (si plusieurs feedbacks)
  const { data: existing } = await supabase
    .from('beta_testers')
    .select('feedback')
    .eq('code', beta_code)
    .single();

  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Asia/Ho_Chi_Minh' });
  const newEntry = `[${timestamp}] ${message.trim()}`;
  const updatedFeedback = existing?.feedback
    ? `${existing.feedback}\n\n${newEntry}`
    : newEntry;

  const { error } = await supabase
    .from('beta_testers')
    .update({ feedback: updatedFeedback })
    .eq('code', beta_code);

  if (error) {
    console.error('Feedback update error:', error);
    return res.status(500).json({ error: 'Failed to save feedback' });
  }

  return res.status(200).json({ success: true });
}
