// Supabase client - not used in local Docker mode
// Kept for compatibility with existing imports
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Auth not available in local mode') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Auth not available in local mode') }),
    signOut: () => Promise.resolve({ error: null }),
  },
};
