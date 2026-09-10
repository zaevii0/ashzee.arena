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
