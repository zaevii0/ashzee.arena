-- ÆZ Arena — Member Registration Approval & Officer Permission System
-- Run once in Supabase SQL Editor AFTER the existing member identity setup.
--
-- SECURITY RULES:
-- ÆZ Arena gang lifecycle status. This is separate from gang registration approval.
alter table public.gang_registrations
  add column if not exists arena_status text not null default 'active'
    check (arena_status in ('active','inactive','hiatus','not_in_arena'));
alter table public.gang_registrations
  add column if not exists arena_status_changed_at timestamptz not null default now();
alter table public.gang_registrations
  add column if not exists arena_status_changed_by uuid references auth.users(id) on delete set null;

create index if not exists gang_registrations_arena_status_idx
  on public.gang_registrations (arena_status, created_at desc);

create or replace function public.touch_gang_arena_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.arena_status_changed_at := coalesce(new.arena_status_changed_at, now());
  elsif new.arena_status is distinct from old.arena_status then
    new.arena_status_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_touch_gang_arena_status on public.gang_registrations;
create trigger trg_touch_gang_arena_status
before insert or update on public.gang_registrations
for each row execute function public.touch_gang_arena_status();

-- 1. Every new member profile is forced to PENDING on insert.
-- 2. Only Owner/Admin can change officer approval permissions.
-- 3. Leader/Co-Leader/Secretary can approve/disallow only their own gang
--    and only while can_approve_members=true.
-- 4. Owner/Admin can approve/disallow any member.
-- 5. The browser never directly changes member status; review goes through
--    security-definer RPCs.

alter table public.profiles
  add column if not exists facebook_profile_link text,
  add column if not exists can_approve_members boolean not null default false;

-- Ensure existing gang officers start disabled unless Owner/Admin explicitly
-- enables them.
update public.profiles
set can_approve_members = false
where lower(coalesce(role,'')) in ('leader','co-leader','secretary');

-- Never allow a new member profile to start approved.
create or replace function public.aez_force_member_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.role,'')) = 'member' then
    new.status := 'pending';
    new.can_approve_members := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_aez_force_member_pending on public.profiles;
create trigger trg_aez_force_member_pending
before insert on public.profiles
for each row execute function public.aez_force_member_pending();

-- Reviewer access helper.
create or replace function public.aez_is_member_reviewer()
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
      and (
        lower(coalesce(p.role,'')) in ('owner','admin')
        or (
          lower(coalesce(p.role,'')) in ('leader','co-leader','secretary')
          and coalesce(p.can_approve_members,false) = true
        )
      )
  );
$$;

grant execute on function public.aez_is_member_reviewer() to authenticated;

-- Return the registration records visible to the current reviewer.
create or replace function public.aez_member_registrations_for_reviewer()
returns table (
  id uuid,
  email text,
  full_name text,
  codename text,
  gang text,
  position text,
  facebook_profile_link text,
  facebook_uid text,
  joined_date date,
  status text,
  role text,
  id_photo_path text,
  created_at timestamptz,
  approved_at timestamptz,
  approved_by uuid,
  rejection_reason text,
  can_approve_members boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  reviewer_role text;
  reviewer_gang text;
begin
  select lower(coalesce(p.role,'')), p.gang
    into reviewer_role, reviewer_gang
  from public.profiles p
  where p.id = auth.uid()
    and p.status = 'approved';

  if reviewer_role is null then
    return;
  end if;

  if reviewer_role not in ('owner','admin')
     and not (
       reviewer_role in ('leader','co-leader','secretary')
       and exists (
         select 1 from public.profiles p
         where p.id=auth.uid() and coalesce(p.can_approve_members,false)=true
       )
     ) then
    return;
  end if;

  return query
  select p.id,p.email,p.full_name,p.codename,p.gang,p.position,
         p.facebook_profile_link,p.facebook_uid,p.joined_date,p.status,p.role,
         p.id_photo_path,p.created_at,p.approved_at,p.approved_by,
         p.rejection_reason,p.can_approve_members
  from public.profiles p
  where
    (reviewer_role in ('owner','admin') or p.gang = reviewer_gang)
  order by
    case when p.status='pending' then 0 when p.status='approved' then 1 else 2 end,
    p.created_at desc;
end;
$$;

revoke all on function public.aez_member_registrations_for_reviewer() from public;
grant execute on function public.aez_member_registrations_for_reviewer() to authenticated;

-- Approve or disallow a member. This is the only supported status transition
-- for member registration review.
create or replace function public.aez_review_member_registration(
  p_member_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewer public.profiles;
  target public.profiles;
  result_row public.profiles;
begin
  select * into reviewer
  from public.profiles
  where id=auth.uid() and status='approved';

  if reviewer.id is null then
    raise exception 'Reviewer account is not authorized';
  end if;

  if lower(coalesce(p_decision,'')) not in ('approved','rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  select * into target
  from public.profiles
  where id=p_member_id
  for update;

  if target.id is null then
    raise exception 'Member registration not found';
  end if;

  if target.status <> 'pending' then
    raise exception 'This registration is no longer pending';
  end if;

  if lower(coalesce(reviewer.role,'')) not in ('owner','admin') then
    if lower(coalesce(reviewer.role,'')) not in ('leader','co-leader','secretary')
       or coalesce(reviewer.can_approve_members,false) <> true then
      raise exception 'Your member approval permission is OFF';
    end if;
    if coalesce(reviewer.gang,'') <> coalesce(target.gang,'') then
      raise exception 'Gang officers can review only members of their own gang';
    end if;
  end if;

  update public.profiles
  set status = lower(p_decision),
      approved_by = auth.uid(),
      approved_at = now(),
      rejection_reason = case
        when lower(p_decision)='rejected' then nullif(trim(coalesce(p_rejection_reason,'')),'')
        else null
      end
  where id=p_member_id
  returning * into result_row;

  return result_row;
end;
$$;

revoke all on function public.aez_review_member_registration(uuid,text,text) from public;
grant execute on function public.aez_review_member_registration(uuid,text,text) to authenticated;

-- Owner/Admin-only officer permission list.
create or replace function public.aez_list_member_approval_officers()
returns table (
  id uuid,
  full_name text,
  codename text,
  gang text,
  role text,
  can_approve_members boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id,p.full_name,p.codename,p.gang,p.role,p.can_approve_members
  from public.profiles p
  where p.status='approved'
    and lower(coalesce(p.role,'')) in ('leader','co-leader','secretary')
  order by p.gang, case lower(p.role)
    when 'leader' then 1
    when 'co-leader' then 2
    when 'secretary' then 3
    else 4 end,
    p.full_name;
$$;

revoke all on function public.aez_list_member_approval_officers() from public;
grant execute on function public.aez_list_member_approval_officers() to authenticated;

-- Owner/Admin-only permission toggle.
create or replace function public.aez_set_member_approval_permission(
  p_officer_id uuid,
  p_enabled boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  actor public.profiles;
  target public.profiles;
begin
  select * into actor
  from public.profiles
  where id=auth.uid() and status='approved'
    and lower(coalesce(role,'')) in ('owner','admin');

  if actor.id is null then
    raise exception 'Only Owner/Admin can change officer approval permissions';
  end if;

  select * into target
  from public.profiles
  where id=p_officer_id
    and status='approved'
    and lower(coalesce(role,'')) in ('leader','co-leader','secretary');

  if target.id is null then
    raise exception 'Target is not an approved gang officer';
  end if;

  update public.profiles
  set can_approve_members=coalesce(p_enabled,false)
  where id=p_officer_id;

  return true;
end;
$$;

revoke all on function public.aez_set_member_approval_permission(uuid,boolean) from public;
grant execute on function public.aez_set_member_approval_permission(uuid,boolean) to authenticated;

-- Do not allow the public/client to directly update member status. Existing
-- applications should use the RPC above. If you already have a profiles
-- UPDATE policy for members, tighten it separately so status cannot be
-- changed by the member themselves.
