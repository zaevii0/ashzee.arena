# ÆZ Social Intelligence

This update adds a detective-style private social layer to the web app:

- Timeline posts for approved agents
- Public/private groups
- Group membership
- Group posts and comments
- Acknowledge reactions
- Direct secure chats
- Automatic group chat channels
- Approved-agent directory
- Realtime refresh for posts/comments/reactions/messages
- Light/dark mode compatible with the existing iOS glass UI

## Supabase setup

1. Open the Supabase SQL Editor for the ÆZ Arena project.
2. Run `SOCIAL_NETWORK_SETUP.sql` once.
3. Reload ÆZ Arena.
4. Log in with an approved profile.
5. Open **Social Intelligence** in the sidebar/bottom navigation.

The web app only uses the existing Supabase publishable key. No service-role key is added to the client.


### Groups
Public case rooms can be joined directly. Private case rooms are owner/moderator managed: the owner can invite approved agents from the case-room roster. Every group automatically receives a secure group-chat channel.
