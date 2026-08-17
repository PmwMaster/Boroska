import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oagfndzyywbpluiaxqmm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZ2ZuZHp5eXdicGx1aWF4cW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTE2MDEsImV4cCI6MjEwMjI2NzYwMX0.dcBV3V5T97FR4EFZT6_n5pDVq6CLANiVhxDGMxxEZXk';

function sanitizeHeaderValue(val) {
  if (typeof val !== 'string') return val;
  let out = '';
  for (let i = 0; i < val.length; i++) {
    const code = val.charCodeAt(i);
    if (code >= 0x20 && code <= 0x7E) out += val[i];
  }
  return out;
}

function safeFetch(url, opts = {}) {
  const h = {};
  if (opts.headers) {
    if (opts.headers instanceof Headers) {
      opts.headers.forEach((v, k) => { h[k] = sanitizeHeaderValue(v); });
    } else if (Array.isArray(opts.headers)) {
      opts.headers.forEach(([k, v]) => { h[k] = sanitizeHeaderValue(v); });
    } else {
      for (const k of Object.keys(opts.headers)) {
        h[k] = sanitizeHeaderValue(opts.headers[k]);
      }
    }
  }
  return fetch(url, { ...opts, headers: h });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: { fetch: safeFetch },
});
