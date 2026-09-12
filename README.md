# ashzee.arena

## Email-verification requirement

Registration uses Supabase Auth. To reject addresses that do not belong to a
working mailbox, enable **Confirm email** in **Supabase Dashboard →
Authentication → Providers → Email** and configure this site's production URL
as an allowed redirect URL. Supabase then sends the confirmation message and
does not issue a usable session until its link is opened. The application also
checks the browser's email validity rules before submitting a registration and
does not allow an unconfirmed account to sign in.

Do not disable **Confirm email**: a client-only application cannot safely test
mailbox ownership or SMTP deliverability itself.

## ÆZ Arena PWA

This project is configured as an installable Progressive Web App (PWA) for Android and iPhone/iPad.

- Android/Chrome: open the HTTPS site and use **Install app** when offered.
- iPhone/iPad/Safari: open the HTTPS site, tap **Share → Add to Home Screen**.
- The app uses `manifest.json`, a versioned `sw.js` service worker, and PNG icons for broad install compatibility.

After deploying an update, the service worker cache version should be incremented when cached shell files change.
