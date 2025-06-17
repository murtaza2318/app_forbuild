# 🗄️ Database Setup Guide

## 🚨 **URGENT: Fix Database Schema Issues**

Your app is showing multiple errors due to database schema mismatches. Follow these steps to fix all issues:

## 📋 **Step 1: Run Complete SQL Fixes in Supabase**

1. **Go to your Supabase Dashboard**
2. **Click on "SQL Editor"**
3. **Copy and paste this COMPLETE SQL code:**

```sql
-- Fix Database Schema Issues - COMPLETE FIX
-- Add missing columns and fix schema mismatches

-- 1. Add missing is_active column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add missing is_active column to barbers table  
ALTER TABLE barbers 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Fix appointments table - ensure total_amount column exists
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;

-- 4. Fix orders table - ensure user_id column exists (not customer_id)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 5. Update all existing records
UPDATE products SET is_active = true WHERE is_active IS NULL;
UPDATE barbers SET is_active = true WHERE is_active IS NULL;
UPDATE appointments SET total_amount = 0 WHERE total_amount IS NULL;

-- 6. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_barbers_is_active ON barbers(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 7. Fix foreign key relationships for appointments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'customer_id') THEN
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
        UPDATE appointments SET user_id = customer_id WHERE user_id IS NULL AND customer_id IS NOT NULL;
    END IF;
END $$;

-- 8. Fix foreign key relationships for orders
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
        UPDATE orders SET user_id = customer_id WHERE user_id IS NULL AND customer_id IS NOT NULL;
    END IF;
END $$;
```

4. **Click "Run" to execute the SQL**

## 🔍 **Step 2: Verify Your Database Structure**

Run these queries to check if you have the required tables:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'barbers', 'services', 'appointments', 'orders', 'profiles');

-- Check products table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products';

-- Check barbers table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'barbers';
```

## 📊 **Step 3: Add Sample Data (If Tables Are Empty)**

If your tables are empty, add some sample data:

```sql
-- Sample Services
INSERT INTO services (name, description, price, duration, is_active) VALUES
('Haircut', 'Professional haircut and styling', 25.00, 30, true),
('Beard Trim', 'Beard trimming and shaping', 15.00, 15, true),
('Hair Wash', 'Shampoo and conditioning', 10.00, 15, true),
('Full Service', 'Haircut, beard trim, and wash', 45.00, 60, true),
('Styling', 'Hair styling with products', 20.00, 20, true),
('Mustache Trim', 'Precision mustache trimming', 8.00, 10, true)
ON CONFLICT DO NOTHING;

-- Sample Barbers
INSERT INTO barbers (name, email, phone, specialties, is_active) VALUES
('John Smith', 'john@barbershop.com', '+1234567890', 'Haircuts, Beard Styling', true),
('Mike Johnson', 'mike@barbershop.com', '+1234567891', 'Classic Cuts, Shaves', true),
('David Brown', 'david@barbershop.com', '+1234567892', 'Modern Styles, Coloring', true)
ON CONFLICT DO NOTHING;

-- Sample Products
INSERT INTO products (name, description, price, category, image_url, is_active) VALUES
('Premium Hair Gel', 'Strong hold styling gel', 15.99, 'Hair Care', 'https://via.placeholder.com/200', true),
('Beard Oil', 'Nourishing beard conditioning oil', 12.99, 'Beard Care', 'https://via.placeholder.com/200', true),
('Hair Pomade', 'Classic styling pomade', 18.99, 'Styling', 'https://via.placeholder.com/200', true),
('Shampoo', 'Professional grade shampoo', 22.99, 'Hair Care', 'https://via.placeholder.com/200', true),
('Hair Wax', 'Flexible hold styling wax', 16.99, 'Styling', 'https://via.placeholder.com/200', true)
ON CONFLICT DO NOTHING;
```

## 🔧 **Step 4: Test the App**

After running the SQL fixes:

1. **Restart your React Native app**
2. **Navigate to Book screen** - Should show services and barbers
3. **Navigate to Shop screen** - Should show products
4. **Try admin features** - Should navigate to actual screens

## ✅ **Expected Results**

After fixing the database:

- ✅ **Book Screen**: Shows services and barbers, booking works without errors
- ✅ **Shop Screen**: Shows products, checkout works successfully
- ✅ **Admin Features**: Navigate to actual management screens
- ✅ **No Console Errors**: All database queries work properly
- ✅ **Appointments**: Can be booked with proper total_amount
- ✅ **Orders**: Can be placed with correct user_id references

## 🚨 **If You Still Have Issues**

1. **Check Supabase Connection**: Verify your API keys in `supabase.ts`
2. **Check RLS Policies**: Make sure Row Level Security allows reading data
3. **Check Console Logs**: Look for specific error messages
4. **Verify Table Names**: Make sure table names match exactly

## 📱 **Admin Features Now Work**

After the fixes, admin users can:

- ✅ **View Appointments**: See all customer appointments
- ✅ **Manage Products**: Navigate to shop for product management
- ✅ **Manage Services**: Full CRUD operations for services
- ✅ **View Orders**: See customer order history

## 🔄 **Next Steps**

1. Run the SQL fixes above
2. Restart your app
3. Test all screens
4. Report any remaining issues

The app should now work perfectly! 🎉