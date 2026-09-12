import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://zaevii0.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders })

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  try {
    const body = await req.json()
    const name = String(body.name ?? '').trim()
    const gang = String(body.gang ?? '').trim().toUpperCase()
    const position = String(body.position ?? '').trim()
    const codename = String(body.codename ?? '').trim()
    const facebookProfileLink = String(body.facebook_profile_link ?? '').trim()
    const facebookUid = String(body.facebook_uid ?? '').replace(/\D/g, '')
    const joinedDate = String(body.joined_date ?? '').trim()
    const password = String(body.password ?? '')

    if (!name || !gang || !position || !codename || !facebookProfileLink || !facebookUid || !joinedDate || !password) {
      return json({ error: 'Missing required member registration fields.' }, 400)
    }
    if (facebookUid.length < 5) return json({ error: 'Facebook UID is invalid.' }, 400)
    if (name.length > 120 || codename.length > 80 || facebookProfileLink.length > 500) return json({ error: 'Name or codename is too long.' }, 400)
    if (password.length < 6) return json({ error: 'Password must meet the Supabase password requirements.' }, 400)

    const gangCheck = await admin
      .from('gang_registrations')
      .select('gang_initial')
      .eq('status', 'approved')
      .eq('gang_initial', gang)
      .limit(1)
      .maybeSingle()

    if (gangCheck.error) return json({ error: 'Approved gang verification is unavailable.' }, 500)
    if (!gangCheck.data) return json({ error: 'That gang is not currently approved for member registration.' }, 400)

    const uidCheck = await admin.rpc('aez_facebook_uid_exists', { p_facebook_uid: facebookUid })
    if (uidCheck.error) return json({ error: 'Facebook UID verification is unavailable.' }, 500)
    if (uidCheck.data === true) return json({ error: 'This Facebook UID is already registered.' }, 409)

    // Supabase Auth requires an email-style identifier for password accounts.
    // This is internal only: it is auto-confirmed server-side and is never shown
    // to the member or used as a mailbox.
    const authEmail = `member.${facebookUid}@aezarena.local`
    const created = await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        codename,
        gang,
        position,
        facebook_profile_link: facebookProfileLink,
        facebook_uid: facebookUid,
        joined_date: joinedDate,
      },
    })

    if (created.error) {
      const duplicate = /already|exists|duplicate/i.test(created.error.message || '')
      return json({ error: duplicate ? 'This member account already exists. Check the Facebook UID.' : created.error.message }, duplicate ? 409 : 400)
    }

    // Never auto-approve a newly created member. The service-role update also
    // protects this invariant even if the profiles insert trigger has a legacy
    // default status.
    const pendingProfile = await admin
      .from('profiles')
      .update({
        full_name: name,
        gang,
        position,
        codename,
        facebook_profile_link: facebookProfileLink,
        facebook_uid: facebookUid,
        joined_date: joinedDate,
        status: 'pending',
        email_verified: true,
      })
      .eq('id', created.data.user.id)

    if (pendingProfile.error) {
      await admin.auth.admin.deleteUser(created.data.user.id)
      return json({ error: 'Member account could not be placed into pending review. No account was kept.' }, 500)
    }

    return json({ user_id: created.data.user.id, auth_email: authEmail })
  } catch (error) {
    console.error('create-member error', error)
    return json({ error: 'Member registration could not be completed.' }, 500)
  }
})
