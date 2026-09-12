# ashzee.arena

## ÆZ Arena PWA

This project is configured as an installable Progressive Web App (PWA) for Android and iPhone/iPad.

- Android/Chrome: open the HTTPS site and use **Install app** when offered.
- iPhone/iPad/Safari: open HTTPS site, tap **Share → Add to Home Screen**.
- The app uses `manifest.json`, a versioned `sw.js` service worker, and PNG icons for broad install compatibility.
- After deploying an update, increment the service-worker cache version when cached shell files change.

## Gang Registration

A public **Register Gang** flow is included. One authorized gang officer submits the gang details and verifies a real email address before the registration enters Admin Review. See `GANG_REGISTRATION_SETUP.md` and `gang_registrations.sql` for Supabase setup.

Approved gang initials are now the only values shown in the Gang Member registration dropdown. The member screen does not contain a hard-coded gang list.

## Gang Member Registration

Gang members no longer enter an email address during registration. They submit:

- Name
- Gang (only an approved gang initial, loaded from `gang_registrations`)
- Position
- Codename
- Facebook Profile Link
- Facebook UID
- Date joined the gang
- Password
- ID picture
- Password-responsibility acknowledgment

The Facebook UID is the member's unique identity. The database update in `member_registration_identity.sql` adds a unique index so the same UID cannot be registered twice.

Because Supabase password authentication still requires an email-style Auth identifier, the browser creates an internal identifier from the Facebook UID. Members never need to know or enter that identifier; the Secure Access screen uses **Facebook UID + gang + codename + password**.

### Required Supabase update

Run `member_registration_identity.sql` once in the Supabase SQL Editor. It adds `full_name`, the unique Facebook UID protection, the approved-gang lookup function, the duplicate-UID check, and the member-login lookup function.

For this member flow, **Supabase Authentication → Email → Confirm Email must be disabled**, because members no longer provide an email address and the internal Auth identifier is not a mailbox. Gang registration still uses its own real-email verification flow.

### Password recovery rule

Member password recovery is intentionally treated as a gang-level responsibility. The registration warning tells members to save their password and explains that recovery email is limited and routed through the gang's registered email. The gang officers decide whether a recovery request should proceed.

The actual gang-officer recovery workflow should be implemented separately before production use; do not treat the internal member Auth email as a recovery mailbox.


## Member Approval System

Run `member_approval_system.sql` once in Supabase SQL Editor. New member profiles are forced to `pending`; registration never auto-approves.

- Members register with Name, approved Gang, Position, Codename, Facebook Profile Link, Facebook UID, Date Joined, Password, and ID Picture.
- After submission, the member sees a pending confirmation and is instructed to screenshot it and show it to a gang officer or Arena Official/Admin.
- Leader, Co-Leader, and Secretary approval is controlled by the Owner/Admin `Can Approve Member Registrations` permission.
- Owner/Admin can approve or reject any member registration regardless of the gang officer permission setting.
- Gang officers with permission ON can review only pending members of their own gang.
- Approved members can log in with Facebook UID + Gang + Codename + Password.
- Pending and rejected members cannot enter the member dashboard.
