# ÆZ Arena — Gang Status Control

Owner/Admin can change an approved gang's Arena status to:

- **Active** — normal Arena participation; appears in the member registration gang selector.
- **Inactive** — not currently active; hidden from new member gang selection.
- **Hiatus** — temporarily inactive; hidden from new member gang selection.
- **Does Not Belong / Left Already** — no longer part of the Arena; hidden from new member gang selection.

The system records `arena_status_changed_at` automatically whenever the Arena status changes, and stores the Owner/Admin who made the change in `arena_status_changed_by`.

Run `member_approval_system.sql` in Supabase. The migration is idempotent.

This status is separate from `gang_registrations.status`: `approved` means the gang registration was accepted; `arena_status` controls the gang's current standing in the Arena.
