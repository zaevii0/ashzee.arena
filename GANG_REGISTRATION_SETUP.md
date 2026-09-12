# ÆZ Arena — Gang Registration Setup

The public entry page now has a **Register Gang** option.

### Registration flow
1. One gang officer opens **Register Gang**.
2. They submit the gang's official information.
3. A real email address is required.
4. Supabase sends an email verification link.
5. After the email is verified, the submission is saved as **Pending**.
6. ÆZ Owner/Admin can review it from **Admin Review → Gang Registrations**.
7. A gang name and gang initial cannot be duplicated while another registration is pending or approved.

### Required Supabase setup
Open **Supabase → SQL Editor**, paste the contents of `gang_registrations.sql`, and run it once.

Also make sure Supabase Auth email sending is enabled and the site's URL is allowed under **Authentication → URL Configuration**.

For production, keep email confirmation/verification enabled so the submitting officer must prove ownership of the email address.

### Collected information
- Officer's email
- Gang name
- Gang initial
- Alias / Alis
- Motto
- Date created
- Number of active members
- Leader's name
- COO Leader's name

No password is requested for gang registration. The officer authenticates only through the verified email link.
