
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  old_price?: number;
  description: string;
  images: string[];
  stock_quantity: number;
  category: string;
  specs: Record<string, any>;
  created_at: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  email?: string;
  phone?: string;
  wilaya?: string;
  municipality?: string;
  shipping_address?: string;
  delivery_method?: string;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  created_at: string;
  address?: string;
  payment_method?: string;
  shipping_cost?: number;
  tax?: number;
  updated_at?: string;
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

export interface CartItem extends Product {
  quantity: number;
  addedAt?: string;
}

export interface UserSession {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}
