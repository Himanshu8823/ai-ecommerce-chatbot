import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  Truck,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Bot,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useChat } from '../context/ChatContext';
import TrackingTimeline from '../components/tracking/TrackingTimeline';

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || 'ORD-8821';
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { triggerChatWithPrompt } = useChat();

  const sampleOrders = ['ORD-8821', 'ORD-7749', 'ORD-9302', 'ORD-6512'];

  const fetchOrder = (id) => {
    setLoading(true);
    setError('');
    api.getOrderById(id).then(res => {
      if (res.success) {
        setCurrentOrder(res.order);
      } else {
        setError(res.message || 'Order not found.');
        setCurrentOrder(null);
      }
    }).catch(err => {
      setError('Unable to fetch order information.');
      setCurrentOrder(null);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    setSearchParams({ orderId: orderIdInput.trim() });
    fetchOrder(orderIdInput.trim());
  };

  const selectSampleOrder = (id) => {
    setOrderIdInput(id);
    setSearchParams({ orderId: id });
    fetchOrder(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Real-Time Logistics Tracker
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Order Tracking & Live Delivery Status
          </h1>
          <p className="text-sm text-slate-300">
            Follow your shipment milestone-by-milestone from warehouse packing to final doorstep delivery.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter Order ID (e.g., ORD-8821)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition cursor-pointer shadow-xs"
          >
            Track Order
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Try active orders:</span>
          {sampleOrders.map((id) => (
            <button
              key={id}
              onClick={() => selectSampleOrder(id)}
              className={`px-3 py-1 rounded-full font-mono font-medium transition cursor-pointer ${
                orderIdInput.toUpperCase() === id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Order Tracking Body */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm">Locating package updates...</div>
      ) : currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visual Tracking Stepper */}
          <div className="lg:col-span-2 space-y-6">
            <TrackingTimeline order={currentOrder} />
          </div>

          {/* Logistics & Carrier Card */}
          <div className="space-y-6">
            {/* Courier info card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                Courier & Dispatch
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Logistics Partner:</span>
                  <span className="font-semibold text-slate-800">{currentOrder.carrier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">AWB Tracking No:</span>
                  <span className="font-mono font-semibold text-indigo-600">{currentOrder.trackingNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Helpline:</span>
                  <span className="font-medium text-slate-700">{currentOrder.courierPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-semibold text-emerald-600">{currentOrder.payment.paymentStatus}</span>
                </div>
              </div>

              {/* Bot query trigger */}
              <button
                onClick={() => triggerChatWithPrompt(`Can you give me an update on delivery for ${currentOrder.id}?`)}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI About This Delivery</span>
              </button>
            </div>

            {/* Delivery Destination Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Delivery Address</span>
              </h3>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">{currentOrder.shippingAddress.name}</p>
                <p>{currentOrder.shippingAddress.street}</p>
                <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zip}</p>
                <p>{currentOrder.shippingAddress.country}</p>
              </div>
            </div>

            {/* Security note */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Contactless delivery supported. An OTP or signature verification will be requested upon doorstep delivery.</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
