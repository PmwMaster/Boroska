import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://oagfndzyywbpluiaxqmm.supabase.co',
  supabaseServiceKey || ''
);

export async function getUserId(req) {
  // 1. Try to get user from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) {
        // Upsert user in our database
        const { data: dbUser } = await supabaseAdmin
          .from('User')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          }, { onConflict: 'id' })
          .select('id')
          .single();
        if (dbUser) return dbUser.id;
      }
    } catch (e) {
      console.error('Auth token error:', e.message);
    }
  }

  // 2. Fallback: get first user in database
  try {
    const { data } = await supabaseAdmin.from('User').select('id').limit(1).single();
    return data?.id || null;
  } catch {
    return null;
  }
}
