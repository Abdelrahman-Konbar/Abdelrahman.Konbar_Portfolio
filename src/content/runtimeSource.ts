import { supabaseContentRepository } from "./supabaseRepository";

export type ContentSource = "local" | "supabase";

/**
 * Public rendering remains local until a reviewed migration is published. This
 * guard prevents a configured-but-empty Supabase project from blanking the site.
 */
export const configuredContentSource: ContentSource =
  import.meta.env.VITE_CONTENT_SOURCE === "supabase" && supabaseContentRepository
    ? "supabase"
    : "local";
