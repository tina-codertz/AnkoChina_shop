-- Seed admin user (password: admin123)
INSERT OR IGNORE INTO app_users (id, email, password_hash, name, role)
VALUES ('admin-001', 'admin@ankochina.com', 'pbkdf2:100000:ecb99df4190d478ba668227fea5101a6:a86eae0a6edfb46fbd0f3a6fb7e79937c8d58147ccbe7b229db794ac035bbaeaf33a20e48230c649192e7caccda8299f83d4ed2c2cc2f23519c20e0ec22bd9f3', 'Admin', 'admin');

-- Seed collections
INSERT OR IGNORE INTO ecom_collections (id, title, handle, description, sort_order) VALUES
  ('col-electronics', 'Electronics', 'electronics', 'Vifaa vya elektroniki', 1),
  ('col-clothing', 'Clothing', 'clothing', 'Nguo na mitindo', 2),
  ('col-home', 'Home & Living', 'home-living', 'Vifaa vya nyumbani', 3),
  ('col-new', 'New Arrivals', 'new-arrivals', 'Bidhaa mpya', 0);

-- Seed sample products
INSERT OR IGNORE INTO ecom_products (id, name, handle, description, price, sku, inventory_qty, status, product_type, images, tags) VALUES
  ('prod-001', 'Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Headphones za wireless zenye ubora wa hali ya juu', 7999, 'WBH-001', 50, 'active', 'Electronics', '["https://placehold.co/600x600/1a2332/white?text=Headphones"]', '["wireless","audio","bluetooth"]'),
  ('prod-002', 'Classic Cotton T-Shirt', 'classic-cotton-tshirt', 'T-shirt ya cotton yenye starehe', 2499, 'CCT-002', 100, 'active', 'Clothing', '["https://placehold.co/600x600/1a2332/white?text=T-Shirt"]', '["cotton","casual","basics"]'),
  ('prod-003', 'Minimalist Desk Lamp', 'minimalist-desk-lamp', 'Taa ya meza ya kisasa yenye mwanga unaobadilika', 4599, 'MDL-003', 30, 'active', 'Home & Living', '["https://placehold.co/600x600/1a2332/white?text=Lamp"]', '["home","lighting","modern"]');

-- Link products to collections
INSERT OR IGNORE INTO ecom_product_collections (product_id, collection_id, position) VALUES
  ('prod-001', 'col-electronics', 1),
  ('prod-002', 'col-clothing', 1),
  ('prod-003', 'col-home', 1),
  ('prod-001', 'col-new', 1),
  ('prod-002', 'col-new', 2),
  ('prod-003', 'col-new', 3);
