-- QUICK RLS FIX - Disable Row Level Security for testing
-- Run this in Supabase SQL Editor

-- Disable RLS on all tables to allow app to work
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE barbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON barbers TO authenticated;
GRANT SELECT ON services TO authenticated;