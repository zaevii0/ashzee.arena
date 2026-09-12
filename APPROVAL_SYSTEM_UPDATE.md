# ÆZ Arena — Approval System Update

Implemented in this archive:
- Member registration remains PENDING after submission; no automatic approval.
- Pending screen tells members to screenshot proof and show it to an authorized reviewer.
- Facebook Profile Link is persisted with the member profile.
- Owner/Admin can enable/disable approval authority for Leaders, Co-Leaders, and Secretaries.
- Enabled gang officers can review only members in their own gang.
- Owner/Admin can always approve/disallow any member.
- Member status decisions are performed through secure Supabase RPCs.
- Approved-member login remains Facebook UID + Gang + Codename + Password.
- Pending/rejected members cannot enter the dashboard.

Supabase action required:
Run `member_approval_system.sql` once in the Supabase SQL Editor.
Then redeploy `supabase/functions/create-member/index.ts`.

## Latest update
- Arena `admin` and `owner` reviewers can approve/disallow pending member registrations from **any gang**. Their access is not controlled by the gang officer `can_approve_members` toggle.
- Gang officers (`leader`, `co-leader`, `secretary`) remain limited to their own gang and still require Owner/Admin permission.
- Member Secure Access now preloads/caches the active approved gang list and refreshes it in the background, so the gang selector appears much faster.
- The gang selector now shows the **Gang Name [Initial]** instead of only the initial.
- Apply the updated `member_registration_identity.sql` in Supabase because `aez_approved_gang_initials()` now returns both `gang_initial` and `gang_name`.
