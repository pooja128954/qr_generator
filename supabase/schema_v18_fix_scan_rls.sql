-- Fix: Allow anonymous users to read qr_codes (required for scan redirects to work)
-- The existing policy only allows the owner (auth.uid() = user_id) to read.
-- Scanners are NOT logged in, so they get NULL back → "QR not found" error.

-- Add a public SELECT policy so anonymous users can look up QR codes by ID for redirects.
DROP POLICY IF EXISTS "qr_codes: public scan read" ON public.qr_codes;
CREATE POLICY "qr_codes: public scan read" ON public.qr_codes
  FOR SELECT USING (true);

-- Note: The existing owner-only policy can remain alongside this.
-- The "true" policy means ANY role (including anon) can SELECT any row.
-- This is safe because QR contents (URLs) are meant to be public — they're printed on flyers.
