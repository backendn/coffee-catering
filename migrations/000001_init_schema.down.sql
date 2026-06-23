-- Drop everything in reverse dependency order
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS catering_details;
DROP TABLE IF EXISTS catering_packages;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP SEQUENCE IF EXISTS order_number_seq;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS admin_users;
DROP FUNCTION IF EXISTS set_updated_at();
DROP EXTENSION IF EXISTS "pgcrypto";