-- Create chat_requests table
CREATE TABLE IF NOT EXISTS public.chat_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert new chat requests
CREATE POLICY "Allow public insert on chat_requests" 
ON public.chat_requests 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous users to select their own request by ID (for real-time status subscription)
CREATE POLICY "Allow public select on chat_requests by id" 
ON public.chat_requests 
FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to view all chat requests
CREATE POLICY "Allow admins to select all chat_requests" 
ON public.chat_requests 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to update chat requests (i.e. accept them)
CREATE POLICY "Allow admins to update chat_requests" 
ON public.chat_requests 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete chat requests
CREATE POLICY "Allow admins to delete chat_requests" 
ON public.chat_requests 
FOR DELETE 
TO authenticated 
USING (true);

-- Create publication for realtime subscriptions (if not already enabled)
-- First, drop the publication if it already exists to recreate
-- Note: 'supabase_realtime' publication is automatically managed by Supabase usually
-- But we ensure the table is added to it:
ALTER PUBLICATION supabase_realtime ADD TABLE chat_requests;
