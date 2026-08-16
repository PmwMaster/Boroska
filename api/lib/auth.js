import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Extract and validate user from Authorization header
 * @param {Request} req - The request object
 * @returns {Promise<string|null>} - User ID or null
 */
export async function getAuthenticatedUserId(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Get or create user in our database
    const { data: dbUser } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', user.email)
      .single();

    if (dbUser) {
      return dbUser.id;
    }

    // Create user in our database if doesn't exist
    const { data: newUser } = await supabaseAdmin
      .from('User')
      .insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
      })
      .select('id')
      .single();

    return newUser?.id || null;
  } catch {
    return null;
  }
}

/**
 * Legacy fallback: get first user (for backward compatibility)
 */
export async function getLegacyUserId() {
  try {
    const { data } = await supabaseAdmin.from('User').select('id').limit(1).single();
    return data?.id;
  } catch {
    return null;
  }
}

/**
 * Get user ID: try auth first, fall back to legacy
 */
export async function getUserId(req) {
  const authUserId = await getAuthenticatedUserId(req);
  if (authUserId) return authUserId;
  
  return getLegacyUserId();
}
