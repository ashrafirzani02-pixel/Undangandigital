-- VowInvite Studio: initial Supabase schema
-- Apply in Supabase SQL Editor. RLS is enabled on every app table.

create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null default 'Wedding Invitation',
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitations_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{2,59}$')
);

create index if not exists invitations_owner_id_idx on public.invitations(owner_id);
create index if not exists invitations_published_slug_idx on public.invitations(slug) where is_published = true;

create table if not exists public.invitation_rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_name text not null check (char_length(trim(guest_name)) between 1 and 120),
  attendance text not null check (attendance in ('Hadir','Tidak hadir','Masih ragu')),
  message text not null default '' check (char_length(message) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists invitation_rsvps_invitation_id_idx on public.invitation_rsvps(invitation_id, created_at desc);

alter table public.invitations enable row level security;
alter table public.invitation_rsvps enable row level security;

revoke all on public.invitations from anon, authenticated;
revoke all on public.invitation_rsvps from anon, authenticated;
grant select, insert, update, delete on public.invitations to authenticated;
grant select on public.invitations to anon;
grant select, insert, delete on public.invitation_rsvps to authenticated;
grant insert on public.invitation_rsvps to anon;

drop policy if exists "owners manage invitations" on public.invitations;
create policy "owners manage invitations"
on public.invitations for all to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "public read published invitations" on public.invitations;
create policy "public read published invitations"
on public.invitations for select to anon, authenticated
using (is_published = true);

drop policy if exists "public guests submit rsvp" on public.invitation_rsvps;
create policy "public guests submit rsvp"
on public.invitation_rsvps for insert to anon, authenticated
with check (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.is_published = true
  )
);

drop policy if exists "owners read invitation rsvps" on public.invitation_rsvps;
create policy "owners read invitation rsvps"
on public.invitation_rsvps for select to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

drop policy if exists "owners delete invitation rsvps" on public.invitation_rsvps;
create policy "owners delete invitation rsvps"
on public.invitation_rsvps for delete to authenticated
using (
  exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = auth.uid()
  )
);

-- Public bucket for assets embedded in published invitations.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invitation-media', 'invitation-media', true, 15728640,
  array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/wav','audio/ogg'])
on conflict (id) do update set public = true, file_size_limit = 15728640,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read invitation media" on storage.objects;
create policy "public read invitation media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'invitation-media');

drop policy if exists "users upload own invitation media" on storage.objects;
create policy "users upload own invitation media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'invitation-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users update own invitation media" on storage.objects;
create policy "users update own invitation media"
on storage.objects for update to authenticated
using (
  bucket_id = 'invitation-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'invitation-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users delete own invitation media" on storage.objects;
create policy "users delete own invitation media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'invitation-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
