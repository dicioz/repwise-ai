-- Single account: provision via service/admin only; no client writes to allowlist.
create table public.authorized_account (singleton boolean primary key default true check(singleton), user_id uuid not null unique references auth.users(id));
alter table public.authorized_account enable row level security;
create function public.is_authorized() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.authorized_account where user_id=auth.uid()) $$;
revoke all on function public.is_authorized() from public;
grant execute on function public.is_authorized() to authenticated;
create table public.profiles(user_id uuid primary key references auth.users(id), created_at timestamptz not null default now(), unit text not null default 'kg' check(unit='kg'));
create table public.exercises(id uuid not null,user_id uuid not null references auth.users(id),name text not null,type text not null check(type in ('weight','bodyweight','weighted','machine')),unilateral boolean not null,created_at timestamptz not null default now(),primary key(user_id,id));
create table public.workout_routines(id uuid not null,user_id uuid not null references auth.users(id),name text not null,archived boolean not null default false,version bigint not null,created_at timestamptz not null default now(),primary key(user_id,id));
create table public.routine_exercises(id uuid not null,user_id uuid not null,routine_id uuid not null,exercise_id uuid not null,position int not null,rest_seconds int not null,notes text not null,primary key(user_id,id),foreign key(user_id,routine_id) references public.workout_routines(user_id,id) on delete cascade,foreign key(user_id,exercise_id) references public.exercises(user_id,id));
create table public.routine_sets(id uuid not null,user_id uuid not null,routine_exercise_id uuid not null,position int not null,kind text not null check(kind in ('work','warmup')),target int not null check(target>0),weight numeric not null check(weight>=0),primary key(user_id,id),foreign key(user_id,routine_exercise_id) references public.routine_exercises(user_id,id) on delete cascade);
create table public.workout_sessions(id uuid not null,user_id uuid not null references auth.users(id),routine_id uuid not null,name text not null,started_at timestamptz not null,finished_at timestamptz,status text not null check(status in ('active','paused','completed','partial')),notes text not null,routine_snapshot jsonb not null,updated_at timestamptz not null default now(),primary key(user_id,id));
create table public.session_exercises(id uuid not null,user_id uuid not null,session_id uuid not null,exercise_id uuid not null,position int not null,name_snapshot text not null,type_snapshot text not null,unilateral boolean not null,notes text not null,primary key(user_id,id),foreign key(user_id,session_id) references public.workout_sessions(user_id,id) on delete cascade,foreign key(user_id,exercise_id) references public.exercises(user_id,id));
create table public.performed_sets(id uuid not null,user_id uuid not null,session_exercise_id uuid not null,position int not null,kind text not null check(kind in ('work','warmup')),weight numeric not null check(weight between 0 and 2000),reps int not null check(reps between 0 and 500),target int not null check(target between 1 and 500),rpe numeric check(rpe between 1 and 10 and mod(rpe*2,1)=0),completed boolean not null,skipped boolean not null,unit text not null default 'kg' check(unit='kg'),primary key(user_id,id),foreign key(user_id,session_exercise_id) references public.session_exercises(user_id,id) on delete cascade,check(not(completed and skipped)),check(not completed or reps>0));
create table public.progression_preferences(user_id uuid not null,exercise_id uuid not null,increment numeric not null check(increment>0),easy_rpe numeric not null default 8,hard_rpe numeric not null default 9.5,primary key(user_id,exercise_id),foreign key(user_id,exercise_id) references public.exercises(user_id,id));
create table public.progression_suggestions(user_id uuid not null references auth.users(id),id text not null,decision text not null check(decision in ('accepted','ignored')),created_at timestamptz not null default now(),primary key(user_id,id));
-- document is a sync snapshot; workout facts are decomposed into normalized tables atomically.
create table public.user_settings(user_id uuid primary key references auth.users(id),theme text not null default 'system' check(theme in ('system','light','dark')),revision bigint not null default 0,last_operation uuid,document jsonb,updated_at timestamptz not null default now());
create table public.ai_reports(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),kind text not null,source_key text not null,source_revision bigint not null,model text not null,report jsonb not null,created_at timestamptz not null default now());
create table public.ai_requests(user_id uuid not null references auth.users(id),request_key text not null,day date not null default current_date,created_at timestamptz not null default now(),primary key(user_id,request_key));
alter table public.profiles enable row level security;
create policy owner_read on public.profiles for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;
alter table public.exercises enable row level security;
create policy owner_read on public.exercises for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.exercises from anon,authenticated;
grant select on public.exercises to authenticated;
alter table public.workout_routines enable row level security;
create policy owner_read on public.workout_routines for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.workout_routines from anon,authenticated;
grant select on public.workout_routines to authenticated;
alter table public.routine_exercises enable row level security;
create policy owner_read on public.routine_exercises for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.routine_exercises from anon,authenticated;
grant select on public.routine_exercises to authenticated;
alter table public.routine_sets enable row level security;
create policy owner_read on public.routine_sets for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.routine_sets from anon,authenticated;
grant select on public.routine_sets to authenticated;
alter table public.workout_sessions enable row level security;
create policy owner_read on public.workout_sessions for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.workout_sessions from anon,authenticated;
grant select on public.workout_sessions to authenticated;
alter table public.session_exercises enable row level security;
create policy owner_read on public.session_exercises for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.session_exercises from anon,authenticated;
grant select on public.session_exercises to authenticated;
alter table public.performed_sets enable row level security;
create policy owner_read on public.performed_sets for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.performed_sets from anon,authenticated;
grant select on public.performed_sets to authenticated;
alter table public.progression_preferences enable row level security;
create policy owner_read on public.progression_preferences for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.progression_preferences from anon,authenticated;
grant select on public.progression_preferences to authenticated;
alter table public.progression_suggestions enable row level security;
create policy owner_read on public.progression_suggestions for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.progression_suggestions from anon,authenticated;
grant select on public.progression_suggestions to authenticated;
alter table public.user_settings enable row level security;
create policy owner_read on public.user_settings for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.user_settings from anon,authenticated;
grant select on public.user_settings to authenticated;
alter table public.ai_reports enable row level security;
create policy owner_read on public.ai_reports for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.ai_reports from anon,authenticated;
grant select on public.ai_reports to authenticated;
alter table public.ai_requests enable row level security;
create policy owner_read on public.ai_requests for select to authenticated using(user_id=auth.uid() and public.is_authorized());
revoke all on public.ai_requests from anon,authenticated;
grant select on public.ai_requests to authenticated;

create index sessions_owner_time on public.workout_sessions(user_id,started_at);
create index reports_owner_time on public.ai_reports(user_id,created_at desc);
-- All mutations go through this transactional, locked, revision-checked function.
create function public.save_state(document jsonb,expected_revision bigint,operation_id uuid) returns bigint language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); v bigint; r jsonb; e jsonb; s jsonb; item record; pos int; setpos int; re uuid; se uuid; decision record;
begin
 if not public.is_authorized() then raise exception 'Unauthorized'; end if;
 if pg_column_size(document)>10000000 or jsonb_typeof(document->'routines')<>'array' or jsonb_typeof(document->'sessions')<>'array' then raise exception 'Invalid document'; end if;
 insert into public.user_settings(user_id) values(u) on conflict do nothing;
 select revision into v from public.user_settings where user_id=u for update;
 if exists(select 1 from public.user_settings where user_id=u and last_operation=operation_id) then return v; end if;
 if v<>expected_revision then raise exception 'CONFLICT'; end if;
 insert into public.profiles(user_id) values(u) on conflict do nothing;
 delete from public.workout_routines where user_id=u;
 delete from public.workout_sessions where user_id=u;
 for r in select value from jsonb_array_elements(document->'routines') loop
  insert into public.workout_routines(id,user_id,name,archived,version) values((r->>'id')::uuid,u,r->>'name',(r->>'archived')::boolean,v+1);
  pos:=0;
  for e in select value from jsonb_array_elements(r->'exercises') loop
   insert into public.exercises(id,user_id,name,type,unilateral) values((e->>'id')::uuid,u,e->>'name',e->>'type',(e->>'unilateral')::boolean) on conflict(user_id,id) do update set name=excluded.name,type=excluded.type,unilateral=excluded.unilateral;
   insert into public.progression_preferences(user_id,exercise_id,increment,easy_rpe,hard_rpe) values(u,(e->>'id')::uuid,(e->>'increment')::numeric,coalesce((document->'progression'->>'easyRpe')::numeric,8),coalesce((document->'progression'->>'hardRpe')::numeric,9.5)) on conflict(user_id,exercise_id) do update set increment=excluded.increment,easy_rpe=excluded.easy_rpe,hard_rpe=excluded.hard_rpe;
   re:=md5((r->>'id')||(e->>'id'))::uuid;
   insert into public.routine_exercises values(re,u,(r->>'id')::uuid,(e->>'id')::uuid,pos,(e->>'rest')::int,e->>'notes');
   setpos:=0;
   for s in select value from jsonb_array_elements(e->'sets') loop
    insert into public.routine_sets values(md5(re::text||(s->>'id'))::uuid,u,re,setpos,s->>'kind',(s->>'target')::int,(s->>'weight')::numeric);
    setpos:=setpos+1;
   end loop;
   pos:=pos+1;
  end loop;
 end loop;
 for r in select value from jsonb_array_elements(document->'sessions') loop
  insert into public.workout_sessions(id,user_id,routine_id,name,started_at,finished_at,status,notes,routine_snapshot) values((r->>'id')::uuid,u,(r->>'routineId')::uuid,r->>'name',(r->>'started')::timestamptz,(r->>'finished')::timestamptz,r->>'status',r->>'notes',r->'exercises');
  pos:=0;
  for e in select value from jsonb_array_elements(r->'exercises') loop
   insert into public.exercises(id,user_id,name,type,unilateral) values((e->>'id')::uuid,u,e->>'name',e->>'type',(e->>'unilateral')::boolean) on conflict do nothing;
   se:=md5((r->>'id')||(e->>'id'))::uuid;
   insert into public.session_exercises values(se,u,(r->>'id')::uuid,(e->>'id')::uuid,pos,e->>'name',e->>'type',(e->>'unilateral')::boolean,e->>'notes');
   setpos:=0;
   for s in select value from jsonb_array_elements(e->'sets') loop
    insert into public.performed_sets(id,user_id,session_exercise_id,position,kind,weight,reps,target,rpe,completed,skipped) values((s->>'id')::uuid,u,se,setpos,s->>'kind',(s->>'weight')::numeric,(s->>'reps')::int,(s->>'target')::int,(s->>'rpe')::numeric,(s->>'done')::boolean,(s->>'skipped')::boolean);
    setpos:=setpos+1;
   end loop;
   pos:=pos+1;
  end loop;
 end loop;
 delete from public.progression_suggestions where user_id=u;
 for decision in select key,value from jsonb_each_text(document->'decisions') loop
  insert into public.progression_suggestions(user_id,id,decision) values(u,decision.key,decision.value);
 end loop;
 update public.user_settings set revision=v+1,last_operation=operation_id,theme=save_state.document->>'theme',document=save_state.document,updated_at=now() where user_id=u;
 return v+1;
end $$;
create function public.load_state() returns jsonb language sql security definer set search_path='' as $$ select document from public.user_settings where user_id=auth.uid() and public.is_authorized() $$;
revoke all on function public.save_state(jsonb,bigint,uuid),public.load_state() from public;
grant execute on function public.save_state(jsonb,bigint,uuid),public.load_state() to authenticated;
-- Service-only, atomic daily quota and duplicate lock. Failed attempts consume quota.
create function public.claim_ai(u uuid,k text,max_daily int) returns boolean language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 delete from public.ai_requests where user_id=u and created_at<now()-interval '2 days';
 if (select count(*) from public.ai_requests where user_id=u and day=current_date)>=max_daily then raise exception 'QUOTA'; end if;
 insert into public.ai_requests(user_id,request_key) values(u,k) on conflict do nothing;
 return found;
end $$;
revoke all on function public.claim_ai(uuid,text,int) from public,anon,authenticated;
grant execute on function public.claim_ai(uuid,text,int) to service_role;
