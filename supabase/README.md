# Supabase foundation

This directory is intentionally safe to commit: it contains no credentials and does not contact a hosted project by itself.

## Apply the schema

1. Create a Supabase project and configure an Auth sign-in method for the sole owner. Do not enable public self-registration for the future admin workflow.
2. Authenticate once as the intended owner, then find that account's UUID in **Authentication → Users**.
3. Link the project locally with the Supabase CLI and apply the migration to a development project first:

   ```powershell
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

4. In the SQL Editor, grant exactly that authenticated account ownership. Substitute the real UUID; do not use an email address or fabricate a UUID:

   ```sql
   insert into public.admin_users (user_id)
   values ('REAL_AUTH_USER_UUID')
   on conflict (user_id) do nothing;
   ```

5. Confirm RLS with the API explorer: anonymous reads return only rows whose status is `published`, while anonymous inserts, updates, and deletes are denied.
6. Deploy the signed-media function after applying the migration:

   ```powershell
   supabase functions deploy media-url
   ```

   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are runtime secrets supplied by Supabase Edge Functions. Never add either to `.env.local` or a Vite variable.

## Media workflow

- Upload drafts only to `portfolio-private`.
- Promote a reviewed asset by copying it to the private `portfolio-published` bucket, then create/update a `media_assets` record with `is_public = true`.
- Both buckets are private. Public clients must request a five-minute signed URL from the deployed `media-url` Edge Function; the function issues one only for media attached to a published project.
- A published resume PDF can be delivered by storing its media ID as `resume.mediaId` in the published `site_settings` row.
- Buckets are restricted to JPEG, PNG, WebP, AVIF, GIF, MP4, and PDF up to 50 MiB.

## Content migration

The local data files remain authoritative until a reviewed import is run. Import rows with stable IDs from `src/data/projects.ts` and deterministic orders, using `insert ... on conflict do nothing` for the first import. Do not use upserts that overwrite remote editorial work. Store flexible case-study blocks in `case_study_blocks.payload`; validate each payload against the frontend discriminated union before insert.

No migration has been run against a hosted Supabase project by this repository.
