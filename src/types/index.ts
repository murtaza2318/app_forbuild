export interface Appointment {
  id: string;
  customer_id: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  barbers?: { name: string } | null;
  services?: { name: string; duration: number; price: number } | null;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  is_active: boolean;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  image_url?: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: Product;
}