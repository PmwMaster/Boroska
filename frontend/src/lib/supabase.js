import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oagfndzyywbpluiaxqmm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZ2ZuZHp5eXdicGx1aWF4cW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTE2MDEsImV4cCI6MjEwMjI2NzYwMX0.dcBV3V5T97FR4EFZT6_n5pDVq6CLANiVhxDGMxxEZXk';

// Encode string to only contain ISO-8859-1 safe characters
function toISO8859(str) {
  if (typeof str !== 'string') return str;
  const chars = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 255) {
      chars.push(str[i]);
    }
  }
  return chars.join('');
}

// Wrap fetch to sanitize all header values
const originalFetch = globalThis.fetch;
globalThis.fetch = function(url, init) {
  if (init && init.headers) {
    const sanitized = {};
    const headers = init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : Array.isArray(init.headers)
        ? Object.fromEntries(init.headers)
        : { ...init.headers };
    
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        sanitized[key] = toISO8859(value);
      } else {
        sanitized[key] = value;
      }
    }
    init = { ...init, headers: sanitized };
  }
  return originalFetch.call(this, url, init);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
