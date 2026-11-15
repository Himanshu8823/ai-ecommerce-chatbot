import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  MapPin,
  Clock,
  ExternalLink,
  Bot,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { api } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const { triggerChatWithPrompt } = useChat();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.getOrders().then(res => {
      if (res.success) {
        setOrders(res.orders);
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderId}?`)) return;
    try {
      const res = await api.cancelOrder(orderId);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message });
        fetchOrders();
      } else {
        setActionMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error cancelling order.' });
    }
  };

  const activeShipments = orders.filter(o => o.status === 'In Transit' || o.status === 'Processing');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const refundedOrders = orders.filter(o => o.status === 'Refunded' || o.payment?.paymentStatus === 'Refunded');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={user?.name || 'Customer'}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-indigo-50"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name || 'Alex Morgan'}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Verified Shopper
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{user?.email || 'alex@example.com'} • Member since {user?.memberSince || 'January 2025'}</p>
            <p className="text-xs text-slate-600 flex items-center space-x-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.address?.street}, {user?.address?.city}, {user?.address?.state} {user?.address?.zip}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => triggerChatWithPrompt("Show me a summary of my account and active orders")}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>AI Account Assistant</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Active Shipments</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeShipments.length}</p>
          <span className="text-[11px] text-indigo-600 font-medium">Live tracking active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Delivered Orders</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{deliveredOrders.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Eligible for returns</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Refunds Processed</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{refundedOrders.length}</p>
          <span className="text-[11px] text-purple-600 font-medium">Credited to source card</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Saved Cards & UPI</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">2</p>
          <span className="text-[11px] text-slate-500">Default: Visa •••• 4242</span>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Orders List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Recent Orders</h2>
            <p className="text-xs text-slate-500">View real-time status, manage cancellations, or request returns.</p>
          </div>
          <Link
            to="/tracking"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>Live GPS Tracker</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading your orders...</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900 text-sm">{order.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : order.status === 'Refunded'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items & details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Item preview */}
                  <div className="md:col-span-2 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-500">Qty: {item.quantity} • Total: ${order.payment.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="text-xs text-slate-500 pt-1">
                      <span className="font-medium text-slate-700">Delivery status:</span> {order.deliveryStatus} ({order.carrier})
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col justify-center space-y-2 md:border-l md:border-slate-100 md:pl-4">
                    <Link
                      to={`/tracking?orderId=${order.id}`}
                      className="w-full text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                    >
                      Track Package
                    </Link>

                    {order.cancellation?.canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="w-full text-center py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.return?.eligible && (
                      <Link
                        to={`/returns?orderId=${order.id}`}
                        className="w-full text-center py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition"
                      >
                        Initiate Return
                      </Link>
                    )}

                    <button
                      onClick={() => triggerChatWithPrompt(`I have a question about order ${order.id}`)}
                      className="w-full text-center py-1.5 px-3 text-indigo-600 hover:underline text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask AI Bot</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
