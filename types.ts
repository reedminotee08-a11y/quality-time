export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  images: string[];
  stock_quantity: number;
  specs: Record<string, string>; // e.g., { movement: "Automatic", water_resistance: "100m" }
  created_at?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  email?: string;
  phone: string;
  wilaya: string;
  municipality: string;
  shipping_address?: string;
  delivery_method: 'stop_desk' | 'home_delivery';
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}