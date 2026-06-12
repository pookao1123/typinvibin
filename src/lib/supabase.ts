import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Null when Supabase env vars are missing — callers fall back to static data. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
