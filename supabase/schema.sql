-- ============================================================
-- ScanovaX — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  plan        text not null default 'free' check (plan in ('free', 'pro')),
  created_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. QR CODES
create table if not exists public.qr_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'My QR Code',
  type        text not null default 'url',
  content     text not null default '',
  fg_color    text not null default '#0f172a',
  bg_color    text not null default '#ffffff',
  ec_level    text not null default 'M',
  frame       text not null default 'None',
  shape       text not null default 'Square',
  status      text not null default 'active' check (status in ('active', 'paused')),
  scan_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 3. SCAN EVENTS
create table if not exists public.scan_events (
  id           uuid primary key default gen_random_uuid(),
  qr_code_id   uuid not null references public.qr_codes(id) on delete cascade,
  scanned_at   timestamptz not null default now(),
  country      text,
  device_type  text check (device_type in ('desktop', 'mobile'))
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.qr_codes    enable row level security;
alter table public.scan_events enable row level security;

-- Profiles: own row only
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- QR Codes: own rows only
create policy "qr_codes: select own" on public.qr_codes
  for select using (auth.uid() = user_id);
create policy "qr_codes: insert own" on public.qr_codes
  for insert with check (auth.uid() = user_id);
create policy "qr_codes: update own" on public.qr_codes
  for update using (auth.uid() = user_id);
create policy "qr_codes: delete own" on public.qr_codes
  for delete using (auth.uid() = user_id);

-- Scan Events: readable by owner of the parent QR code
create policy "scan_events: select own" on public.scan_events
  for select using (
    exists (
      select 1 from public.qr_codes
      where qr_codes.id = scan_events.qr_code_id
        and qr_codes.user_id = auth.uid()
    )
  );
create policy "scan_events: insert anon" on public.scan_events
  for insert with check (true);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists qr_codes_user_id_idx    on public.qr_codes (user_id);
create index if not exists scan_events_qr_code_idx on public.scan_events (qr_code_id);
create index if not exists scan_events_scanned_at  on public.scan_events (scanned_at);
