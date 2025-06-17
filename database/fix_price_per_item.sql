-- FIX PRICE_PER_ITEM COLUMN ISSUE
-- Run this in Supabase SQL Editor

-- Option 1: Make price_per_item nullable (if it exists)
ALTER TABLE order_items ALTER COLUMN price_per_item DROP NOT NULL;

-- Option 2: Add price_per_item column if it doesn't exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_per_item DECIMAL(10,2) DEFAULT 0;

-- Option 3: Set default value for existing records
UPDATE order_items SET price_per_item = 0 WHERE price_per_item IS NULL;

-- Ensure other required columns exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Disable RLS and grant permissions
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
GRANT ALL ON order_items TO authenticated;

-- Check the current schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;