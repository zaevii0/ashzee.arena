-- ÆZ Arena — Gang Member Email Verification Gate
-- Run this once in Supabase SQL Editor.
-- This keeps unverified member applications out of Admin Review until the
-- applicant has confirmed the mailbox used during registration.

alter table public.profiles
  add column if not exists email_verified boolean not null default false;

-- Existing approved accounts were already admitted through the app's verified
-- login path. Mark them verified so this change does not hide existing members.
update public.profiles p
set email_verified = true
from auth.users u
where u.id = p.id
  and u.email_confirmed_at is not null
  and p.email_verified is distinct from true;

-- Keep the flag synchronized when Supabase confirms an Auth user's email.
create or replace function public.sync_aez_profile_email_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email_verified = (new.email_confirmed_at is not null)
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_sync_aez_profile_email_verified on auth.users;
create trigger trg_sync_aez_profile_email_verified
after update of email_confirmed_at on auth.users
for each row
when (old.email_confirmed_at is distinct from new.email_confirmed_at)
execute function public.sync_aez_profile_email_verified();

-- The browser also explicitly sets email_verified=true after checking
-- auth.users through Supabase Auth. The trigger above is the server-side
-- safety net for the normal email-confirmation event.
