import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data, error } = await supabase
      .from('ad_banners')
      .select('id, group_name, group_url, image_url_desktop, image_url_mobile')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ banners: data || [] });
  } catch (err) {
    console.error('Banners error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
