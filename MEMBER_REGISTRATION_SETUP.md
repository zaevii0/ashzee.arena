# ÆZ Arena — Gang Member Registration Setup

This version removes the member's email field. Members register with their name, approved gang initial, position, codename, Facebook profile link, Facebook UID, join date, password, ID picture, and password-responsibility acknowledgment.

## 1. Run the SQL

Run `member_registration_identity.sql` once in the Supabase SQL Editor.

It:

- adds `profiles.full_name`
- enforces unique Facebook UIDs with a database unique index
- exposes only approved gang initials to the public registration UI
- provides the duplicate-UID check
- provides the Facebook-UID-to-Auth-email lookup used by member login

If the unique-index statement reports existing duplicate Facebook UIDs, resolve those duplicates first and run the statement again. Do not delete member records automatically.

## 2. Deploy the member Edge Function

The member form calls:

`supabase/functions/create-member/index.ts`

This function must run server-side because Supabase's Admin Auth API requires privileged credentials. The function creates the member Auth account with `email_confirm=true` without sending a confirmation email. The Supabase service-role key must never be placed in the browser.

Supabase documents `auth.admin.createUser()` as a server-only operation and supports `email_confirm: true`; it also warns never to expose the service-role key in browser code.

Deploy the `create-member` function through the Supabase Dashboard or Supabase CLI. The included `supabase/config.toml` sets `verify_jwt = false` because this endpoint is the public member-registration entry point; the function itself validates the registration and approved gang before creating the account.

## 3. Keep gang email verification enabled

Do **not** disable Supabase's global **Confirm Email** setting just to make member registration work. Gang registration still uses the gang officer's real email and verification flow.

Member registration does not use `auth.signUp()` in the browser. The Edge Function creates the member account server-side and auto-confirms the internal Auth identifier.

## 4. Member login

Members log in with:

- Facebook UID
- Gang initial
- Codename
- Password

The browser asks Supabase for the internal Auth email associated with the Facebook UID, then signs in with the password. Members never see or need to know the internal Auth email.

## 5. Password recovery

The form warns members that password recovery is limited and controlled through their gang's registered email. The dedicated gang-officer recovery/approval workflow is intentionally separate and should be implemented before production password-reset use. Do not use the internal member Auth email as the recovery mailbox.


## 5. Member approval and officer permissions

Run `member_approval_system.sql` after the identity SQL. This is required for the approval workflow.

New member registrations are forced to `pending` at the database level. The browser cannot approve them directly.

Owner/Admin can enable or disable `can_approve_members` for approved Leaders, Co-Leaders, and Secretaries. An enabled officer can review only members whose `gang` matches the officer's gang. Owner/Admin can always review any member.

The approval decision is performed by the `aez_review_member_registration` security-definer RPC, so changing the browser code cannot bypass the permission check.

After registration, the member should screenshot the pending confirmation and show it to an authorized gang officer or Arena Official/Admin.
