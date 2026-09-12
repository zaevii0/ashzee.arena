-- ÆZ Arena — Gang Registration
-- Run this once in Supabase SQL Editor before using the new public "Register Gang" form.

create table if not exists public.gang_registrations (
  id uuid primary key default gen_random_uuid(),
  officer_user_id uuid not null references auth.users(id) on delete restrict,
  email text not null,
  gang_name text not null,
  gang_initial text not null,
  alias text not null,
  motto text not null,
  date_created date not null,
  active_members integer not null check (active_members > 0 and active_members <= 9999),
  leader_name text not null,
  coo_leader_name text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  rejection_reason text
);

create unique index if not exists gang_registrations_name_unique
  on public.gang_registrations (lower(trim(gang_name)))
  where status in ('pending','approved');

create unique index if not exists gang_registrations_initial_unique
  on public.gang_registrations (lower(trim(gang_initial)))
  where status in ('pending','approved');

create index if not exists gang_registrations_status_created_idx
  on public.gang_registrations (status, created_at desc);

alter table public.gang_registrations enable row level security;

-- SECURITY DEFINER prevents the admin check from being blocked by profiles RLS.
create or replace function public.is_aez_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
      and p.role in ('owner','admin')
  );
$$;

grant execute on function public.is_aez_admin() to authenticated;

grant select, insert, update on public.gang_registrations to authenticated;

 drop policy if exists "Gang officers can view own registration" on public.gang_registrations;
create policy "Gang officers can view own registration"
on public.gang_registrations
for select to authenticated
using (auth.uid() = officer_user_id or public.is_aez_admin());

drop policy if exists "Verified officers can submit gang registration" on public.gang_registrations;
create policy "Verified officers can submit gang registration"
on public.gang_registrations
for insert to authenticated
with check (
  auth.uid() = officer_user_id
  and lower(email) = lower(coalesce(auth.jwt()->>'email',''))
);

drop policy if exists "Owners and admins can review gang registrations" on public.gang_registrations;
create policy "Owners and admins can review gang registrations"
on public.gang_registrations
for update to authenticated
using (public.is_aez_admin())
with check (public.is_aez_admin());

-- Optional but recommended: make the email field consistent even if the client is modified.
create or replace function public.normalize_gang_registration_email()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.email := lower(trim(new.email));
  new.gang_initial := upper(trim(new.gang_initial));
  new.gang_name := trim(new.gang_name);
  new.alias := trim(new.alias);
  new.motto := trim(new.motto);
  new.leader_name := trim(new.leader_name);
  new.coo_leader_name := trim(new.coo_leader_name);
  return new;
end;
$$;

drop trigger if exists trg_normalize_gang_registration_email on public.gang_registrations;
create trigger trg_normalize_gang_registration_email
before insert or update on public.gang_registrations
for each row execute function public.normalize_gang_registration_email();
