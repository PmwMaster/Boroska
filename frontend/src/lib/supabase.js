import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oagfndzyywbpluiaxqmm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZ2ZuZHp5eXdicGx1aWF4cW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTE2MDEsImV4cCI6MjEwMjI2NzYwMX0.dcBV3V5T97FR4EFZT6_n5pDVq6CLANiVhxDGMxxEZXk';

// Custom fetch that sanitizes headers to prevent ISO-8859-1 errors
function safeFetch(url, options = {}) {
  if (options.headers) {
    const sanitizedHeaders = {};
    for (const [key, value] of Object.entries(options.headers)) {
      if (typeof value === 'string') {
        // Remove any non-ASCII characters from header values
        sanitizedHeaders[key] = value.replace(/[^\x20-\x7E]/g, '');
      } else {
        sanitizedHeaders[key] = value;
      }
    }
    options.headers = sanitizedHeaders;
  }
  return fetch(url, options);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: safeFetch,
  },
});
