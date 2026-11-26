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

  const { data: media, error: mediaError } = await admin
    .from("media_assets")
    .select("id, bucket, storage_path, is_public")
    .eq("id", mediaId)
    .eq("bucket", "portfolio-private")
    .eq("is_public", false)
    .maybeSingle();
  if (mediaError) {
  console.error("promote-media lookup failed", mediaError);
  return Response.json(
    { error: "Media lookup failed", detail: mediaError.message },
    { status: 500, headers: corsHeaders },
  );
}
if (!media) {
  return new Response("Draft media not found", { status: 404, headers: corsHeaders });
}

  const destination = `published/${media.id}/${media.storage_path.split("/").pop()}`;
  // Cross-bucket move requires an options object. Moving avoids leaving an
  // untracked draft copy after a successful publication.
  const { error: moveError } = await admin.storage
    .from("portfolio-private")
    .move(media.storage_path, destination, { destinationBucket: "portfolio-published" });
  if (moveError) {
    console.error("promote-media move failed", moveError.message);
    return Response.json({ error: "Unable to promote media", detail: moveError.message }, { status: 500, headers: corsHeaders });
  }

  const { error: updateError } = await admin.from("media_assets").update({ bucket: "portfolio-published", storage_path: destination, is_public: true }).eq("id", media.id);
  if (updateError) {
    console.error("promote-media metadata update failed", updateError.message);
    return Response.json({ error: "Media copied but metadata update failed", detail: updateError.message }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ id: media.id, bucket: "portfolio-published", storagePath: destination }, { headers: corsHeaders });
});
