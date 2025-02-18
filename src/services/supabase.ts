import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Health check function
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('global_settings').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Reconnect function
export const reconnectSupabase = async () => {
  try {
    await supabase.auth.signOut();
    window.localStorage.clear();
    window.location.reload();
    return true;
  } catch {
    return false;
  }
};
