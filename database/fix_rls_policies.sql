-- FIX ROW LEVEL SECURITY POLICIES
-- Run this in Supabase SQL Editor to fix RLS blocking issues

-- 1. Check current RLS status
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('appointments', 'orders', 'products', 'barbers', 'services');

-- 2. OPTION A: Disable RLS temporarily for testing (QUICK FIX)
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE barbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- 3. OPTION B: Create proper RLS policies (SECURE APPROACH)
-- Uncomment these if you want to keep RLS enabled with proper policies

-- Enable RLS on tables
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies for appointments (users can manage their own appointments)
-- CREATE POLICY "Users can insert their own appointments" ON appointments
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can view their own appointments" ON appointments
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own appointments" ON appointments
--   FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for orders (users can manage their own orders)
-- CREATE POLICY "Users can insert their own orders" ON orders
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can view their own orders" ON orders
--   FOR SELECT USING (auth.uid() = user_id);

-- Create policies for public data (everyone can read)
-- CREATE POLICY "Anyone can view products" ON products
--   FOR SELECT USING (true);

-- CREATE POLICY "Anyone can view barbers" ON barbers
--   FOR SELECT USING (true);

-- CREATE POLICY "Anyone can view services" ON services
--   FOR SELECT USING (true);

-- 4. Grant necessary permissions
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON barbers TO authenticated;
GRANT SELECT ON services TO authenticated;