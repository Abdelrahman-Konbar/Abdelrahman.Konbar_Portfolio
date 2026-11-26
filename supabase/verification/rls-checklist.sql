-- Manual verification checklist. Run against a development project only.
-- Use the Supabase API explorer with the anon key for public checks and an
-- authenticated non-owner account for authenticated checks. Do not run as the
-- postgres/service-role user: those credentials bypass the policies being tested.

-- Expected with anon credentials:
-- 1. GET /rest/v1/projects?select=* returns only status = 'published' rows.
-- 2. GET /rest/v1/case_study_blocks?select=* returns only published blocks whose
--    parent project is published.
-- 3. POST/PATCH/DELETE against every public.* content table is denied by RLS.
-- 4. GET any Storage object directly is denied. POST to the deployed media-url
--    Edge Function returns a short-lived URL only for published media.

-- Expected with an authenticated non-owner account:
-- 1. The same read scope as anon (unless an explicit future policy expands it).
-- 2. INSERT/UPDATE/DELETE is denied on admin_users and all content/media tables.

-- Expected with the designated owner account:
-- 1. Draft, published, and archived records are readable and writable.
-- 2. Uploads are allowed only in portfolio-private and portfolio-published buckets.
-- 3. Files larger than 50 MiB or with unsupported MIME types are rejected.
