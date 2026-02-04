
-- Create the bids table to store manufacturer bids on projects
CREATE TABLE IF NOT EXISTS public.bids (
  bid_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  estimated_delivery_time INTEGER NOT NULL, -- days
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate bids from same manufacturer on same project
ALTER TABLE public.bids ADD CONSTRAINT unique_manufacturer_project_bid 
UNIQUE (project_id, manufacturer_id);

-- Enable Row Level Security
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Policy: Manufacturers can view and insert their own bids
CREATE POLICY "Manufacturers can manage their own bids" ON public.bids
FOR ALL USING (
  manufacturer_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manufacturer')
);

-- Policy: Project owners can view bids on their projects
CREATE POLICY "Project owners can view bids on their projects" ON public.bids
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = bids.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bids_project_id ON public.bids(project_id);
CREATE INDEX IF NOT EXISTS idx_bids_manufacturer_id ON public.bids(manufacturer_id);
