import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUserId() {
  try {
    const { data, error } = await supabase.from('User').select('id').limit(1).single();
    if (error) return null;
    return data?.id;
  } catch {
    return null;
  }
}

export default supabase;
