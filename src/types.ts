export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  is_active: boolean;
  image_url?: string;
}

export interface Barber {
  id: string;
  name: string;
  specialties: string[];
  bio: string;
  is_active: boolean;
  avatar_url?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  service_id: string;
  barber_id: string;
  appointment_date: string;
  appointment_time: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  barbers?: { name: string }; // Optional relation for fetching barber name
  services?: { name: string; duration: number; price: number }; // Optional relation for fetching service details
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number;
  image_url?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_bookings?: number;
  current_bookings: number;
  created_at: string;
  updated_at: string;
}

export interface DealSliderItem {
  id: string;
  title: string;
  image_url?: string;
}

export interface ProductSliderItem {
  id: string;
  name: string;
  image_url?: string;
} 