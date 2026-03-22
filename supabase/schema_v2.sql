-- ============================================================
-- ScanovaX — Schema V2 Update
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Drop existing check constraint FIRST
alter table public.profiles drop constraint if exists profiles_plan_check;

-- 2. Update existing rows so they comply with the NEW constraint
update public.profiles set plan = 'economic' where plan = 'free';

-- 3. Add the new constraint
alter table public.profiles add constraint profiles_plan_check 
  check (plan in ('trial', 'economic', 'premium', 'elegant'));

-- 4. Add trial tracking column (UTC timestamp limit)
alter table public.profiles add column if not exists trial_start_date timestamptz;
alter table public.profiles add column if not exists trial_end_date timestamptz;

-- 5. Add monthly limits tracking
alter table public.profiles add column if not exists monthly_scan_count integer not null default 0;
alter table public.profiles add column if not exists scan_month text; -- Format: 'YYYY-MM'

-- 5. Update trigger function (allow passing plan and trial_start_date on signup)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    full_name, 
    plan, 
    trial_start_date,
    trial_end_date
  )
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'plan', 'economic'),
    case 
      when new.raw_user_meta_data->>'plan' = 'trial' then now()
      else null
    end,
    case 
      when new.raw_user_meta_data->>'plan' = 'trial' then now() + interval '3 days'
      else null
    end
  );
  return new;
end;
$$;

-- 6. Analytics enhancements (add location columns to scan_events)
alter table public.scan_events add column if not exists state text;
alter table public.scan_events add column if not exists city text;


