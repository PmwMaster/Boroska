import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oagfndzyywbpluiaxqmm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY not set - auth features will be limited');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder');

export function isValidToken(token) {
  return typeof token === 'string' && token.length > 50 && /^[A-Za-z0-9\-_\.]+$/.test(token);
}
