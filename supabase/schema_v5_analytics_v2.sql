-- Update scan_events table for better tracking
alter table public.scan_events add column if not exists user_identifier text;
alter table public.scan_events add column if not exists ip_address text;

-- Update the increment_scan function to support the new tracking requirements
create or replace function public.increment_scan(
  target_qr_id uuid,
  scanner_email text default null,
  device_type text default 'desktop',
  country text default 'Unknown',
  state text default 'Unknown',
  city text default 'Unknown',
  ip_address text default 'Unknown',
  user_identifier text default 'Anonymous'
)
returns void
language plpgsql
security definer
as $$
begin
  -- 1. Increment the scan count in the qr_codes table
  update public.qr_codes
  set scan_count = scan_count + 1
  where id = target_qr_id;

  -- 2. Insert a detailed scan event record
  insert into public.scan_events (
    qr_code_id,
    scanner_email,
    device_type,
    country,
    state,
    city,
    ip_address,
    user_identifier,
    scanned_at
  )
  values (
    target_qr_id,
    scanner_email,
    device_type,
    country,
    state,
    city,
    ip_address,
    user_identifier,
    now()
  );
end;
$$;
