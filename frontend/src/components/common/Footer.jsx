import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ShieldCheck, Clock, Truck, Headphones, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value props banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">24/7 AI Assistance</h4>
              <p className="text-xs text-slate-400">Instant answers under 1 second</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Live Order Tracking</h4>
              <p className="text-xs text-slate-400">Real-time carrier milestones</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">14-Day Free Returns</h4>
              <p className="text-xs text-slate-400">Zero hassle doorstep pickup</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Human Escalation</h4>
              <p className="text-xs text-slate-400">Seamless handoff to care team</p>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div>
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Self-Service</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/tracking" className="hover:text-white transition">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-white transition">Cancel an Order</Link></li>
              <li><Link to="/returns" className="hover:text-white transition">Initiate Return</Link></li>
              <li><Link to="/returns" className="hover:text-white transition">Refund Status</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Shop & Explore</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link to="/products?category=Audio" className="hover:text-white transition">Audio & Electronics</Link></li>
              <li><Link to="/products?category=Wearables" className="hover:text-white transition">Smartwatches</Link></li>
              <li><Link to="/products?category=Computers" className="hover:text-white transition">Laptops & Hardware</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Support Center</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/contact" className="hover:text-white transition">Contact Support</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">Help & FAQs</Link></li>
              <li><Link to="/payments" className="hover:text-white transition">Payment Queries</Link></li>
              <li><Link to="/chatbot" className="hover:text-white transition">AI Assistant Studio</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Customer Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">OmniBot AI</h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Equipped with intelligent intent classification, order tracking APIs, automated return eligibility logic, and multi-channel payment resolution.
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>All AI Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} OmniBot E-Commerce AI. Built for next-gen customer delight.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
