-- Seed admin user (password: admin123 -- change in production)
-- bcrypt hash for "admin123"
INSERT OR IGNORE INTO app_users (id, email, password_hash, name, role)
VALUES ('admin-001', 'admin@novastore.com', '$2a$10$placeholder_hash_replace_me', 'Admin', 'admin');

-- Seed collections
INSERT OR IGNORE INTO ecom_collections (id, title, handle, description, sort_order) VALUES
  ('col-electronics', 'Electronics', 'electronics', 'Latest gadgets and electronics', 1),
  ('col-clothing', 'Clothing', 'clothing', 'Fashion and apparel', 2),
  ('col-home', 'Home & Living', 'home-living', 'Home decor and essentials', 3),
  ('col-new', 'New Arrivals', 'new-arrivals', 'Fresh new products', 0);

-- Seed sample products
INSERT OR IGNORE INTO ecom_products (id, name, handle, description, price, sku, inventory_qty, status, product_type, images, tags) VALUES
  ('prod-001', 'Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium noise-cancelling wireless headphones', 7999, 'WBH-001', 50, 'active', 'Electronics', '["https://placehold.co/600x600/1a2332/white?text=Headphones"]', '["wireless","audio","bluetooth"]'),
  ('prod-002', 'Classic Cotton T-Shirt', 'classic-cotton-tshirt', 'Comfortable everyday cotton t-shirt', 2499, 'CCT-002', 100, 'active', 'Clothing', '["https://placehold.co/600x600/1a2332/white?text=T-Shirt"]', '["cotton","casual","basics"]'),
  ('prod-003', 'Minimalist Desk Lamp', 'minimalist-desk-lamp', 'Modern LED desk lamp with adjustable brightness', 4599, 'MDL-003', 30, 'active', 'Home & Living', '["https://placehold.co/600x600/1a2332/white?text=Lamp"]', '["home","lighting","modern"]');

-- Link products to collections
INSERT OR IGNORE INTO ecom_product_collections (product_id, collection_id, position) VALUES
  ('prod-001', 'col-electronics', 1),
  ('prod-002', 'col-clothing', 1),
  ('prod-003', 'col-home', 1),
  ('prod-001', 'col-new', 1),
  ('prod-002', 'col-new', 2),
  ('prod-003', 'col-new', 3);
