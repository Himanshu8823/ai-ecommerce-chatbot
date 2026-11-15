import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Package,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { api } from '../services/api';

export default function HomePage() {
  const { triggerChatWithPrompt } = useChat();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [heroPrompt, setHeroPrompt] = useState('');

  useEffect(() => {
    api.getProducts().then(res => {
      if (res.success) {
        setFeaturedProducts(res.products.slice(0, 3));
      }
    }).catch(console.error);
  }, []);

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!heroPrompt.trim()) return;
    triggerChatWithPrompt(heroPrompt);
    setHeroPrompt('');
  };

  const sampleQuestions = [
    'Where is order ORD-8821?',
    'Is NovaPulse headphones in stock?',
    'How do I cancel my order?',
    'What is your refund timeframe?'
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Next-Generation Intelligent E-Commerce Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Instant Answers for Every <br />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
                Order, Delivery & Product
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Track packages in real-time, inspect live warehouse inventory, manage cancellations & returns, and resolve payment queries within seconds.
            </p>

            {/* Interactive Search / AI prompt bar */}
            <form onSubmit={handleHeroSubmit} className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20 transition">
                <Search className="w-5 h-5 text-slate-400 ml-3" />
                <input
                  type="text"
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  placeholder="Ask anything: 'Track ORD-8821' or 'Stock of smartwatch'..."
                  className="w-full bg-transparent border-none text-white placeholder-slate-400 text-sm sm:text-base px-3 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm flex items-center space-x-2 shrink-0 transition shadow-md cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask Bot</span>
                </button>
              </div>

              {/* Sample queries chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                <span className="text-slate-400">Popular:</span>
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => triggerChatWithPrompt(q)}
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Comprehensive Customer Support Capabilities
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Built from the ground up to solve common shopper needs autonomously and accurately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Order Tracking */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Live Order Tracking</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Step-by-step milestones (Packed, Shipped, In Transit, Out for Delivery) with courier contact and real-time location.
            </p>
            <Link to="/tracking" className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              <span>Try Order Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Product Availability */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Stock Availability & Specs</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Real-time warehouse inventory indicators, pincode-based delivery date calculators, and complete technical specifications.
            </p>
            <Link to="/products" className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800">
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Cancellations & Returns */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Cancellations & Returns</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Instant one-click cancellation before dispatch and 14-day hassle-free return booking with free doorstep courier pickup.
            </p>
            <Link to="/returns" className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-800">
              <span>Manage Returns</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Refund Information */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Refund Information</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Transparent tracking of credit transfers with ARN bank reference numbers and expected settlement date notifications.
            </p>
            <Link to="/returns" className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-600 hover:text-purple-800">
              <span>View Refund Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 5: Payment Queries */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Payment Queries & Invoices</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Guidance for card, wallet, and UPI transactions, failed debit reversals, EMI plans, and tax invoice generation.
            </p>
            <Link to="/payments" className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
              <span>Payment Help</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6: AI Chatbot Assistant */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Full AI Studio</h3>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed mb-4">
              Dedicated full-screen conversation console with audio capabilities, rich cards, history export, and human handoff.
            </p>
            <Link to="/chatbot" className="inline-flex items-center space-x-1 text-xs font-semibold text-white underline underline-offset-4 hover:text-indigo-200">
              <span>Open AI Assistant Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Store Products</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Ask our AI chatbot about live stock, warranty, or delivery timelines for any item below.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs ${
                    prod.stock > 0
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {prod.status}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                    {prod.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-900">${prod.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 line-through ml-2">${prod.originalPrice.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => triggerChatWithPrompt(`Check stock and specs for ${prod.name}`)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-8 sm:p-12 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Need Help With an Existing Order?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              OmniBot is configured with active test data for your convenience. Try asking:
              <br className="hidden sm:block" />
              <strong className="text-indigo-600 font-semibold">"Where is order ORD-8821?"</strong> or
              <strong className="text-indigo-600 font-semibold"> "Cancel order ORD-9302"</strong>
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                to="/tracking"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-xs transition"
              >
                Track An Order
              </Link>
              <Link
                to="/faq"
                className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium text-sm hover:bg-slate-50 transition"
              >
                Browse FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
