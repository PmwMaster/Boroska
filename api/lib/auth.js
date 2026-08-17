import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://oagfndzyywbpluiaxqmm.supabase.co',
  supabaseServiceKey || ''
);

export async function getLegacyUserId() {
  try {
    const { data, error } = await supabaseAdmin
      .from('User')
      .select('id')
      .limit(1)
      .single();
    if (error) {
      console.error('Legacy user lookup failed:', error.message);
      return null;
    }
    return data?.id || null;
  } catch (e) {
    console.error('Legacy user error:', e.message);
    return null;
  }
}

export async function getUserId(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return getLegacyUserId();
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token || token.length < 10) {
    return getLegacyUserId();
  }

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth token invalid:', authError?.message);
      return getLegacyUserId();
    }

    // Try to find existing user
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingUser) {
      return existingUser.id;
    }

    // Create user with upsert
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('User')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      }, { onConflict: 'id', ignoreDuplicates: true })
      .select('id')
      .single();

    if (insertError) {
      console.error('User upsert failed:', insertError.message);
      return getLegacyUserId();
    }

    return newUser?.id || null;
  } catch (e) {
    console.error('Auth error:', e.message);
    return getLegacyUserId();
  }
}
