-- Add expected_delivery_date field to projects table
ALTER TABLE public.projects 
ADD COLUMN expected_delivery_date date;