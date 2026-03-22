-- ==========================================
-- FINAL CLEANUP: FIX DOUBLE-COUNTING
-- ==========================================

-- 1. Drop all possible versions of the function to start fresh
DROP FUNCTION IF EXISTS public.increment_scan(uuid, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.increment_scan(uuid, text, text, text, text, text, text, text);

-- 2. Drop any potential triggers that might be doing redundant increments
DROP TRIGGER IF EXISTS on_scan_event_recorded ON public.scan_events;
DROP FUNCTION IF EXISTS public.sync_scan_count();

-- 3. Create the DEFINITIVE v3 function with de-duplication
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
  -- A. De-duplication check: Ignore if SAME user scanned SAME QR in last 10 seconds
  -- This prevents noise from browser pre-fetching or scanner "preview" hits.
  IF EXISTS (
    SELECT 1 FROM public.scan_events 
    WHERE qr_code_id = target_qr_id 
    AND public.scan_events.user_identifier = increment_scan.user_identifier 
    AND scanned_at > now() - interval '10 seconds'
  ) THEN
    RETURN;
  END IF;

  -- B. Increment QR code total scans (Source of Truth for "Total Scans")
  UPDATE public.qr_codes
  SET scan_count = coalesce(scan_count, 0) + 1
  WHERE id = target_qr_id;

  -- C. Update profile monthly scan count (for billing/limits)
  UPDATE public.profiles 
  SET monthly_scan_count = coalesce(monthly_scan_count, 0) + 1 
  WHERE id = (SELECT user_id FROM public.qr_codes WHERE id = target_qr_id);

  -- D. Record the detailed scan event (Source for Geography/Unique stats)
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
END;
$$;
