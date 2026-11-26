import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const authorization = request.headers.get("Authorization");
  if (!authorization) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  const { mediaId } = await request.json().catch(() => ({}));
  if (typeof mediaId !== "string" || !mediaId.trim()) return new Response("mediaId is required", { status: 400, headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const sessionClient = createClient(url, publishableKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData } = await sessionClient.auth.getUser();
  if (!userData.user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: isOwner } = await admin.rpc("assert_portfolio_owner", { requested_user_id: userData.user.id });
  if (!isOwner) return new Response("Forbidden", { status: 403, headers: corsHeaders });

  const { data: media, error: mediaError } = await admin.from("media_assets").select("id,bucket,storage_path").eq("id", mediaId).maybeSingle();
  if (mediaError || !media) return new Response("Media not found", { status: 404, headers: corsHeaders });
  const { data: usages, error: usageError } = await admin.rpc("find_media_asset_usage", { requested_media_id: mediaId });
  if (usageError) return new Response("Unable to check media usage", { status: 500, headers: corsHeaders });
  if (usages?.length) return Response.json({ error: "Media is in use", usages }, { status: 409, headers: corsHeaders });

  const { error: storageError } = await admin.storage.from(media.bucket).remove([media.storage_path]);
  if (storageError) return new Response("Unable to delete storage object", { status: 500, headers: corsHeaders });
  const { error: deleteError } = await admin.from("media_assets").delete().eq("id", mediaId);
  if (deleteError) return new Response("Storage object deleted but media metadata could not be removed", { status: 500, headers: corsHeaders });
  return Response.json({ id: mediaId, deleted: true }, { headers: corsHeaders });
});
