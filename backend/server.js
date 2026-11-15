import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import { testDbConnection, isDbConnected } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/faqs', faqRoutes);

// Health check with MySQL status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AI E-Commerce Customer Support API',
    version: '1.0.0',
    database: {
      type: 'MySQL',
      connected: isDbConnected(),
      database_name: process.env.DB_NAME || 'ecommerce_chatbot_db'
    },
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 E-Commerce Chatbot Backend Server running at http://localhost:${PORT}`);
  // Test MySQL connection at startup
  await testDbConnection();
});
