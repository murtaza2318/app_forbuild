-- STEP-BY-STEP DATABASE FIX
-- Run these commands ONE BY ONE in Supabase SQL Editor

-- STEP 1: Fix products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- STEP 2: Fix barbers table  
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE barbers SET is_active = true WHERE is_active IS NULL;

-- STEP 3: Fix appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;
UPDATE appointments SET total_amount = 0 WHERE total_amount IS NULL;

-- STEP 4: Check if orders table has user_id column
-- Run this first to see what columns exist:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';

-- STEP 5: Add user_id to orders table (only if it doesn't exist)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID;

-- STEP 6: Add foreign key constraint to user_id (run separately)
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- STEP 7: If you have customer_id column, copy data to user_id
-- UPDATE orders SET user_id = customer_id WHERE user_id IS NULL AND customer_id IS NOT NULL;

-- STEP 8: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_barbers_is_active ON barbers(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);