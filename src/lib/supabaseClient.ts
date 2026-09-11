import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access Supabase public environment variables
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
const rawUrl = (env.VITE_SUPABASE_URL || '').trim();

// Strip trailing /rest/v1/ or trailing slashes if user provided REST endpoint URL instead of base URL
export const supabaseUrl = rawUrl
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');

export const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 10
);

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
};
