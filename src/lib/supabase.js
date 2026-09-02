import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://jtccysnofujwgframdzm.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Y2N5c25vZnVqd2dmcmFtZHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjc3MDYsImV4cCI6MjEwMjgwMzcwNn0.MYHmNLIrwUZ3Kq5-w0phuprtBx2U1O6BsFEyQj71XGA';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

let supabaseInstance;
try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.warn('[AI Studio] Supabase client initialization warning:', error);
  // Fallback mock if initialization fails completely
  supabaseInstance = {
    from: () => ({
      select: () => ({ order: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
}

export const supabase = supabaseInstance;
