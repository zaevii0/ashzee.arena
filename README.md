# AEZ Arena — GitHub Pages

This folder contains the static website files for GitHub Pages.

## Deploy
Upload the contents of this folder to the root of your GitHub repository. GitHub Pages can serve `index.html` directly.

## Supabase
The Supabase SQL migrations and the `create-member` Edge Function are **not** deployed by GitHub Pages. They must be applied/deployed separately in Supabase.

Use the SQL files and Edge Function from the full AEZ Arena project package:
- `member_approval_system.sql`
- `member_registration_identity.sql`
- `member_email_verification.sql` (only if required by your existing setup)
- `supabase/functions/create-member/index.ts`
