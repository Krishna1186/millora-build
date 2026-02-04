
-- Add delivery address fields to profiles table for customers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS landmark TEXT;

-- Add expected delivery date to bids table
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;

-- Create a delivery_addresses table for multiple saved addresses
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on delivery_addresses
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own delivery addresses
CREATE POLICY "Users can manage their own delivery addresses" ON public.delivery_addresses
FOR ALL USING (user_id = auth.uid());

-- Create orders table to track accepted bids
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES public.bids(bid_id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delivery_address_id UUID REFERENCES public.delivery_addresses(id),
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own orders
CREATE POLICY "Customers can view their own orders" ON public.orders
FOR SELECT USING (customer_id = auth.uid());

-- Policy: Manufacturers can view orders for their bids
CREATE POLICY "Manufacturers can view their orders" ON public.orders
FOR SELECT USING (manufacturer_id = auth.uid());

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES public.bids(bid_id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Project participants can view chat messages
CREATE POLICY "Project participants can view chat messages" ON public.chat_messages
FOR SELECT USING (
  sender_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.bids b 
    WHERE b.bid_id = chat_messages.bid_id AND b.manufacturer_id = auth.uid()
  )
);

-- Policy: Project participants can insert chat messages
CREATE POLICY "Project participants can insert chat messages" ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.bids b 
      WHERE b.bid_id = chat_messages.bid_id AND b.manufacturer_id = auth.uid()
    )
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_id ON public.delivery_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_manufacturer_id ON public.orders(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_bid_id ON public.chat_messages(bid_id);
