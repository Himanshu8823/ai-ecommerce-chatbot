# AI-Based Customer Support Chatbot for E-Commerce (OmniBot)

A complete, production-ready, and responsive full-stack E-Commerce customer service application equipped with an intelligent AI chatbot assistant.

The system handles common e-commerce customer touchpoints autonomously: **order tracking with live milestone timelines, delivery status updates, warehouse stock availability checks, 1-click order cancellations, 14-day return requests, refund settlement tracking with bank reference (ARN), payment inquiry resolution, and categorized FAQs.**

---

## 🛠️ Technologies Used

### Frontend Architecture
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/) for fast HMR and sub-second builds.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with modern utility classes and custom animations.
- **Routing**: [React Router v7](https://reactrouter.com/) for single-page multi-view navigation.
- **Icons**: [Lucide React](https://lucide.dev/) for sleek modern iconography.
- **State & Communication**: React Context API (`AuthContext`, `ChatContext`) with localStorage/sessionStorage persistence.

### Backend Architecture
- **Runtime & Server**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) (ES Modules).
- **AI / NLP Engine**: Hybrid rule-based entity extraction and natural language classifier (`backend/services/nlpEngine.js`).
  - Capable of resolving intent, extracting entity IDs (e.g. `ORD-8821`, product names), checking cancellation eligibility, computing stock levels, and rendering rich response cards.
  - Can optionally connect to external LLMs (Google Gemini / OpenAI) via environment variables.
### Database Architecture
- **Engine**: **MySQL 8.0** with InnoDB storage engine.
- **Driver**: `mysql2/promise` connection pooling with parameterized SQL queries.
- **Relational Integrity**: Complete schema with Primary Keys (`AUTO_INCREMENT`), Foreign Keys (`ON DELETE CASCADE`), Indexes, and Constraints.
- **Migration & Seeding**: Auto-initialization script [`backend/database/initDb.js`](backend/database/initDb.js) and full SQL dump [`backend/database/schema.sql`](backend/database/schema.sql).
- **Resilient Fallback**: Automatically falls back to JSON data files if MySQL credentials are not yet configured.

---

## 📂 Complete Project Structure

```
lively-noether/
├── package.json                    # Root package with concurrently launcher
├── README.md                       # Comprehensive project documentation
├── backend/                        # Node.js & Express API Backend
│   ├── data/                       # Seeded Mock Database
│   │   ├── products.json           # Catalog with stock count, specs & warehouse info
│   │   ├── orders.json             # Orders with timeline, delivery status & eligibility
│   │   ├── faqs.json               # Categorized FAQ data with keyword tags
│   │   └── users.json              # Demo user profile and addresses
│   ├── routes/                     # Express API Routers
│   │   ├── authRoutes.js           # /api/auth (login, register, profile)
│   │   ├── chatRoutes.js           # /api/chat (AI query processing)
│   │   ├── productRoutes.js        # /api/products (list, filter, stock check)
│   │   ├── orderRoutes.js          # /api/orders (tracking, cancel, return, refunds)
│   │   └── faqRoutes.js            # /api/faqs (search & categories)
│   ├── controllers/                # Business Logic Controllers
│   │   ├── authController.js       # Customer authentication & profile
│   │   ├── chatController.js       # NLP execution & response dispatcher
│   │   ├── productController.js    # Stock calculations & catalog search
│   │   ├── orderController.js      # Cancellation & return state transitions
│   │   └── faqController.js        # Knowledge base search & groupings
│   ├── services/
│   │   └── nlpEngine.js            # Intelligent AI Intent & Context Processing Engine
│   ├── server.js                   # Express application entry point (Port 5000)
│   └── package.json                # Backend dependencies (express, cors, dotenv)
└── frontend/                       # Vite + React 19 Frontend
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx      # Top navigation with responsive drawer & user pill
    │   │   │   └── Footer.jsx      # Footer with trust badges & quick links
    │   │   ├── chatbot/
    │   │   │   ├── ChatbotWidget.jsx # Global floating popup chatbot (available on every page)
    │   │   │   └── ChatMessage.jsx   # Renders text, order cards, product cards & chips
    │   │   └── tracking/
    │   │       └── TrackingTimeline.jsx # Visual stepper (Ordered -> Packed -> Shipped -> Out -> Delivered)
    │   ├── context/
    │   │   ├── AuthContext.jsx     # User authentication state & demo accounts
    │   │   └── ChatContext.jsx     # Message history, typing status & launcher triggers
    │   ├── pages/
    │   │   ├── HomePage.jsx        # 1. Home page with AI search & featured items
    │   │   ├── LoginPage.jsx       # 2. Login with 1-click demo credentials fill
    │   │   ├── RegisterPage.jsx    # 2. Account registration
    │   │   ├── DashboardPage.jsx   # 3. Customer dashboard (orders, active shipments)
    │   │   ├── ChatbotPage.jsx     # 4. Dedicated full-screen AI Support Studio
    │   │   ├── ProductsPage.jsx    # 5 & 6. Product catalog & real-time stock filters
    │   │   ├── ProductDetailPage.jsx # 5 & 6. Specifications, warehouse & zip estimator
    │   │   ├── OrderTrackingPage.jsx # 7 & 8. Order tracking & courier delivery status
    │   │   ├── ReturnsRefundsPage.jsx# 10 & 11. Cancellation, returns & refund tracker
    │   │   ├── PaymentsHelpPage.jsx  # 9. Payment queries & failed debit resolver
    │   │   └── FAQPage.jsx         # 12. Frequently Asked Questions accordion
    │   ├── services/
    │   │   └── api.js              # Fetch client wrapper for all backend endpoints
    │   ├── App.jsx                 # Application routes & layout wrapper
    │   ├── main.jsx                # React root mount
    │   └── index.css               # Tailwind CSS v4 directives
    ├── index.html                  # HTML template with meta headers
    ├── package.json                # Frontend dependencies
    └── vite.config.js              # Vite configuration with API proxy to port 5000
```

---

## 🌟 12 Core Requirements & Modules

| # | Page / Module | Implemented File | Description |
|---|---------------|------------------|-------------|
| 1 | **Home Page** | [`HomePage.jsx`](frontend/src/pages/HomePage.jsx) | Hero search bar, interactive AI query prompts, feature cards, and featured store products. |
| 2 | **Login Page** | [`LoginPage.jsx`](frontend/src/pages/LoginPage.jsx) | Modern login card with 1-click demo auto-fill (`alex@example.com` / `password123`). |
| 3 | **Registration Page** | [`RegisterPage.jsx`](frontend/src/pages/RegisterPage.jsx) | User registration with name, email, phone, and password validation. |
| 4 | **Customer Dashboard** | [`DashboardPage.jsx`](frontend/src/pages/DashboardPage.jsx) | Customer overview, active shipments, order history, refund records, and quick actions. |
| 5 | **Chatbot Page** | [`ChatbotPage.jsx`](frontend/src/pages/ChatbotPage.jsx) | Dedicated fullscreen AI Assistant studio with topic categories and transcript export. |
| 6 | **Product Page** | [`ProductsPage.jsx`](frontend/src/pages/ProductsPage.jsx), [`ProductDetailPage.jsx`](frontend/src/pages/ProductDetailPage.jsx) | Product catalog with real-time stock indicators, category filters, and zip delivery estimator. |
| 7 | **Order Tracking Page** | [`OrderTrackingPage.jsx`](frontend/src/pages/OrderTrackingPage.jsx) | Lookup by order ID with visual progress timeline: Ordered ➔ Packed ➔ Shipped ➔ In Transit ➔ Delivered. |
| 8 | **Contact Page** | [`ContactPage.jsx`](frontend/src/pages/ContactPage.jsx) | Support channels, toll-free helpline, instant ticket generator (`TCK-XXXXXX`), and AI bridge. |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Or install individually: `npm install`, `cd backend && npm install`, `cd frontend && npm install`)*

### 2. Configure & Initialize MySQL Database
1. Update your MySQL credentials in `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=ecommerce_chatbot_db
   DB_PORT=3306
   ```
2. Initialize database, tables, and test data:
   ```bash
   npm run db:init
   ```

### 3. Run Application Stack Concurrently
From the root directory:
```bash
npm run dev
```
- **Backend API**: Running at `http://localhost:5000`
- **Frontend App**: Running at `http://localhost:3000`

---

## 🧪 Pre-Configured Demo Data

### Pre-Seeded User Account
- **Email**: `alex@example.com`
- **Password**: `password123`
*(A 1-click "Auto Fill" button is also provided on the Login page)*

### Active Sample Orders to Test
- **`ORD-8821`**: Status `In Transit` via BlueDart Express (Memphis Sorting Hub). Shipped, in transit.
- **`ORD-7749`**: Status `Delivered` via FedEx. Eligible for 14-day return!
- **`ORD-9302`**: Status `Processing`. Eligible for instant cancellation!
- **`ORD-6512`**: Status `Refunded` ($194.39 settled to Visa card with ARN reference `ARN-4920194821`).

### Sample Prompts to Try with the AI Chatbot
- *"Where is my order ORD-8821?"*
- *"Can I cancel order ORD-9302?"*
- *"Is the NovaPulse wireless headphone in stock?"*
- *"How do I return order ORD-7749?"*
- *"What is the status of my refund for ORD-6512?"*
- *"My payment was debited but order didn't generate"*
- *"Connect me to a human support agent"*
