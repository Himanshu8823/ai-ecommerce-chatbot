import { query, isDbConnected } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));

export const dbRepository = {
  // 1. Customers
  async getCustomerByEmail(email) {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email]);
      return rows[0] || null;
    }
    const users = loadJson('users.json');
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // 2. Products
  async getProducts(category, search) {
    if (isDbConnected()) {
      let sql = 'SELECT * FROM products WHERE 1=1';
      const params = [];
      if (category && category !== 'All') {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (search) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      return await query(sql, params);
    }
    let products = loadJson('products.json');
    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return products;
  },

  async getProductById(id) {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM products WHERE product_code = ? OR id = ? LIMIT 1', [id, id]);
      return rows[0] || null;
    }
    const products = loadJson('products.json');
    return products.find(p => p.id === id) || null;
  },

  // 3. Orders & Tracking
  async getOrders() {
    if (isDbConnected()) {
      const orders = await query(`
        SELECT o.*, 
               p.payment_method, p.payment_status, p.payment_reference,
               d.carrier_name, d.tracking_number, d.current_location, d.estimated_delivery_date, d.timeline_milestones
        FROM orders o
        LEFT JOIN payments p ON p.order_id = o.id
        LEFT JOIN deliveries d ON d.order_id = o.id
        ORDER BY o.created_at DESC
      `);
      return orders;
    }
    return loadJson('orders.json');
  },

  async getOrderByCode(orderCode) {
    if (isDbConnected()) {
      const rows = await query(`
        SELECT o.*, 
               p.payment_method, p.payment_status, p.payment_reference,
               d.carrier_name, d.tracking_number, d.current_location, d.estimated_delivery_date, d.timeline_milestones,
               c.name AS customer_name, c.street, c.city, c.state, c.zip_code
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        LEFT JOIN payments p ON p.order_id = o.id
        LEFT JOIN deliveries d ON d.order_id = o.id
        WHERE o.order_code = ?
        LIMIT 1
      `, [orderCode.toUpperCase()]);
      return rows[0] || null;
    }
    const orders = loadJson('orders.json');
    return orders.find(o => o.id === orderCode.toUpperCase()) || null;
  },

  // 4. Save Chat History to MySQL
  async saveChatMessage(sessionId, customerId, sender, messageText, intent, payloadData) {
    if (isDbConnected()) {
      try {
        await query(
          'INSERT INTO chat_history (session_id, customer_id, sender, message_text, intent_detected, payload_data) VALUES (?, ?, ?, ?, ?, ?)',
          [sessionId, customerId || null, sender, messageText, intent || null, payloadData ? JSON.stringify(payloadData) : null]
        );
      } catch (err) {
        console.warn('[DB] Failed to log chat message:', err.message);
      }
    }
  },

  // 5. FAQs
  async getFaqs() {
    if (isDbConnected()) {
      return await query('SELECT * FROM faqs WHERE is_active = TRUE ORDER BY category ASC');
    }
    return loadJson('faqs.json');
  }
};
