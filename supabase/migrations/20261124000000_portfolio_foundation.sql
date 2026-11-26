-- Abdelrahman Konbar Portfolio: secure content foundation.
-- Apply with the Supabase CLI to a development project first. This migration does
-- not create an owner account and does not seed or overwrite editorial content.

create extension if not exists pgcrypto;

do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_portfolio_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_portfolio_owner() from public;
grant execute on function public.is_portfolio_owner() to anon, authenticated;

create table if not exists public.site_settings (
  id text primary key default 'primary' check (id = 'primary'),
  profile jsonb not null default '{}'::jsonb,
  homepage jsonb not null default '{}'::jsonb,
  resume jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((status = 'published') = (published_at is not null))
);

create table if not exists public.experience_entries (
  id text primary key,
  organization text not null,
  role text not null,
  context text not null,
  summary text not null,
  display_order integer not null check (display_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (display_order),
  check ((status = 'published') = (published_at is not null))
);

create table if not exists public.expertise_entries (
  id text primary key,
  title text not null,
  short_label text not null,
  body text not null,
  details jsonb not null default '[]'::jsonb check (jsonb_typeof(details) = 'array'),
  display_order integer not null check (display_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (display_order),
  check ((status = 'published') = (published_at is not null))
);

create table if not exists public.projects (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  name_alt text,
  project_index text not null,
  category text not null,
  kind text not null,
  tagline text not null,
  description text not null,
  focus jsonb not null default '[]'::jsonb check (jsonb_typeof(focus) = 'array'),
  contribution jsonb not null default '[]'::jsonb check (jsonb_typeof(contribution) = 'array'),
  atmosphere text not null check (atmosphere in ('architectural', 'operational', 'clinical')),
  featured boolean not null default false,
  display_order integer not null check (display_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (display_order),
  check ((status = 'published') = (published_at is not null))
);

create table if not exists public.media_assets (
  id text primary key,
  bucket text not null check (bucket in ('portfolio-private', 'portfolio-published')),
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video', 'document')),
  alt_text text not null default '',
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  caption text,
  focal_point jsonb check (focal_point is null or jsonb_typeof(focal_point) = 'object'),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, storage_path),
  check ((is_public and bucket = 'portfolio-published') or (not is_public and bucket = 'portfolio-private'))
);

create table if not exists public.project_media (
  project_id text not null references public.projects(id) on delete cascade,
  media_id text not null references public.media_assets(id) on delete restrict,
  role text not null check (role in ('cover', 'gallery')),
  display_order integer not null default 0 check (display_order >= 0),
  primary key (project_id, media_id),
  unique (project_id, role, display_order)
);

create table if not exists public.case_study_blocks (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  block_type text not null check (block_type in ('richText', 'image', 'gallery', 'quote', 'callout', 'comparison', 'decision', 'diagram', 'outcomes')),
  display_order integer not null check (display_order >= 0),
  payload jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (project_id, display_order),
  check (jsonb_typeof(payload) = 'object'),
  check ((status = 'published') = (published_at is not null))
);

create index if not exists projects_public_order_idx on public.projects (display_order) where status = 'published';
create index if not exists experience_public_order_idx on public.experience_entries (display_order) where status = 'published';
create index if not exists expertise_public_order_idx on public.expertise_entries (display_order) where status = 'published';
create index if not exists case_study_public_order_idx on public.case_study_blocks (project_id, display_order) where status = 'published';
create index if not exists project_media_project_idx on public.project_media (project_id, role, display_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists experience_updated_at on public.experience_entries;
create trigger experience_updated_at before update on public.experience_entries for each row execute function public.set_updated_at();
drop trigger if exists expertise_updated_at on public.expertise_entries;
create trigger expertise_updated_at before update on public.expertise_entries for each row execute function public.set_updated_at();
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists media_updated_at on public.media_assets;
create trigger media_updated_at before update on public.media_assets for each row execute function public.set_updated_at();
drop trigger if exists blocks_updated_at on public.case_study_blocks;
create trigger blocks_updated_at before update on public.case_study_blocks for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.experience_entries enable row level security;
alter table public.expertise_entries enable row level security;
alter table public.projects enable row level security;
alter table public.media_assets enable row level security;
alter table public.project_media enable row level security;
alter table public.case_study_blocks enable row level security;

-- Explicit privileges make the API contract independent of Supabase project
-- defaults. RLS below narrows these grants to the allowed rows and owner.
grant usage on schema public to anon, authenticated;
grant usage on schema storage to authenticated;
grant usage on schema public to service_role;
grant usage on schema storage to service_role;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.site_settings from anon, authenticated;
revoke all on table public.experience_entries from anon, authenticated;
revoke all on table public.expertise_entries from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.media_assets from anon, authenticated;
revoke all on table public.project_media from anon, authenticated;
revoke all on table public.case_study_blocks from anon, authenticated;

grant select on table public.site_settings, public.experience_entries, public.expertise_entries, public.projects, public.media_assets, public.project_media, public.case_study_blocks to anon, authenticated;
grant select on table public.admin_users to authenticated;
grant insert, update, delete on table public.site_settings, public.experience_entries, public.expertise_entries, public.projects, public.media_assets, public.project_media, public.case_study_blocks to authenticated;

revoke all on table storage.objects from anon, authenticated;
revoke all on table storage.buckets from anon, authenticated;
grant select, insert, update, delete on table storage.objects to authenticated;

-- Owner-only access to the membership table. Owner assignment happens manually via
-- the Supabase SQL Editor after the real account has authenticated once.
create policy "owner can view own admin membership" on public.admin_users for select using (user_id = auth.uid());

create policy "public can read published site settings" on public.site_settings for select using (status = 'published');
create policy "owner manages site settings" on public.site_settings for all using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());
create policy "public can read published experience" on public.experience_entries for select using (status = 'published');
create policy "owner manages experience" on public.experience_entries for all using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());
create policy "public can read published expertise" on public.expertise_entries for select using (status = 'published');
create policy "owner manages expertise" on public.expertise_entries for all using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());
create policy "public can read published projects" on public.projects for select using (status = 'published');
create policy "owner manages projects" on public.projects for all using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());
create policy "public can read public media metadata" on public.media_assets for select using (is_public);
create policy "owner manages media metadata" on public.media_assets for all using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());
create policy "public can read releasable media for published projects" on public.project_media for select using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published') and exists (select 1 from public.media_assets m where m.id = media_id and m.is_public));
create policy "owner manages project media" on public.project_media for all using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());
create policy "public can read published blocks of published projects" on public.case_study_blocks for select using (status = 'published' and exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
create policy "owner manages case study blocks" on public.case_study_blocks for all using (public.is_portfolio_owner()) with check (public.is_portfolio_owner());

-- Both buckets are private. Published assets are delivered by a server-side Edge
-- Function using short-lived signed URLs only after it verifies publication.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-private', 'portfolio-private', false, 52428800, array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-published', 'portfolio-published', false, 52428800, array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "owner manages private portfolio objects" on storage.objects for all
using (bucket_id = 'portfolio-private' and public.is_portfolio_owner())
with check (bucket_id = 'portfolio-private' and public.is_portfolio_owner());
create policy "owner manages published portfolio objects" on storage.objects for all
using (bucket_id = 'portfolio-published' and public.is_portfolio_owner())
with check (bucket_id = 'portfolio-published' and public.is_portfolio_owner());

-- Invoked only by the Edge Function with the server-side service key. It returns
-- no draft asset and no asset that is not attached to a published project.
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
        select 1
        from public.project_media relation
        join public.projects project on project.id = relation.project_id
        where relation.media_id = media.id
          and project.status = 'published'
      )
      or exists (
        select 1
        from public.site_settings site
        where site.id = 'primary'
          and site.status = 'published'
          and site.resume ->> 'mediaId' = media.id
      )
    )
  limit 1;
$$;

revoke all on function public.resolve_published_media_asset(text) from public, anon, authenticated;
grant execute on function public.resolve_published_media_asset(text) to service_role;
