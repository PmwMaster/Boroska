import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oagfndzyywbpluiaxqmm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZ2ZuZHp5eXdicGx1aWF4cW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTE2MDEsImV4cCI6MjEwMjI2NzYwMX0.dcBV3V5T97FR4EFZT6_n5pDVq6CLANiVhxDGMxxEZXk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
