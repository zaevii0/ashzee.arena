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
