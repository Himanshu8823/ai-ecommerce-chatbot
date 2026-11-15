import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Bot,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Headphones
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function ContactPage() {
  const { triggerChatWithPrompt, setIsOpen } = useChat();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    department: 'Order Tracking & Delivery',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTicket = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketNumber(newTicket);
    setSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      orderId: '',
      department: 'Order Tracking & Delivery',
      subject: '',
      message: ''
    });
    setSubmitted(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5" />
            <span>24/7 Customer Care & Intelligent Support</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Contact Support & Care Team
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Need urgent assistance? Talk directly to our 24/7 AI chatbot for instant resolution, or submit a support ticket to our human care specialists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Direct Info & AI Chat Prompt */}
        <div className="space-y-6">
          {/* Quick AI Bot Trigger Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Instant Solution</span>
              <h3 className="text-lg font-bold mt-0.5">Skip the Queue with AI</h3>
              <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
                OmniBot can immediately check live parcel tracking, initiate product returns, review refund status, and verify stock availability in seconds.
              </p>
            </div>
            <button
              onClick={() => {
                setIsOpen(true);
                triggerChatWithPrompt("Hi, I need assistance with an issue.");
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-indigo-50 text-indigo-900 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Launch Live AI Chatbot</span>
            </button>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Direct Contact Channels
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Toll-Free Customer Care</p>
                  <p className="text-slate-500 mt-0.5">+1 (800) 555-0199</p>
                  <p className="text-[11px] text-slate-400">Monday - Saturday (8:00 AM - 10:00 PM EST)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Email Inquiries</p>
                  <p className="text-slate-500 mt-0.5">support@omnibot-ecommerce.com</p>
                  <p className="text-[11px] text-slate-400">Response within 2-4 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Fulfillment Headquarters</p>
                  <p className="text-slate-500 mt-0.5">100 Innovation Way, Suite 400</p>
                  <p className="text-slate-500">San Francisco, CA 94105</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">AI Assistant Availability</p>
                  <p className="text-emerald-600 font-semibold mt-0.5">24 Hours / 7 Days a Week</p>
                  <p className="text-[11px] text-slate-400">Always online & responsive</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Support Ticket Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Support Ticket Created!</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your ticket reference is <strong className="font-mono text-indigo-600 text-sm">{ticketNumber}</strong>. Our customer support staff has received your inquiry and will email you back shortly at <strong>{formData.email}</strong>.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => triggerChatWithPrompt(`I submitted support ticket ${ticketNumber}. Can you check its status?`)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs flex items-center justify-center space-x-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Track Ticket with AI</span>
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Submit a Support Request</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Please provide detailed information so we can route your ticket to the right specialist.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Alex Morgan"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Department / Category
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Order Tracking & Delivery">Order Tracking & Delivery</option>
                        <option value="Cancellation & Returns">Cancellation & Returns</option>
                        <option value="Refund Status">Refund Status & Settlement</option>
                        <option value="Payment & Billing">Payment & Invoicing Issues</option>
                        <option value="Product Stock & Specifications">Product Stock & Specifications</option>
                        <option value="Warranty & Defective Item">Warranty & Replacement</option>
                        <option value="Other Inquiries">Other Inquiries</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Order ID (Optional)
                      </label>
                      <input
                        type="text"
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleChange}
                        placeholder="e.g. ORD-8821"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief summary of your query..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Detailed Message *
                    </label>
                    <textarea
                      name="message"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your issue or question in detail..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                    >
                      <span>Submit Support Ticket</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
