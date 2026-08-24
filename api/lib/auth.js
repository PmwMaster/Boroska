import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[AUTH] SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('[AUTH] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET (length: ' + supabaseServiceKey.length + ')' : 'MISSING');

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://oagfndzyywbpluiaxqmm.supabase.co',
  supabaseServiceKey || ''
);

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[AUTH] Invalid token parts:', parts.length);
      return null;
    }
    const payload = parts[1];
    let padded = payload;
    const padding = 4 - (padded.length % 4);
    if (padding !== 4) padded += '='.repeat(padding);
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    console.log('[AUTH] JWT decoded, sub:', parsed.sub, 'email:', parsed.email);
    return parsed;
  } catch (e) {
    console.error('[AUTH] JWT decode error:', e.message);
    return null;
  }
}

export async function getUserId(req) {
  console.log('[AUTH] getUserId called');
  
  const authHeader = req.headers.authorization;
  console.log('[AUTH] Authorization header:', authHeader ? 'present (length: ' + authHeader.length + ')' : 'missing');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    console.log('[AUTH] Token length:', token.length);
    
    try {
      const payload = decodeJwtPayload(token);
      if (payload && payload.sub) {
        const userId = payload.sub;
        const email = payload.email || '';
        const name = payload.user_metadata?.name || email.split('@')[0] || 'User';
        
        console.log('[AUTH] Upserting user:', userId, email);
        
        const { data, error } = await supabaseAdmin
          .from('User')
          .upsert({
            id: userId,
            email: email,
            name: name,
          }, { onConflict: 'id' })
          .select('id');
        
        if (error) {
          console.error('[AUTH] Upsert error:', error.message);
        } else {
          console.log('[AUTH] Upsert success:', data);
        }
        
        return userId;
      }
    } catch (e) {
      console.error('[AUTH] Auth token error:', e.message);
    }
  }

  console.log('[AUTH] Trying fallback: get first user');
  try {
    const { data, error } = await supabaseAdmin.from('User').select('id').limit(1).single();
    if (error) {
      console.error('[AUTH] Fallback error:', error.message);
    } else {
      console.log('[AUTH] Fallback success:', data);
    }
    return data?.id || null;
  } catch (e) {
    console.error('[AUTH] Fallback exception:', e.message);
    return null;
  }
}
