import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  RotateCcw,
  XCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bot,
  ArrowRight,
  Package
} from 'lucide-react';
import { api } from '../services/api';
import { useChat } from '../context/ChatContext';

export default function ReturnsRefundsPage() {
  const [searchParams] = useSearchParams();
  const preselectedOrderId = searchParams.get('orderId');
  const [activeTab, setActiveTab] = useState('returns'); // 'returns' or 'refunds'
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return submission form state
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(preselectedOrderId || 'ORD-7749');
  const [returnReason, setReturnReason] = useState('Defective or Not Working');
  const [returnComment, setReturnComment] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const { triggerChatWithPrompt } = useChat();

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getOrders(), api.getRefunds()]).then(([ordersRes, refundsRes]) => {
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (refundsRes.success) setRefunds(refundsRes.refunds);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderId}?`)) return;
    setActionSuccess('');
    setActionError('');
    try {
      const res = await api.cancelOrder(orderId);
      if (res.success) {
        setActionSuccess(res.message);
        loadData();
      } else {
        setActionError(res.message);
      }
    } catch (err) {
      setActionError('Error processing order cancellation.');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setActionSuccess('');
    setActionError('');
    try {
      const res = await api.requestReturn(selectedOrderForReturn, returnReason, returnComment);
      if (res.success) {
        setActionSuccess(res.message);
        setReturnComment('');
        loadData();
      } else {
        setActionError(res.message);
      }
    } catch (err) {
      setActionError('Error submitting return request.');
    }
  };

  const eligibleForCancel = orders.filter(o => o.cancellation?.canCancel);
  const eligibleForReturn = orders.filter(o => o.return?.eligible);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
            Hassle-Free Post-Purchase Services
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Cancellations, Returns & Refund Center
          </h1>
          <p className="text-sm text-slate-300">
            Cancel un-dispatched orders instantly, schedule free doorstep return pickup within 14 days, and track bank refund credits.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'returns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Cancellations & Returns Facility</span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`pb-4 px-6 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'refunds'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Refund Status & Reference</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-emerald-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-rose-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* TAB 1: CANCELLATIONS & RETURNS */}
      {activeTab === 'returns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Cancellation Facility */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
                <XCircle className="w-4 h-4" />
                <span>One-Click Order Cancellation</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Orders can be cancelled before they enter the shipping stage.
              </p>
            </div>

            {eligibleForCancel.length > 0 ? (
              <div className="space-y-4">
                {eligibleForCancel.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{ord.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Total: <strong>${ord.payment.total.toFixed(2)}</strong> • Items: {ord.items.map(i => i.name).join(', ')}
                    </p>
                    <button
                      onClick={() => handleCancelOrder(ord.id)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel Order {ord.id}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-2">
                <p>None of your current orders are in the un-shipped stage.</p>
                <p className="text-slate-400">
                  Tip: Shipped orders like <strong>ORD-8821</strong> cannot be cancelled mid-transit. You can reject delivery or start a return after arrival.
                </p>
              </div>
            )}

            {/* AI Assistant card */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need help cancelling?</span>
              <button
                onClick={() => triggerChatWithPrompt("Can you cancel my order ORD-9302?")}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask AI to cancel</span>
              </button>
            </div>
          </div>

          {/* Right: Return Facility Wizard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>14-Day Return & Exchange Request</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select your delivered order to schedule free doorstep inspection & pickup.
              </p>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Eligible Delivered Order
                </label>
                <select
                  value={selectedOrderForReturn}
                  onChange={(e) => setSelectedOrderForReturn(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  {eligibleForReturn.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {ord.id} - {ord.items[0]?.name} (${ord.payment.total.toFixed(2)})
                    </option>
                  ))}
                  {eligibleForReturn.length === 0 && (
                    <option value="">No delivered orders currently eligible</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Return / Exchange
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="Defective or Not Working">Defective or Technical Malfunction</option>
                  <option value="Item does not match description">Item does not match website specifications</option>
                  <option value="Wrong item received">Wrong item received in package</option>
                  <option value="Packaging damaged on arrival">Item or packaging arrived damaged</option>
                  <option value="Changed mind or No longer needed">No longer needed / Changed mind</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Comments (Optional)
                </label>
                <textarea
                  rows="3"
                  value={returnComment}
                  onChange={(e) => setReturnComment(e.target.value)}
                  placeholder="Tell us what went wrong so we can expedite your replacement or refund..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800">
                ✓ Free doorstep courier pickup within 48 hours. No printout required.
              </div>

              <button
                type="submit"
                disabled={eligibleForReturn.length === 0}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Submit Return Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: REFUND INFORMATION */}
      {activeTab === 'refunds' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Standard Credit Card Timeline</span>
              <p className="text-xl font-bold text-slate-900 mt-1">3 - 5 Business Days</p>
              <p className="text-[11px] text-slate-400 mt-1">Depends on issuer bank billing cycle</p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 font-medium">UPI & Net Banking Timeline</span>
              <p className="text-xl font-bold text-slate-900 mt-1">Instant to 24 Hours</p>
              <p className="text-[11px] text-slate-400 mt-1">Direct IMPS credit to account</p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Cash on Delivery (COD)</span>
              <p className="text-xl font-bold text-slate-900 mt-1">24 - 48 Hours</p>
              <p className="text-[11px] text-slate-400 mt-1">Transferred via bank NEFT or UPI</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Refund Transactions</h3>
                <p className="text-xs text-slate-500">Track banking reference ARN and settlement history</p>
              </div>
              <button
                onClick={() => triggerChatWithPrompt("What is the status of my refund for ORD-6512?")}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Verify with AI</span>
              </button>
            </div>

            {refunds.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No active refund records found.</div>
            ) : (
              <div className="space-y-4">
                {refunds.map((ref, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">Order {ref.orderId}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          {ref.refundStatus}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">${ref.amount.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">Payment Source:</span> {ref.method}
                      </div>
                      <div>
                        <span className="text-slate-400">Bank Acquirer Reference (ARN):</span>
                        <span className="font-mono text-indigo-700 font-semibold block">{ref.refundReference}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Settled On:</span> {ref.refundDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
