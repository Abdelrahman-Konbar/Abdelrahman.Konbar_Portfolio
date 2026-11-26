import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const environment = import.meta.env as ImportMetaEnv | undefined;
const url = environment?.VITE_SUPABASE_URL;
const publishableKey = environment?.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Returns null when remote content has not been configured, preserving local fallback. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!url || !publishableKey) return null;
  return createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

export const supabase = getSupabaseClient();
