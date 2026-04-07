import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  const { password, action, code, data: actionData } = req.body || {};

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'POST' && action === 'list') {
      const { data, error } = await supabase
        .from('beta_testers')
        .select('*')
        .order('registered_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ testers: data });
    }

    if (action === 'create_partner') {
      const { group_name, group_url, city, notes } = actionData || {};
      if (!group_name || !group_url) {
        return res.status(400).json({ error: 'group_name and group_url are required' });
      }
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newCode = `KTRIX-FB-${suffix}`;
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      const { data: newPartner, error } = await supabase
        .from('beta_testers')
        .insert({
          code: newCode,
          code_type: 'partner',
          partner_group_name: group_name,
          partner_group_url: group_url,
          city: city || null,
          notes: notes || null,
          is_active: true,
          email: 'PARTNER',
          first_name: group_name,
          registered_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, partner: newPartner, code: newCode });
    }

    if (action === 'list_partners') {
      const { data, error } = await supabase
        .from('beta_testers')
        .select('*')
        .eq('code_type', 'partner')
        .order('registered_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ partners: data || [] });
    }

    // ── Lister les demandes en attente ──
    if (action === 'list_pending_partners') {
      const { data, error } = await supabase
        .from('beta_testers')
        .select('*')
        .eq('code_type', 'partner_pending')
        .order('registered_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ partners: data || [] });
    }

    // ── Refuser une demande ──
    if (action === 'reject_partner') {
      const { error } = await supabase
        .from('beta_testers')
        .delete()
        .eq('code', code)
        .eq('code_type', 'partner_pending');
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
if (action === 'delete_partner') {
  if (action === 'get_partner_banner') {
  const { data, error } = await supabase
    .from('ad_banners')
    .select('*')
    .eq('partner_code', code)
    .single();
  if (error) return res.status(200).json({ banner: null });
  return res.status(200).json({ banner: data });
}

if (action === 'delete_banner') {
  await supabase.from('ad_banners').delete().eq('partner_code', code);
  return res.status(200).json({ success: true });
}

if (action === 'update_fb_posts') {
  const { error } = await supabase
    .from('beta_testers')
    .update({ fb_posts_count: actionData?.fb_posts_count || 0 })
    .eq('code', code);
  if (error) throw error;
  return res.status(200).json({ success: true });
}

if (action === 'convert_permanent') {
  const { error } = await supabase
    .from('beta_testers')
    .update({ expires_at: null })
    .eq('code', code);
  if (error) throw error;
  return res.status(200).json({ success: true });
}
      await supabase.from('beta_testers').delete().eq('code', code);
      await supabase.from('ad_banners').delete().eq('partner_code', code);
      return res.status(200).json({ success: true });
    }
    if (action === 'list_partner_listings') {
      const { partner_code } = actionData || {};
      const query = supabase
        .from('facebook_listings')
        .select('id, title, price, district, area, url, thumbnail, created_at, is_active')
        .order('created_at', { ascending: false });
      if (partner_code) query.eq('beta_code', partner_code);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ listings: data || [] });
    }

    if (action === 'delete_listing') {
      const { listing_id } = actionData || {};
      if (!listing_id) return res.status(400).json({ error: 'listing_id required' });
      const { error } = await supabase
        .from('facebook_listings')
        .update({ is_active: false })
        .eq('id', listing_id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'toggle') {
      const { data: tester } = await supabase
        .from('beta_testers')
        .select('is_active')
        .eq('code', code)
        .single();
      const { error } = await supabase
        .from('beta_testers')
        .update({ is_active: !tester.is_active })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'extend') {
      const days = actionData?.days || 180;
      const { error } = await supabase
        .from('beta_testers')
        .update({
          expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'note') {
      const { error } = await supabase
        .from('beta_testers')
        .update({ notes: actionData?.note || '' })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'reset') {
      const { error } = await supabase
        .from('beta_testers')
        .update({ search_count: 0 })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'reset_full') {
      const { error } = await supabase
        .from('beta_testers')
        .update({
          first_name: null, last_name: null, email: null,
          age: null, city: null, sector: null,
          search_count: 0, registered_at: null, expires_at: null,
          notes: null, feedback: null, status: 'active', is_active: true,
        })
        .eq('code', code);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'list_feedbacks') {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ feedbacks: data || [] });
    }

    if (action === 'reset_all_test_data') {
      const { error: e1 } = await supabase.from('feedbacks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('saved_searches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (e2) throw e2;
      const { error: e3 } = await supabase
        .from('beta_testers')
        .update({
          first_name: null, last_name: null, email: null,
          age: null, city: null, sector: null,
          search_count: 0, last_search_at: null, other_activity: null,
          registered_at: null, expires_at: null,
          notes: null, feedback: null, status: 'active', is_active: true,
        })
        .eq('code_type', 'beta')
        .neq('code', 'KTRIX-ADMIN0');
      if (e3) throw e3;
      return res.status(200).json({ success: true, message: 'RAZ complète effectuée' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Admin error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
