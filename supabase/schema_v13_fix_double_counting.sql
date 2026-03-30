-- ============================================================
-- ScanovaX — Schema V13 Fix Double-Counting
-- ============================================================
-- Issue: One user scan was being counted as TWO
-- Root Cause: increment_scan RPC was being called twice (likely from React strict mode or network retries)
-- Fix: Add deduplication logic to prevent counting identical scans within a 10-second window

-- 1. DROP ALL PROBLEMATIC TRIGGERS (Defense in depth)
DROP TRIGGER IF EXISTS handle_new_scan ON public.scan_events;
DROP TRIGGER IF EXISTS increment_total_scans ON public.scan_events;
DROP TRIGGER IF EXISTS on_scan_event ON public.scan_events;
DROP TRIGGER IF EXISTS sync_qr_counts ON public.scan_events;
DROP TRIGGER IF EXISTS increment_scan_count ON public.scan_events;
DROP TRIGGER IF EXISTS on_scan_event_recorded ON public.scan_events;
DROP TRIGGER IF EXISTS increment_scan_count_trigger ON public.scan_events;
DROP TRIGGER IF EXISTS sync_scan_count_trigger ON public.scan_events;
DROP TRIGGER IF EXISTS update_qr_scan_count ON public.scan_events;

-- 2. RE-CREATE THE increment_scan FUNCTION WITH DEDUPLICATION
-- This prevents counting the same scan twice if RPC is called multiple times
-- (e.g., due to React StrictMode, network retries, or accidental double-clicks)
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
  -- A. DEDUPLICATION CHECK (10-second window for identical scans)
  -- Skip processing if the exact same scan from the same user occurred recently
  -- This prevents double-counting from network retries or React strict mode
  IF EXISTS (
    SELECT 1 FROM public.scan_events 
    WHERE qr_code_id = target_qr_id 
    AND user_identifier = increment_scan.user_identifier
    AND device_type = increment_scan.device_type
    AND country = increment_scan.country
    AND scanned_at > now() - interval '10 seconds'
    LIMIT 1
  ) THEN
    -- Duplicate scan detected within 10 seconds, skip processing
    RETURN;
  END IF;

  -- B. UPDATE ATOMIC COUNTERS (Only increment if not a duplicate)
  -- 1. Total Global Counter
  UPDATE public.qr_codes
  SET scan_count = coalesce(scan_count, 0) + 1
  WHERE id = target_qr_id;

  -- 2. Monthly Limit Counter
  UPDATE public.profiles 
  SET monthly_scan_count = coalesce(monthly_scan_count, 0) + 1 
  WHERE id = (SELECT user_id FROM public.qr_codes WHERE id = target_qr_id);

  -- C. LOG AUDIT EVENT
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

-- 3. VERIFY PERMISSIONS
GRANT EXECUTE ON FUNCTION public.increment_scan TO anon, authenticated;

-- 4. VERIFICATION LOG
DO $$ BEGIN
  RAISE NOTICE 'Analytics Double-Count Fix Applied: Deduplication enabled (10-second window)';
END $$;
