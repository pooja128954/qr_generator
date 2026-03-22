-- Update increment_scan to prevent double-counting within a short window (5 seconds)
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
  -- 0. De-duplication check: Ignore if same user scanned same QR in last 5 seconds
  if exists (
    select 1 from public.scan_events 
    where qr_code_id = target_qr_id 
    and public.scan_events.user_identifier = increment_scan.user_identifier 
    and scanned_at > now() - interval '5 seconds'
  ) then
    return;
  end if;

  -- 1. Increment the scan count in the qr_codes table
  update public.qr_codes
  set scan_count = scan_count + 1
  where id = target_qr_id;

  -- 2. Update profile monthly scan count
  -- (Optional but recommended for consistency)
  update public.profiles 
  set monthly_scan_count = coalesce(monthly_scan_count, 0) + 1 
  where id = (select user_id from public.qr_codes where id = target_qr_id);

  -- 3. Insert a detailed scan event record
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
