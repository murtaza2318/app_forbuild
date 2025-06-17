-- COMPLETE ORDER SYSTEM FIX
-- Run this in Supabase SQL Editor

-- 1. Ensure order_items table has all required columns
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- 2. Optional: Add price column if you want to store historical prices
-- ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;

-- 3. Disable RLS on order_items table
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions
GRANT ALL ON order_items TO authenticated;

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 6. Verify the schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;