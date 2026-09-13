-- ÆZ Arena — Functional public group join + realtime chat patch
-- Run once in the Supabase SQL Editor AFTER SOCIAL_NETWORK_SETUP.sql.

create or replace function public.aez_chat_groups()
returns table(
  group_id uuid,
  name text,
  description text,
  visibility text,
  member_count bigint,
  is_member boolean,
  conversation_id uuid
)
language sql
stable
security definer
set search_path=public
as $$
  select
    g.id,
    g.name,
    g.description,
    g.visibility,
    (select count(*) from public.aez_social_group_members gm2 where gm2.group_id=g.id),
    exists(select 1 from public.aez_social_group_members gm where gm.group_id=g.id and gm.user_id=auth.uid()),
    (select c.id from public.aez_social_conversations c where c.group_id=g.id and c.kind='group' limit 1)
  from public.aez_social_groups g
  where public.aez_social_is_approved()
    and (
      g.visibility='public'
      or g.created_by=auth.uid()
      or exists(select 1 from public.aez_social_group_members gm where gm.group_id=g.id and gm.user_id=auth.uid())
    )
  order by g.created_at desc;
$$;
revoke all on function public.aez_chat_groups() from public;
grant execute on function public.aez_chat_groups() to authenticated;

create or replace function public.aez_chat_join_group(p_group_id uuid)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare c_id uuid;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  if not exists(select 1 from public.aez_social_groups where id=p_group_id and visibility='public') then
    raise exception 'This case room is private or no longer available';
  end if;
  insert into public.aez_social_group_members(group_id,user_id,role)
  values(p_group_id,auth.uid(),'member')
  on conflict (group_id,user_id) do nothing;
  select c.id into c_id from public.aez_social_conversations c where c.group_id=p_group_id and c.kind='group' limit 1;
  if c_id is null then
    insert into public.aez_social_conversations(kind,title,group_id,created_by)
    select 'group',g.name,g.id,g.created_by from public.aez_social_groups g where g.id=p_group_id
    returning id into c_id;
  end if;
  insert into public.aez_social_conversation_members(conversation_id,user_id,role)
  values(c_id,auth.uid(),'member')
  on conflict (conversation_id,user_id) do nothing;
  return c_id;
end;
$$;
revoke all on function public.aez_chat_join_group(uuid) from public;
grant execute on function public.aez_chat_join_group(uuid) to authenticated;

create or replace function public.aez_chat_open_group(p_group_id uuid)
returns uuid
language sql
stable
security definer
set search_path=public
as $$
  select c.id
  from public.aez_social_conversations c
  where c.kind='group'
    and c.group_id=p_group_id
    and public.aez_social_is_group_member(p_group_id,auth.uid())
  limit 1;
$$;
revoke all on function public.aez_chat_open_group(uuid) from public;
grant execute on function public.aez_chat_open_group(uuid) to authenticated;

create or replace function public.aez_chat_messages(p_conversation_id uuid,p_limit int default 100)
returns table(id uuid,conversation_id uuid,sender_id uuid,body text,sender_codename text,created_at timestamptz)
language sql
stable
security definer
set search_path=public
as $$
  select m.id,m.conversation_id,m.sender_id,m.body,m.sender_codename,m.created_at
  from public.aez_social_messages m
  where public.aez_social_is_approved()
    and m.conversation_id=p_conversation_id
    and public.aez_social_is_conversation_member(p_conversation_id,auth.uid())
  order by m.created_at asc
  limit greatest(1,least(coalesce(p_limit,100),300));
$$;
revoke all on function public.aez_chat_messages(uuid,int) from public;
grant execute on function public.aez_chat_messages(uuid,int) to authenticated;

create or replace function public.aez_chat_send_message(p_conversation_id uuid,p_body text)
returns public.aez_social_messages
language plpgsql
security definer
set search_path=public
as $$
declare m public.aez_social_messages;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  if not public.aez_social_is_conversation_member(p_conversation_id,auth.uid()) then raise exception 'You are not a member of this chat'; end if;
  insert into public.aez_social_messages(conversation_id,sender_id,body)
  values(p_conversation_id,auth.uid(),trim(p_body))
  returning * into m;
  return m;
end;
$$;
revoke all on function public.aez_chat_send_message(uuid,text) from public;
grant execute on function public.aez_chat_send_message(uuid,text) to authenticated;

create or replace function public.aez_chat_leave_group(p_group_id uuid)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare c_id uuid;
begin
  delete from public.aez_social_group_members where group_id=p_group_id and user_id=auth.uid() and role='member';
  select id into c_id from public.aez_social_conversations where group_id=p_group_id and kind='group' limit 1;
  if c_id is not null then delete from public.aez_social_conversation_members where conversation_id=c_id and user_id=auth.uid(); end if;
  return true;
end;
$$;
revoke all on function public.aez_chat_leave_group(uuid) from public;
grant execute on function public.aez_chat_leave_group(uuid) to authenticated;

-- Make message inserts visible to Supabase Realtime.
do $$
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='aez_social_messages') then
      alter publication supabase_realtime add table public.aez_social_messages;
    end if;
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='aez_social_group_members') then
      alter publication supabase_realtime add table public.aez_social_group_members;
    end if;
  end if;
end $$;
