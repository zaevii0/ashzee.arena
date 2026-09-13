-- ÆZ Arena — Social Intelligence Network
-- Run once in Supabase SQL Editor AFTER the existing ÆZ member/profile setup.
-- This adds timeline posts, groups, group membership, comments, reactions,
-- direct/group chat, and a limited approved-agent directory.

create extension if not exists pgcrypto;

/* ============================ TABLES ============================ */
create table if not exists public.aez_social_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  description text not null default '' check (char_length(description) <= 500),
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aez_social_group_members (
  group_id uuid not null references public.aez_social_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','moderator','member')),
  joined_at timestamptz not null default now(),
  primary key (group_id,user_id)
);

create table if not exists public.aez_social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.aez_social_groups(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1400),
  author_codename text not null default 'Agent',
  author_gang text not null default 'ÆZ',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aez_social_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.aez_social_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  author_codename text not null default 'Agent',
  author_gang text not null default 'ÆZ',
  created_at timestamptz not null default now()
);

create table if not exists public.aez_social_reactions (
  post_id uuid not null references public.aez_social_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'ack',
  created_at timestamptz not null default now(),
  primary key (post_id,user_id)
);

create table if not exists public.aez_social_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct','group')),
  title text,
  group_id uuid references public.aez_social_groups(id) on delete cascade,
  direct_pair_key text unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aez_social_conversation_members (
  conversation_id uuid not null references public.aez_social_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (conversation_id,user_id)
);

create table if not exists public.aez_social_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.aez_social_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  sender_codename text not null default 'Agent',
  created_at timestamptz not null default now()
);

create index if not exists aez_social_posts_created_idx on public.aez_social_posts(created_at desc);
create index if not exists aez_social_posts_group_created_idx on public.aez_social_posts(group_id,created_at desc);
create index if not exists aez_social_comments_post_idx on public.aez_social_comments(post_id,created_at asc);
create index if not exists aez_social_messages_conversation_idx on public.aez_social_messages(conversation_id,created_at asc);
create index if not exists aez_social_groups_created_idx on public.aez_social_groups(created_at desc);

/* ============================ HELPERS ============================ */
create or replace function public.aez_social_is_approved()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id=auth.uid() and p.status='approved'
  );
$$;
grant execute on function public.aez_social_is_approved() to authenticated;

create or replace function public.aez_social_sync_identity()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare p record;
begin
  select codename, gang into p from public.profiles where id=new.author_id;
  new.author_codename := coalesce(p.codename,'Agent');
  new.author_gang := coalesce(p.gang,'ÆZ');
  return new;
end;
$$;

create or replace function public.aez_social_sync_comment_identity()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare p record;
begin
  select codename, gang into p from public.profiles where id=new.author_id;
  new.author_codename := coalesce(p.codename,'Agent');
  new.author_gang := coalesce(p.gang,'ÆZ');
  return new;
end;
$$;

create or replace function public.aez_social_sync_message_identity()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare p record;
begin
  select codename into p from public.profiles where id=new.sender_id;
  new.sender_codename := coalesce(p.codename,'Agent');
  return new;
end;
$$;

drop trigger if exists trg_aez_social_post_identity on public.aez_social_posts;
create trigger trg_aez_social_post_identity before insert on public.aez_social_posts for each row execute function public.aez_social_sync_identity();
drop trigger if exists trg_aez_social_comment_identity on public.aez_social_comments;
create trigger trg_aez_social_comment_identity before insert on public.aez_social_comments for each row execute function public.aez_social_sync_comment_identity();
drop trigger if exists trg_aez_social_message_identity on public.aez_social_messages;
create trigger trg_aez_social_message_identity before insert on public.aez_social_messages for each row execute function public.aez_social_sync_message_identity();


/* Avoid RLS self-recursion when a membership policy needs to check membership. */
create or replace function public.aez_social_is_group_member(p_group_id uuid,p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.aez_social_group_members gm where gm.group_id=p_group_id and gm.user_id=p_user_id); $$;
grant execute on function public.aez_social_is_group_member(uuid,uuid) to authenticated;

create or replace function public.aez_social_is_conversation_member(p_conversation_id uuid,p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.aez_social_conversation_members cm where cm.conversation_id=p_conversation_id and cm.user_id=p_user_id); $$;
grant execute on function public.aez_social_is_conversation_member(uuid,uuid) to authenticated;

/* ============================ RLS ============================ */
alter table public.aez_social_groups enable row level security;
alter table public.aez_social_group_members enable row level security;
alter table public.aez_social_posts enable row level security;
alter table public.aez_social_comments enable row level security;
alter table public.aez_social_reactions enable row level security;
alter table public.aez_social_conversations enable row level security;
alter table public.aez_social_conversation_members enable row level security;
alter table public.aez_social_messages enable row level security;

grant select,insert on public.aez_social_groups to authenticated;
grant select,insert,delete on public.aez_social_group_members to authenticated;
grant select,insert on public.aez_social_posts to authenticated;
grant select,insert on public.aez_social_comments to authenticated;
grant select,insert,delete on public.aez_social_reactions to authenticated;
grant select,insert on public.aez_social_conversations to authenticated;
grant select,insert on public.aez_social_conversation_members to authenticated;
grant select,insert on public.aez_social_messages to authenticated;

drop policy if exists aez_social_groups_select on public.aez_social_groups;
create policy aez_social_groups_select on public.aez_social_groups for select to authenticated using (
  public.aez_social_is_approved() and (visibility='public' or exists(select 1 from public.aez_social_group_members gm where gm.group_id=id and gm.user_id=auth.uid()))
);

drop policy if exists aez_social_groups_insert on public.aez_social_groups;
create policy aez_social_groups_insert on public.aez_social_groups for insert to authenticated with check (public.aez_social_is_approved() and created_by=auth.uid());

drop policy if exists aez_social_group_members_select on public.aez_social_group_members;
create policy aez_social_group_members_select on public.aez_social_group_members for select to authenticated using (
  public.aez_social_is_approved() and (
    exists(select 1 from public.aez_social_groups g where g.id=group_id and g.visibility='public')
    or user_id=auth.uid()
    or public.aez_social_is_group_member(group_id,auth.uid())
  )
);

drop policy if exists aez_social_group_members_insert on public.aez_social_group_members;
create policy aez_social_group_members_insert on public.aez_social_group_members for insert to authenticated with check (public.aez_social_is_approved() and user_id=auth.uid());

drop policy if exists aez_social_group_members_delete on public.aez_social_group_members;
create policy aez_social_group_members_delete on public.aez_social_group_members for delete to authenticated using (user_id=auth.uid());

drop policy if exists aez_social_posts_select on public.aez_social_posts;
create policy aez_social_posts_select on public.aez_social_posts for select to authenticated using (
  public.aez_social_is_approved() and (group_id is null or exists(select 1 from public.aez_social_group_members gm where gm.group_id=aez_social_posts.group_id and gm.user_id=auth.uid()))
);

drop policy if exists aez_social_posts_insert on public.aez_social_posts;
create policy aez_social_posts_insert on public.aez_social_posts for insert to authenticated with check (
  public.aez_social_is_approved() and author_id=auth.uid() and (group_id is null or exists(select 1 from public.aez_social_group_members gm where gm.group_id=aez_social_posts.group_id and gm.user_id=auth.uid()))
);

drop policy if exists aez_social_comments_select on public.aez_social_comments;
create policy aez_social_comments_select on public.aez_social_comments for select to authenticated using (
  public.aez_social_is_approved() and exists(select 1 from public.aez_social_posts p where p.id=post_id and (p.group_id is null or exists(select 1 from public.aez_social_group_members gm where gm.group_id=p.group_id and gm.user_id=auth.uid())))
);

drop policy if exists aez_social_comments_insert on public.aez_social_comments;
create policy aez_social_comments_insert on public.aez_social_comments for insert to authenticated with check (
  public.aez_social_is_approved() and author_id=auth.uid() and exists(select 1 from public.aez_social_posts p where p.id=post_id and (p.group_id is null or exists(select 1 from public.aez_social_group_members gm where gm.group_id=p.group_id and gm.user_id=auth.uid())))
);

drop policy if exists aez_social_reactions_select on public.aez_social_reactions;
create policy aez_social_reactions_select on public.aez_social_reactions for select to authenticated using (
  public.aez_social_is_approved() and exists(select 1 from public.aez_social_posts p where p.id=post_id and (p.group_id is null or exists(select 1 from public.aez_social_group_members gm where gm.group_id=p.group_id and gm.user_id=auth.uid())))
);

drop policy if exists aez_social_reactions_insert on public.aez_social_reactions;
create policy aez_social_reactions_insert on public.aez_social_reactions for insert to authenticated with check (public.aez_social_is_approved() and user_id=auth.uid());

drop policy if exists aez_social_reactions_delete on public.aez_social_reactions;
create policy aez_social_reactions_delete on public.aez_social_reactions for delete to authenticated using (user_id=auth.uid());

drop policy if exists aez_social_conversations_select on public.aez_social_conversations;
create policy aez_social_conversations_select on public.aez_social_conversations for select to authenticated using (public.aez_social_is_approved() and public.aez_social_is_conversation_member(id,auth.uid()));

drop policy if exists aez_social_conversations_insert on public.aez_social_conversations;
create policy aez_social_conversations_insert on public.aez_social_conversations for insert to authenticated with check (public.aez_social_is_approved() and created_by=auth.uid());

drop policy if exists aez_social_conversation_members_select on public.aez_social_conversation_members;
create policy aez_social_conversation_members_select on public.aez_social_conversation_members for select to authenticated using (public.aez_social_is_approved() and public.aez_social_is_conversation_member(conversation_id,auth.uid()));

drop policy if exists aez_social_conversation_members_insert on public.aez_social_conversation_members;
create policy aez_social_conversation_members_insert on public.aez_social_conversation_members for insert to authenticated with check (public.aez_social_is_approved());

drop policy if exists aez_social_messages_select on public.aez_social_messages;
create policy aez_social_messages_select on public.aez_social_messages for select to authenticated using (public.aez_social_is_approved() and public.aez_social_is_conversation_member(conversation_id,auth.uid()));

drop policy if exists aez_social_messages_insert on public.aez_social_messages;
create policy aez_social_messages_insert on public.aez_social_messages for insert to authenticated with check (public.aez_social_is_approved() and sender_id=auth.uid() and exists(select 1 from public.aez_social_conversation_members cm where cm.conversation_id=aez_social_messages.conversation_id and cm.user_id=auth.uid()));

/* ============================ RPC: DIRECTORY ============================ */
create or replace function public.aez_social_directory(p_search text default null,p_limit int default 30)
returns table(user_id uuid,codename text,gang text,"position" text,role text)
language sql stable security definer set search_path=public
as $$
  select p.id,p.codename,p.gang,p."position",p.role
  from public.profiles p
  where public.aez_social_is_approved()
    and p.status='approved'
    and (nullif(trim(p_search),'') is null or lower(coalesce(p.codename,'')) like '%'||lower(trim(p_search))||'%' or lower(coalesce(p.gang,'')) like '%'||lower(trim(p_search))||'%')
  order by lower(coalesce(p.codename,''))
  limit greatest(1,least(coalesce(p_limit,30),50));
$$;
revoke all on function public.aez_social_directory(text,int) from public;
grant execute on function public.aez_social_directory(text,int) to authenticated;

/* ============================ RPC: GROUPS ============================ */
create or replace function public.aez_social_create_group(p_name text,p_description text default '',p_visibility text default 'public')
returns public.aez_social_groups
language plpgsql security definer set search_path=public
as $$
declare g public.aez_social_groups; c public.aez_social_conversations;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  insert into public.aez_social_groups(name,description,visibility,created_by) values(trim(p_name),trim(coalesce(p_description,'')),lower(p_visibility),auth.uid()) returning * into g;
  insert into public.aez_social_group_members(group_id,user_id,role) values(g.id,auth.uid(),'owner');
  insert into public.aez_social_conversations(kind,title,group_id,created_by) values('group',g.name,g.id,auth.uid()) returning * into c;
  insert into public.aez_social_conversation_members(conversation_id,user_id,role) values(c.id,auth.uid(),'owner');
  return g;
end;
$$;
revoke all on function public.aez_social_create_group(text,text,text) from public;
grant execute on function public.aez_social_create_group(text,text,text) to authenticated;

create or replace function public.aez_social_join_group(p_group_id uuid)
returns void
language plpgsql security definer set search_path=public
as $$
declare v text;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  select visibility into v from public.aez_social_groups where id=p_group_id;
  if v is null then raise exception 'Group not found'; end if;
  if v='private' and not exists(select 1 from public.aez_social_group_members where group_id=p_group_id and user_id=auth.uid()) then
    raise exception 'Private group access requires an invitation';
  end if;
  insert into public.aez_social_group_members(group_id,user_id,role) values(p_group_id,auth.uid(),'member') on conflict do nothing;
  insert into public.aez_social_conversation_members(conversation_id,user_id,role)
  select c.id,auth.uid(),'member' from public.aez_social_conversations c where c.group_id=p_group_id
  on conflict do nothing;
end;
$$;
revoke all on function public.aez_social_join_group(uuid) from public;
grant execute on function public.aez_social_join_group(uuid) to authenticated;

create or replace function public.aez_social_groups(p_search text default null,p_limit int default 60)
returns table(id uuid,name text,description text,visibility text,created_by uuid,created_at timestamptz,member_count bigint,is_member boolean,is_owner boolean)
language sql stable security definer set search_path=public
as $$
  select g.id,g.name,g.description,g.visibility,g.created_by,g.created_at,
    (select count(*) from public.aez_social_group_members gm where gm.group_id=g.id) as member_count,
    exists(select 1 from public.aez_social_group_members gm where gm.group_id=g.id and gm.user_id=auth.uid()) as is_member,
    exists(select 1 from public.aez_social_group_members gm where gm.group_id=g.id and gm.user_id=auth.uid() and gm.role='owner') as is_owner
  from public.aez_social_groups g
  where public.aez_social_is_approved()
    and (g.visibility='public' or exists(select 1 from public.aez_social_group_members gm where gm.group_id=g.id and gm.user_id=auth.uid()))
    and (nullif(trim(p_search),'') is null or lower(g.name) like '%'||lower(trim(p_search))||'%')
  order by g.created_at desc limit greatest(1,least(coalesce(p_limit,60),100));
$$;
revoke all on function public.aez_social_groups(text,int) from public;
grant execute on function public.aez_social_groups(text,int) to authenticated;

create or replace function public.aez_social_group_members(p_group_id uuid)
returns table(user_id uuid,codename text,gang text,"position" text,role text,joined_at timestamptz)
language sql stable security definer set search_path=public
as $$
  select gm.user_id,p.codename,p.gang,p."position",gm.role,gm.joined_at
  from public.aez_social_group_members gm join public.profiles p on p.id=gm.user_id
  where public.aez_social_is_approved() and gm.group_id=p_group_id and p.status='approved'
    and (public.aez_social_is_group_member(p_group_id,auth.uid()) or exists(select 1 from public.aez_social_groups g where g.id=p_group_id and g.visibility='public'))
  order by case gm.role when 'owner' then 0 when 'moderator' then 1 else 2 end, lower(coalesce(p.codename,''));
$$;
revoke all on function public.aez_social_group_members(uuid) from public;
grant execute on function public.aez_social_group_members(uuid) to authenticated;


create or replace function public.aez_social_add_group_member(p_group_id uuid,p_user_id uuid)
returns void language plpgsql security definer set search_path=public
as $$
declare cid uuid;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  if not exists(select 1 from public.aez_social_group_members gm where gm.group_id=p_group_id and gm.user_id=auth.uid() and gm.role in ('owner','moderator')) then raise exception 'Only group managers can invite agents'; end if;
  if not exists(select 1 from public.profiles p where p.id=p_user_id and p.status='approved') then raise exception 'Agent is not approved'; end if;
  insert into public.aez_social_group_members(group_id,user_id,role) values(p_group_id,p_user_id,'member') on conflict do nothing;
  select id into cid from public.aez_social_conversations where group_id=p_group_id limit 1;
  if cid is not null then insert into public.aez_social_conversation_members(conversation_id,user_id,role) values(cid,p_user_id,'member') on conflict do nothing; end if;
end;
$$;
revoke all on function public.aez_social_add_group_member(uuid,uuid) from public;
grant execute on function public.aez_social_add_group_member(uuid,uuid) to authenticated;

/* ============================ RPC: POSTS ============================ */
create or replace function public.aez_social_create_post(p_group_id uuid,p_body text)
returns public.aez_social_posts
language plpgsql security definer set search_path=public
as $$
  declare r public.aez_social_posts;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  if p_group_id is not null and not exists(select 1 from public.aez_social_group_members gm where gm.group_id=p_group_id and gm.user_id=auth.uid()) then raise exception 'Join the group before posting'; end if;
  insert into public.aez_social_posts(author_id,group_id,body) values(auth.uid(),p_group_id,trim(p_body)) returning * into r;
  return r;
end;
$$;
revoke all on function public.aez_social_create_post(uuid,text) from public;
grant execute on function public.aez_social_create_post(uuid,text) to authenticated;

create or replace function public.aez_social_feed(p_limit int default 40,p_offset int default 0)
returns table(id uuid,author_id uuid,author_codename text,author_gang text,group_id uuid,group_name text,body text,created_at timestamptz,reaction_count bigint,comment_count bigint,reacted_by_me boolean)
language sql stable security definer set search_path=public
as $$
  select p.id,p.author_id,p.author_codename,p.author_gang,p.group_id,g.name,p.body,p.created_at,
    (select count(*) from public.aez_social_reactions r where r.post_id=p.id) as reaction_count,
    (select count(*) from public.aez_social_comments c where c.post_id=p.id) as comment_count,
    exists(select 1 from public.aez_social_reactions r where r.post_id=p.id and r.user_id=auth.uid()) as reacted_by_me
  from public.aez_social_posts p left join public.aez_social_groups g on g.id=p.group_id
  where public.aez_social_is_approved() and (p.group_id is null or exists(select 1 from public.aez_social_group_members gm where gm.group_id=p.group_id and gm.user_id=auth.uid()))
  order by p.created_at desc offset greatest(coalesce(p_offset,0),0) limit greatest(1,least(coalesce(p_limit,40),100));
$$;
revoke all on function public.aez_social_feed(int,int) from public;
grant execute on function public.aez_social_feed(int,int) to authenticated;

create or replace function public.aez_social_group_feed(p_group_id uuid,p_limit int default 40,p_offset int default 0)
returns table(id uuid,author_id uuid,author_codename text,author_gang text,group_id uuid,group_name text,body text,created_at timestamptz,reaction_count bigint,comment_count bigint,reacted_by_me boolean)
language sql stable security definer set search_path=public
as $$
  select * from public.aez_social_feed(p_limit,p_offset) where group_id=p_group_id order by created_at desc;
$$;
revoke all on function public.aez_social_group_feed(uuid,int,int) from public;
grant execute on function public.aez_social_group_feed(uuid,int,int) to authenticated;

create or replace function public.aez_social_toggle_reaction(p_post_id uuid)
returns table(reacted boolean,reaction_count bigint)
language plpgsql security definer set search_path=public
as $$
declare had boolean;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  select exists(select 1 from public.aez_social_reactions r where r.post_id=p_post_id and r.user_id=auth.uid()) into had;
  if had then delete from public.aez_social_reactions where post_id=p_post_id and user_id=auth.uid(); else insert into public.aez_social_reactions(post_id,user_id,reaction) values(p_post_id,auth.uid(),'ack'); end if;
  return query select not had,(select count(*) from public.aez_social_reactions r where r.post_id=p_post_id);
end;
$$;
revoke all on function public.aez_social_toggle_reaction(uuid) from public;
grant execute on function public.aez_social_toggle_reaction(uuid) to authenticated;

create or replace function public.aez_social_add_comment(p_post_id uuid,p_body text)
returns public.aez_social_comments
language plpgsql security definer set search_path=public
as $$
declare r public.aez_social_comments; gid uuid;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  select group_id into gid from public.aez_social_posts where id=p_post_id;
  if not found then raise exception 'Post not found'; end if;
  if gid is not null and not exists(select 1 from public.aez_social_group_members gm where gm.group_id=gid and gm.user_id=auth.uid()) then raise exception 'Join the group to comment'; end if;
  insert into public.aez_social_comments(post_id,author_id,body) values(p_post_id,auth.uid(),trim(p_body)) returning * into r;
  return r;
end;
$$;
revoke all on function public.aez_social_add_comment(uuid,text) from public;
grant execute on function public.aez_social_add_comment(uuid,text) to authenticated;

create or replace function public.aez_social_post_comments(p_post_id uuid)
returns table(id uuid,author_id uuid,author_codename text,author_gang text,body text,created_at timestamptz)
language sql stable security definer set search_path=public
as $$
  select c.id,c.author_id,c.author_codename,c.author_gang,c.body,c.created_at
  from public.aez_social_comments c
  where public.aez_social_is_approved() and c.post_id=p_post_id
    and exists(select 1 from public.aez_social_posts p where p.id=c.post_id and (p.group_id is null or exists(select 1 from public.aez_social_group_members gm where gm.group_id=p.group_id and gm.user_id=auth.uid())))
  order by c.created_at asc;
$$;
revoke all on function public.aez_social_post_comments(uuid) from public;
grant execute on function public.aez_social_post_comments(uuid) to authenticated;

/* ============================ RPC: CHAT ============================ */
create or replace function public.aez_social_start_direct_chat(p_other_user_id uuid)
returns table(conversation_id uuid)
language plpgsql security definer set search_path=public
as $$
declare pair text; cid uuid;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  if p_other_user_id=auth.uid() then raise exception 'You cannot start a direct channel with yourself'; end if;
  if not exists(select 1 from public.profiles p where p.id=p_other_user_id and p.status='approved') then raise exception 'Agent is not approved'; end if;
  pair := least(auth.uid()::text,p_other_user_id::text)||':'||greatest(auth.uid()::text,p_other_user_id::text);
  select id into cid from public.aez_social_conversations where direct_pair_key=pair limit 1;
  if cid is null then
    insert into public.aez_social_conversations(kind,title,direct_pair_key,created_by) values('direct',null,pair,auth.uid()) returning id into cid;
    insert into public.aez_social_conversation_members(conversation_id,user_id,role) values(cid,auth.uid(),'owner'),(cid,p_other_user_id,'member');
  end if;
  return query select cid;
end;
$$;
revoke all on function public.aez_social_start_direct_chat(uuid) from public;
grant execute on function public.aez_social_start_direct_chat(uuid) to authenticated;

create or replace function public.aez_social_conversations()
returns table(id uuid,kind text,title text,subtitle text,group_id uuid,member_count bigint,unread_count bigint,updated_at timestamptz)
language sql stable security definer set search_path=public
as $$
  select c.id,c.kind,
    case when c.kind='group' then c.title else (
      select coalesce(p.codename,'Agent') from public.aez_social_conversation_members cm2 join public.profiles p on p.id=cm2.user_id where cm2.conversation_id=c.id and cm2.user_id<>auth.uid() limit 1
    ) end as title,
    case when c.kind='group' then 'Group channel' else 'Direct channel' end as subtitle,
    c.group_id,(select count(*) from public.aez_social_conversation_members cm where cm.conversation_id=c.id) as member_count,0::bigint,c.updated_at
  from public.aez_social_conversations c
  where public.aez_social_is_approved() and exists(select 1 from public.aez_social_conversation_members cm where cm.conversation_id=c.id and cm.user_id=auth.uid())
  order by c.updated_at desc,c.created_at desc;
$$;
revoke all on function public.aez_social_conversations() from public;
grant execute on function public.aez_social_conversations() to authenticated;

create or replace function public.aez_social_messages(p_conversation_id uuid,p_limit int default 100)
returns table(id uuid,conversation_id uuid,sender_id uuid,sender_codename text,body text,created_at timestamptz)
language sql stable security definer set search_path=public
as $$
  select m.id,m.conversation_id,m.sender_id,m.sender_codename,m.body,m.created_at
  from public.aez_social_messages m
  where public.aez_social_is_approved() and m.conversation_id=p_conversation_id
    and exists(select 1 from public.aez_social_conversation_members cm where cm.conversation_id=p_conversation_id and cm.user_id=auth.uid())
  order by m.created_at asc limit greatest(1,least(coalesce(p_limit,100),250));
$$;
revoke all on function public.aez_social_messages(uuid,int) from public;
grant execute on function public.aez_social_messages(uuid,int) to authenticated;

create or replace function public.aez_social_send_message(p_conversation_id uuid,p_body text)
returns public.aez_social_messages
language plpgsql security definer set search_path=public
as $$
declare r public.aez_social_messages;
begin
  if not public.aez_social_is_approved() then raise exception 'Approved access required'; end if;
  if not exists(select 1 from public.aez_social_conversation_members cm where cm.conversation_id=p_conversation_id and cm.user_id=auth.uid()) then raise exception 'You are not a member of this channel'; end if;
  insert into public.aez_social_messages(conversation_id,sender_id,body) values(p_conversation_id,auth.uid(),trim(p_body)) returning * into r;
  update public.aez_social_conversations set updated_at=now() where id=p_conversation_id;
  return r;
end;
$$;
revoke all on function public.aez_social_send_message(uuid,text) from public;
grant execute on function public.aez_social_send_message(uuid,text) to authenticated;

/* Allow public groups only to be joined via the RPC, not by direct client inserts. */
revoke insert on public.aez_social_group_members from authenticated;
revoke insert on public.aez_social_conversation_members from authenticated;
revoke insert on public.aez_social_conversations from authenticated;
revoke insert on public.aez_social_groups from authenticated;
revoke insert on public.aez_social_posts from authenticated;
revoke insert on public.aez_social_comments from authenticated;
revoke insert on public.aez_social_messages from authenticated;
revoke insert on public.aez_social_reactions from authenticated;

/* ============================ REALTIME ============================ */
do $$ begin
  begin execute 'alter publication supabase_realtime add table public.aez_social_posts'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.aez_social_comments'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.aez_social_reactions'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.aez_social_messages'; exception when duplicate_object then null; end;
end $$;

-- Optional future hardening: add notification/read-state tables once the base
-- social network is stable.
