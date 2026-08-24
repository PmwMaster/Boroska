import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://oagfndzyywbpluiaxqmm.supabase.co',
  supabaseServiceKey || ''
);

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = decodeJwtPayload(token);
      if (payload && payload.sub) {
        const userId = payload.sub;
        const email = payload.email || '';
        const name = payload.user_metadata?.name || email.split('@')[0] || 'User';
        
        await supabaseAdmin
          .from('User')
          .upsert({
            id: userId,
            email: email,
            name: name,
          }, { onConflict: 'id' });
        
        return userId;
      }
    } catch (e) {
      console.error('Auth token error:', e.message);
    }
  }

  try {
    const { data } = await supabaseAdmin.from('User').select('id').limit(1).single();
    return data?.id || null;
  } catch {
    return null;
  }
}
