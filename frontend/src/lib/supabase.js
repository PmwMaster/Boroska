import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oagfndzyywbpluiaxqmm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZ2ZuZHp5eXdicGx1aWF4cW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTE2MDEsImV4cCI6MjEwMjI2NzYwMX0.dcBV3V5T97FR4EFZT6_n5pDVq6CLANiVhxDGMxxEZXk';

// Custom fetch that sanitizes headers to prevent ISO-8859-1 errors
function safeFetch(url, options = {}) {
  const sanitized = { ...options };
  if (sanitized.headers) {
    const clean = {};
    for (const [key, value] of Object.entries(sanitized.headers)) {
      if (typeof value === 'string') {
        clean[key] = value.replace(/[^\x20-\x7E]/g, '');
      } else {
        clean[key] = value;
      }
    }
    sanitized.headers = clean;
  }
  return fetch(url, sanitized);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: safeFetch,
  },
});
