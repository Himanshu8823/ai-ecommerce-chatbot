-- ============================================================
-- E-Commerce AI Customer Support Chatbot - MySQL Database Schema
-- Database: ecommerce_chatbot_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce_chatbot_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ecommerce_chatbot_db;

-- ------------------------------------------------------------
-- 1. Customers Table
-- ------------------------------------------------------------
DROP TABLE IF EXISTS chat_history;
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS returns;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. Products Table
-- ------------------------------------------------------------
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 4.80,
    review_count INT DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock',
    image_url TEXT,
    description TEXT,
    specifications JSON,
    warehouse_location VARCHAR(150),
    delivery_estimate VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_prod_category (category),
    INDEX idx_prod_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. Orders Table
-- ------------------------------------------------------------
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    status ENUM('Processing', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded', 'Return Initiated') DEFAULT 'Processing',
    delivery_status VARCHAR(100) DEFAULT 'Preparing for Dispatch',
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_fee DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    can_cancel BOOLEAN DEFAULT TRUE,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_order_code (order_code),
    INDEX idx_order_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3b. Order Items Table
-- ------------------------------------------------------------
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. Payments Table
-- ------------------------------------------------------------
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded', 'Refund Initiated') DEFAULT 'Paid',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payment_ref (payment_reference)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. Deliveries Table
-- ------------------------------------------------------------
CREATE TABLE deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_code VARCHAR(50) UNIQUE NOT NULL,
    order_id INT NOT NULL UNIQUE,
    carrier_name VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    delivery_status VARCHAR(100) DEFAULT 'In Transit',
    current_location VARCHAR(255),
    courier_phone VARCHAR(50),
    estimated_delivery_date DATE,
    actual_delivery_date TIMESTAMP NULL,
    timeline_milestones JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_deliveries_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_delivery_tracking (tracking_number)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. Returns Table
-- ------------------------------------------------------------
CREATE TABLE returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_code VARCHAR(50) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    customer_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    comments TEXT,
    return_status ENUM('Requested', 'Approved', 'Pickup Scheduled', 'Picked Up', 'Inspected', 'Completed', 'Rejected') DEFAULT 'Requested',
    pickup_date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_returns_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_returns_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_return_code (return_code)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. Refunds Table
-- ------------------------------------------------------------
CREATE TABLE refunds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refund_code VARCHAR(50) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    return_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    refund_status ENUM('Initiated', 'Processing', 'Completed', 'Failed') DEFAULT 'Completed',
    acquirer_reference_number VARCHAR(100) NOT NULL,
    refund_destination VARCHAR(150) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_refunds_return FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE SET NULL,
    INDEX idx_refund_arn (acquirer_reference_number)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. FAQs Table
-- ------------------------------------------------------------
CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    keywords JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_faq_category (category)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. Chat History Table
-- ------------------------------------------------------------
CREATE TABLE chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    customer_id INT NULL,
    sender ENUM('user', 'bot', 'agent') NOT NULL,
    message_text TEXT NOT NULL,
    intent_detected VARCHAR(100),
    payload_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_chat_session (session_id)
) ENGINE=InnoDB;

-- ============================================================
-- SAMPLE DATA INSERTION (FOR TESTING PURPOSES)
-- ============================================================

-- 1. Insert Sample Customers
INSERT INTO customers (id, customer_code, name, email, password_hash, phone, avatar_url, street, city, state, zip_code, country) VALUES
(1, 'CUST-001', 'Alex Morgan', 'alex@example.com', 'password123', '+1 (555) 234-5678', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', '742 Evergreen Terrace, Suite 4B', 'Austin', 'TX', '78701', 'United States'),
(2, 'CUST-002', 'Jordan Lee', 'jordan@example.com', 'password123', '+1 (555) 345-6789', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', '500 Market St', 'San Francisco', 'CA', '94105', 'United States');

-- 2. Insert Sample Products
INSERT INTO products (id, product_code, name, category, sku, price, original_price, rating, review_count, stock_quantity, status, image_url, description, specifications, warehouse_location, delivery_estimate) VALUES
(1, 'PROD-101', 'NovaPulse Pro Wireless Noise-Cancelling Headphones', 'Audio & Electronics', 'NP-NC-01', 149.99, 199.99, 4.80, 342, 14, 'In Stock', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 'Premium active noise cancellation with 40-hour battery life, spatial audio, and memory foam earcups.', '{"Battery Life": "40 Hours", "Bluetooth": "Version 5.3", "Weight": "250g", "Warranty": "1 Year"}', 'Dallas Hub, TX', '2-3 business days'),
(2, 'PROD-102', 'Aura Ultra Smartwatch Series 6 (OLED)', 'Wearables', 'AU-SW-06', 229.00, 279.00, 4.70, 512, 5, 'Low Stock', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', 'Always-on sapphire crystal display, ECG, blood oxygen tracking, GPS navigation, and 50m water resistance.', '{"Display": "1.92-inch AMOLED", "Battery": "Up to 3 days", "Water Resistance": "5ATM / 50m", "Warranty": "2 Years"}', 'Chicago Distribution Center, IL', '1-2 business days'),
(3, 'PROD-103', 'Zenith Slim 14 Ultra-Thin Laptop', 'Computers', 'ZN-NB-14', 899.99, 1049.99, 4.90, 189, 8, 'In Stock', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80', 'Intel Core i7 13th Gen, 16GB LPDDR5 RAM, 1TB NVMe SSD, 2.8K 90Hz OLED screen in aerospace aluminum.', '{"Processor": "Intel Core i7-1360P", "RAM": "16GB LPDDR5", "Storage": "1TB SSD", "Warranty": "2 Years"}', 'Atlanta Hub, GA', '2-4 business days'),
(4, 'PROD-104', 'Vortex Flow Ergonomic Mechanical Keyboard', 'Peripherals', 'VX-KB-87', 89.50, 119.00, 4.60, 275, 0, 'Out of Stock', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', 'Hot-swappable custom linear red switches, sound-dampening silicone gasket mount, per-key RGB lighting.', '{"Switches": "Pre-lubed Red Linear", "Connectivity": "Tri-Mode Wireless", "Warranty": "1 Year"}', 'Expected restock in 4 days', 'Restocking soon'),
(5, 'PROD-105', 'Apex SoundBar 300W with Wireless Subwoofer', 'Home Audio', 'AP-SB-300', 179.99, 220.00, 4.50, 160, 19, 'In Stock', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80', 'Immersive 3.1 channel Dolby Audio soundbar with wireless deep-bass subwoofer and eARC HDMI connection.', '{"Total Power": "300W Peak", "Channels": "3.1 Dolby", "Warranty": "1 Year"}', 'New Jersey Port Facility, NJ', '2-3 business days'),
(6, 'PROD-106', 'HyperCharge 65W GaN Dual USB-C Fast Charger', 'Accessories', 'HC-GAN-65', 34.99, 45.00, 4.90, 890, 42, 'In Stock', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', 'Gallium Nitride high-speed dual port adapter capable of powering laptops, tablets, and phones.', '{"Power": "65W Max", "Ports": "2x USB-C + 1x USB-A", "Warranty": "18 Months"}', 'Dallas Hub, TX', '1-2 business days');

-- 3. Insert Sample Orders
INSERT INTO orders (id, order_code, customer_id, status, delivery_status, total_amount, tax_amount, shipping_fee, discount_amount, can_cancel, cancellation_reason, created_at) VALUES
(1, 'ORD-8821', 1, 'In Transit', 'On Schedule', 161.99, 12.00, 0.00, 0.00, FALSE, 'Order has already been shipped with tracking number BLD-998822104. Returns can be initiated once delivered.', '2026-11-04 10:15:00'),
(2, 'ORD-7749', 1, 'Delivered', 'Delivered Successfully', 232.32, 18.32, 0.00, 15.00, FALSE, 'Order has already been delivered.', '2026-11-01 14:30:00'),
(3, 'ORD-9302', 1, 'Processing', 'Preparing for Dispatch', 75.58, 5.60, 0.00, 0.00, TRUE, NULL, '2026-11-06 18:00:00'),
(4, 'ORD-6512', 1, 'Refunded', 'Returned & Refund Credited', 194.39, 14.40, 0.00, 0.00, FALSE, 'Order already refunded.', '2026-10-25 11:00:00');

-- 4. Insert Order Items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 149.99), -- ORD-8821: NovaPulse Headphones
(2, 2, 2, 1, 229.00), -- ORD-7749: Aura Smartwatch
(3, 3, 6, 2, 34.99),  -- ORD-9302: 2x HyperCharge Chargers
(4, 4, 5, 1, 179.99); -- ORD-6512: Apex SoundBar

-- 5. Insert Payments
INSERT INTO payments (id, payment_reference, order_id, payment_method, amount, currency, payment_status, paid_at) VALUES
(1, 'TXN-90218821', 1, 'Credit Card (Visa ending 4242)', 161.99, 'USD', 'Paid', '2026-11-04 10:15:30'),
(2, 'TXN-88127749', 2, 'Apple Pay / MasterCard', 232.32, 'USD', 'Paid', '2026-11-01 14:31:00'),
(3, 'TXN-PP-930211', 3, 'PayPal (alex.morgan@example.com)', 75.58, 'USD', 'Paid', '2026-11-06 18:01:10'),
(4, 'TXN-REF-6512', 4, 'Credit Card (Visa ending 4242)', 194.39, 'USD', 'Refunded', '2026-10-25 11:02:00');

-- 6. Insert Deliveries
INSERT INTO deliveries (id, delivery_code, order_id, carrier_name, tracking_number, delivery_status, current_location, courier_phone, estimated_delivery_date, actual_delivery_date, timeline_milestones) VALUES
(1, 'DEL-882101', 1, 'BlueDart Express', 'BLD-998822104', 'In Transit', 'Memphis Sorting Facility, Hub 4', '+1 (800) 463-3339', '2026-11-08', NULL, 
 '[{"status": "Order Placed", "timestamp": "Nov 04, 2026 - 10:15 AM", "completed": true}, {"status": "Packed", "timestamp": "Nov 04, 2026 - 03:45 PM", "completed": true}, {"status": "Shipped", "timestamp": "Nov 05, 2026 - 09:20 AM", "completed": true}, {"status": "In Transit", "timestamp": "Nov 06, 2026 - 06:10 PM", "completed": true}, {"status": "Out for Delivery", "timestamp": "Pending - Nov 08", "completed": false}, {"status": "Delivered", "timestamp": "Pending", "completed": false}]'),
(2, 'DEL-774901', 2, 'FedEx Priority', 'FDX-774900122', 'Delivered', 'Delivered at Front Porch (Signed by: A. Morgan)', '+1 (800) 463-3339', '2026-11-03', '2026-11-03 14:15:00',
 '[{"status": "Order Placed", "timestamp": "Nov 01, 2026", "completed": true}, {"status": "Packed", "timestamp": "Nov 01, 2026", "completed": true}, {"status": "Shipped", "timestamp": "Nov 02, 2026", "completed": true}, {"status": "Out for Delivery", "timestamp": "Nov 03, 2026", "completed": true}, {"status": "Delivered", "timestamp": "Nov 03, 2026 - 02:15 PM", "completed": true}]'),
(3, 'DEL-930201', 3, 'DHL Express', 'DHL-930211099', 'Preparing for Dispatch', 'Atlanta Fulfillment Warehouse, Bay 12', '+1 (800) 225-5345', '2026-11-10', NULL,
 '[{"status": "Order Placed", "timestamp": "Nov 06, 2026 - 06:00 PM", "completed": true}, {"status": "Processing", "timestamp": "Nov 06, 2026 - 07:15 PM", "completed": true}, {"status": "Shipped", "timestamp": "Expected Nov 07", "completed": false}]');

-- 7. Insert Returns
INSERT INTO returns (id, return_code, order_id, customer_id, reason, comments, return_status, pickup_date, created_at) VALUES
(1, 'RET-6512-R1', 4, 1, 'Product sound profile did not match customer room size', 'SoundBar returned in mint packaging with all cables', 'Completed', 'Oct 28, 2026', '2026-10-27 10:00:00');

-- 8. Insert Refunds
INSERT INTO refunds (id, refund_code, order_id, return_id, amount, refund_status, acquirer_reference_number, refund_destination, processed_at) VALUES
(1, 'RFND-6512-01', 4, 1, 194.39, 'Completed', 'ARN-4920194821', 'Original Visa Card ending in 4242', '2026-11-01 16:00:00');

-- 9. Insert FAQs
INSERT INTO faqs (id, category, question, answer, keywords) VALUES
(1, 'Order Tracking & Delivery', 'How do I track my order in real-time?', 'You can track your package directly by visiting the Track Order page or by asking our AI Chatbot Where is my order?. Simply provide your Order ID (e.g., ORD-8821).', '["track", "order", "status", "delivery", "courier"]'),
(2, 'Cancellations & Returns', 'Can I cancel my order after it has been placed?', 'Yes! You can cancel any order free of charge as long as its status is Processing or Confirmed before it ships.', '["cancel", "cancellation", "stop order"]'),
(3, 'Cancellations & Returns', 'What is your return policy and time window?', 'We offer a 14-day hassle-free return window starting from the day your package is marked as Delivered. Free doorstep pickup is included.', '["return", "return policy", "14 days", "exchange"]'),
(4, 'Refunds', 'How long does it take to receive my refund?', 'Once the returned item is inspected, refunds are immediately initiated. Credit/Debit card refunds reflect in 3-5 business days; UPI and PayPal reflect within 24 hours.', '["refund", "money back", "refund time", "arn"]'),
(5, 'Payments', 'What payment methods are supported?', 'We accept all major Credit/Debit Cards (Visa, MasterCard, Amex), PayPal, Apple Pay, Google Pay, UPI, Net Banking, and Cash On Delivery (COD).', '["payment", "methods", "credit card", "upi", "cod"]');

-- 10. Insert Sample Chat History
INSERT INTO chat_history (id, session_id, customer_id, sender, message_text, intent_detected, payload_data) VALUES
(1, 'sample-session-01', 1, 'user', 'Where is my order ORD-8821?', 'order_tracking', '{"order_id": "ORD-8821"}'),
(2, 'sample-session-01', 1, 'bot', 'Here are the latest tracking details for ORD-8821: Status is In Transit with BlueDart Express. Estimated delivery: 2026-11-08.', 'order_tracking', '{"status": "In Transit"}');
