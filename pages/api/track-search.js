import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { code } = req.body;
  if (!code) return res.status(400).end();

  await supabase.rpc('increment_search_count', { tester_code: code }).catch(() => {
    // Fallback: manual increment
    supabase
      .from('beta_testers')
      .select('search_count')
      .eq('code', code)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('beta_testers')
            .update({ 
              search_count: (data.search_count || 0) + 1,
              last_search_at: new Date().toISOString()
            })
            .eq('code', code);
        }
      });
  });

  res.status(200).json({ ok: true });
}
