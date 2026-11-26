-- Phase 03B: server-controlled publication of media and heading blocks.

alter table public.case_study_blocks drop constraint if exists case_study_blocks_block_type_check;
alter table public.case_study_blocks add constraint case_study_blocks_block_type_check
  check (block_type in ('heading', 'richText', 'image', 'gallery', 'quote', 'callout', 'comparison', 'decision', 'diagram', 'outcomes'));

-- The browser may create and manage draft media metadata, but it cannot mark an
-- asset publishable or point it at the published bucket. The promotion function
-- performs that transition with the server-side service key after owner checks.
drop policy if exists "owner manages media metadata" on public.media_assets;
create policy "owner reads all media metadata" on public.media_assets
  for select using (public.is_portfolio_owner());
create policy "owner creates draft media metadata" on public.media_assets
  for insert with check (public.is_portfolio_owner() and not is_public and bucket = 'portfolio-private');
create policy "owner updates draft media metadata" on public.media_assets
  for update using (public.is_portfolio_owner() and not is_public and bucket = 'portfolio-private')
  with check (public.is_portfolio_owner() and not is_public and bucket = 'portfolio-private');
create policy "owner deletes draft media metadata" on public.media_assets
  for delete using (public.is_portfolio_owner() and not is_public and bucket = 'portfolio-private');

drop policy if exists "owner manages published portfolio objects" on storage.objects;
create policy "owner reads published portfolio objects" on storage.objects
  for select using (bucket_id = 'portfolio-published' and public.is_portfolio_owner());

-- Safe owner-verification primitive for Edge Functions. It returns only a boolean
-- and is unavailable to browser roles.
create or replace function public.assert_portfolio_owner(requested_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = requested_user_id);
$$;
revoke all on function public.assert_portfolio_owner(uuid) from public, anon, authenticated;
grant execute on function public.assert_portfolio_owner(uuid) to service_role;
