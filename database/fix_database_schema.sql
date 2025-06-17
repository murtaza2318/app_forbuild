-- Fix Database Schema Issues
-- Run these commands in your Supabase SQL Editor

-- 1. Add missing is_active column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add missing is_active column to barbers table  
ALTER TABLE barbers 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Fix appointments table - ensure total_amount column exists and is nullable
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;

-- 4. Fix orders table - ensure user_id column exists (not customer_id)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 5. Update all existing records to be active
UPDATE products SET is_active = true WHERE is_active IS NULL;
UPDATE barbers SET is_active = true WHERE is_active IS NULL;
UPDATE appointments SET total_amount = 0 WHERE total_amount IS NULL;

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_barbers_is_active ON barbers(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 7. Ensure proper foreign key relationships
-- Update appointments table to use user_id if it's using customer_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'customer_id') THEN
        -- Add user_id column if it doesn't exist
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
        
        -- Copy data from customer_id to user_id if user_id is empty
        UPDATE appointments SET user_id = customer_id WHERE user_id IS NULL AND customer_id IS NOT NULL;
    END IF;
END $$;

-- 8. Ensure orders table uses user_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
        -- Copy data from customer_id to user_id if user_id is empty
        UPDATE orders SET user_id = customer_id WHERE user_id IS NULL AND customer_id IS NOT NULL;
    END IF;
END $$;

-- 9. Verify the schema (run these to check)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'is_active';

-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'barbers' AND column_name = 'is_active';

-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'appointments' AND column_name = 'total_amount';

-- 10. Check if data exists
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT COUNT(*) as total_barbers FROM barbers;
-- SELECT COUNT(*) as total_services FROM services;
-- SELECT COUNT(*) as total_appointments FROM appointments;
-- SELECT COUNT(*) as total_orders FROM orders;