-- FIX ORDER_ITEMS TABLE SCHEMA
-- Run this in Supabase SQL Editor

-- 1. Add missing price column to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;

-- 2. Add other potentially missing columns
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- 3. Add foreign key constraints (optional, run separately if needed)
-- ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product_id FOREIGN KEY (product_id) REFERENCES products(id);
-- ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. Grant permissions
GRANT ALL ON order_items TO authenticated;

-- 6. Verify the schema (uncomment to check)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'order_items';