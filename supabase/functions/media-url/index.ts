import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const { mediaId } = await request.json().catch(() => ({}));
  if (typeof mediaId !== "string" || !mediaId.trim()) {
    return new Response("mediaId is required", { status: 400, headers: corsHeaders });
  }

  // This key is available only in the Edge Function runtime, never in Vite.
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: asset, error: lookupError } = await admin.rpc("resolve_published_media_asset", {
    requested_media_id: mediaId,
  }).maybeSingle();
  if (lookupError || !asset) return new Response("Not found", { status: 404, headers: corsHeaders });

  const { data: signed, error: signedError } = await admin.storage
    .from(asset.bucket)
    .createSignedUrl(asset.storage_path, 300);
  if (signedError || !signed) return new Response("Unable to create media URL", { status: 500, headers: corsHeaders });

  return Response.json({ url: signed.signedUrl, expiresIn: 300 }, { headers: corsHeaders });
});
