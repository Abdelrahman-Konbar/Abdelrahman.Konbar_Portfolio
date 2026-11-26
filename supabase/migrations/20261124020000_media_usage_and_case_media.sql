-- Media usage inspection is server-only so delete-media can refuse unsafe deletion.
create or replace function public.find_media_asset_usage(requested_media_id text)
returns table (resource_type text, resource_id text, detail text)
language sql
stable
security definer
set search_path = public
as $$
  select 'project_media', relation.project_id, relation.role
  from public.project_media relation
  where relation.media_id = requested_media_id
  union all
  select 'case_study_block', block.id, block.block_type
  from public.case_study_blocks block
  where block.payload ->> 'mediaId' = requested_media_id
     or block.payload ->> 'beforeMediaId' = requested_media_id
     or block.payload ->> 'afterMediaId' = requested_media_id
     or coalesce(block.payload -> 'mediaIds', '[]'::jsonb) ? requested_media_id
  union all
  select 'resume', site.id, 'resume media'
  from public.site_settings site
  where site.resume ->> 'mediaId' = requested_media_id;
$$;
revoke all on function public.find_media_asset_usage(text) from public, anon, authenticated;
grant execute on function public.find_media_asset_usage(text) to service_role;

-- Published case-study blocks may reference published media without a project_media row.
create or replace function public.resolve_published_media_asset(requested_media_id text)
returns table (bucket text, storage_path text)
language sql
stable
security definer
set search_path = public
as $$
  select media.bucket, media.storage_path
  from public.media_assets media
  where media.id = requested_media_id
    and media.is_public
    and (
      exists (
        select 1 from public.project_media relation
        join public.projects project on project.id = relation.project_id
        where relation.media_id = media.id and project.status = 'published'
      )
      or exists (
        select 1 from public.case_study_blocks block
        join public.projects project on project.id = block.project_id
        where project.status = 'published'
          and block.status = 'published'
          and (
            block.payload ->> 'mediaId' = media.id
            or block.payload ->> 'beforeMediaId' = media.id
            or block.payload ->> 'afterMediaId' = media.id
            or coalesce(block.payload -> 'mediaIds', '[]'::jsonb) ? media.id
          )
      )
      or exists (
        select 1 from public.site_settings site
        where site.id = 'primary' and site.status = 'published' and site.resume ->> 'mediaId' = media.id
      )
    )
  limit 1;
$$;
revoke all on function public.resolve_published_media_asset(text) from public, anon, authenticated;
grant execute on function public.resolve_published_media_asset(text) to service_role;
