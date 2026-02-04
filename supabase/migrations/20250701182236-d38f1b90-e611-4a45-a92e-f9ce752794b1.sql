-- Add new fields for enhanced manufacturer onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'Not Verified',
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS business_docs TEXT[],
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Add constraint for verification status
ALTER TABLE public.profiles 
ADD CONSTRAINT check_verification_status 
CHECK (verification_status IN ('Not Verified', 'Under Review', 'Verified', 'Trusted'));

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
FOR SELECT USING (true);

-- Policy: Only customers can insert reviews
CREATE POLICY "Customers can insert reviews" ON public.reviews
FOR INSERT WITH CHECK (
  auth.uid() = customer_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer')
);

-- Add completed projects view for homepage
CREATE OR REPLACE VIEW public.completed_projects AS
SELECT 
  p.*,
  prof.company_name as customer_company,
  prof.full_name as customer_name
FROM public.projects p
JOIN public.profiles prof ON p.user_id = prof.id
JOIN public.orders o ON p.id = o.project_id
WHERE o.status = 'completed' OR o.status = 'delivered'
ORDER BY p.created_at DESC;