-- ============================================================
-- FORCED CLEANUP: PURGE ALL POTENTIAL DOUBLE-COUNTING TRIGGERS
-- ============================================================

-- 1. Identify and DROP any triggers that might be firing on scan_events
-- We drop by name if known, but also provide a way to drop ALL if needed.
DROP TRIGGER IF EXISTS on_scan_event_recorded ON public.scan_events;
DROP TRIGGER IF EXISTS increment_scan_count_trigger ON public.scan_events;
DROP TRIGGER IF EXISTS sync_scan_count_trigger ON public.scan_events;
DROP TRIGGER IF EXISTS update_qr_scan_count ON public.scan_events;

-- 2. No additional constraints needed - using time-based logic in function

-- 3. Re-create the DEFINITIVE increment_scan function (v3.5)
-- This function prevents double-counting using time-based de-duplication
CREATE OR REPLACE FUNCTION public.increment_scan(
  target_qr_id uuid,
  scanner_email text DEFAULT NULL,
  device_type text DEFAULT 'desktop',
  country text DEFAULT 'Unknown',
  state text DEFAULT 'Unknown',
  city text DEFAULT 'Unknown',
  ip_address text DEFAULT 'Unknown',
  user_identifier text DEFAULT 'Anonymous'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- A. Check for very recent identical scans (5-second window for same user)
  -- This prevents spam but allows legitimate re-scans
  IF EXISTS (
    SELECT 1 FROM public.scan_events 
    WHERE qr_code_id = target_qr_id 
    AND user_identifier = increment_scan.user_identifier
    AND scanned_at > now() - interval '5 seconds'
  ) THEN
    RETURN;
  END IF;

  -- B. Insert the scan event
  INSERT INTO public.scan_events (
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
  VALUES (
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

  -- C. Increment the counts
  UPDATE public.qr_codes
  SET scan_count = coalesce(scan_count, 0) + 1
  WHERE id = target_qr_id;

  UPDATE public.profiles
  SET monthly_scan_count = coalesce(monthly_scan_count, 0) + 1
  WHERE id = (SELECT user_id FROM public.qr_codes WHERE id = target_qr_id);

END;
$$;

-- 4. Final verification: Ensure we don't have any generic triggers left on scan_events
-- that might call any function starting with 'sync' or 'increment'
-- (This part requires manual check if the above doesn't work)
