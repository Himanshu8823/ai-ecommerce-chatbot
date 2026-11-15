import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ChatbotWidget from './components/chatbot/ChatbotWidget';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChatbotPage from './pages/ChatbotPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ReturnsRefundsPage from './pages/ReturnsRefundsPage';
import PaymentsHelpPage from './pages/PaymentsHelpPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';

function AppContent() {
  const location = useLocation();
  const isChatbotStudio = location.pathname === '/chatbot';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/tracking" element={<OrderTrackingPage />} />
          <Route path="/returns" element={<ReturnsRefundsPage />} />
          <Route path="/payments" element={<PaymentsHelpPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
      {/* Show floating widget unless user is already on the dedicated full-screen chatbot studio */}
      {!isChatbotStudio && <ChatbotWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <AppContent />
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}
