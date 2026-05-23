export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_ACCOUNT_ID: string;
  FRONTEND_URL: string;
}

export interface AppUser {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  inventory_qty: number;
  status: 'active' | 'draft' | 'archived';
  product_type: string | null;
  images: string;
  tags: string;
  has_variants: number;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  user_id: string | null;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: string | null;
  stripe_payment_intent_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_title: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}
