import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://oagfndzyywbpluiaxqmm.supabase.co',
  supabaseServiceKey || ''
);

export async function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  const userId = data.user.id;
  const email = data.user.email || '';
  const name = data.user.user_metadata?.name || email.split('@')[0] || 'User';

  await supabaseAdmin
    .from('User')
    .upsert({ id: userId, email, name }, { onConflict: 'id' });

  return userId;
}
