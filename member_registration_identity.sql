-- ÆZ Arena — Gang Member Registration Identity Update
-- Run once in Supabase SQL Editor.
--
-- This removes the need for a member-entered email address. Members use their
-- Facebook UID as their unique identity, while Supabase Auth keeps an internal
-- email-style identifier solely because password Auth requires one.

alter table public.profiles
  add column if not exists full_name text;

-- Final database-level protection: no two member profiles may use the same
-- Facebook UID. Existing duplicate rows must be resolved before this index
-- can be created successfully.
create unique index if not exists profiles_facebook_uid_unique
  on public.profiles (trim(facebook_uid))
  where facebook_uid is not null and trim(facebook_uid) <> '';

-- Return only approved gang initials to the registration UI. This avoids
-- exposing the gang officer email or other gang-registration fields.
create or replace function public.aez_approved_gang_initials()
returns table(gang_initial text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct upper(trim(gr.gang_initial)) as gang_initial
  from public.gang_registrations gr
  where gr.status = 'approved'
    and coalesce(gr.arena_status,'active') = 'active'
    and trim(coalesce(gr.gang_initial,'')) <> ''
  order by 1;
$$;

revoke execute on function public.aez_approved_gang_initials() from public;
grant execute on function public.aez_approved_gang_initials() to anon, authenticated;

-- Client-side pre-check helper. The unique index above remains the real
-- protection against races or modified clients.
create or replace function public.aez_facebook_uid_exists(p_facebook_uid text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where trim(coalesce(p.facebook_uid,'')) = trim(coalesce(p_facebook_uid,''))
      and trim(coalesce(p_facebook_uid,'')) <> ''
  );
$$;

revoke execute on function public.aez_facebook_uid_exists(text) from public;
grant execute on function public.aez_facebook_uid_exists(text) to anon, authenticated;

-- Resolve the internal Auth email from the member's Facebook UID so the login
-- screen can use Facebook UID + password instead of asking members for email.
create or replace function public.aez_member_auth_email(p_facebook_uid text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.email
  from public.profiles p
  where trim(coalesce(p.facebook_uid,'')) = trim(coalesce(p_facebook_uid,''))
    and p.status in ('pending','approved')
  order by p.created_at asc
  limit 1;
$$;

revoke execute on function public.aez_member_auth_email(text) from public;
grant execute on function public.aez_member_auth_email(text) to anon, authenticated;
