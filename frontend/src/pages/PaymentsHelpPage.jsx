import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Bot,
  HelpCircle,
  FileText,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function PaymentsHelpPage() {
  const { triggerChatWithPrompt } = useChat();
  const [txnInput, setTxnInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [txnResult, setTxnResult] = useState(null);

  const paymentMethods = [
    {
      name: 'Credit & Debit Cards',
      desc: 'Visa, MasterCard, American Express, Discover. 256-bit SSL encrypted tokenization.',
      badge: 'Instant'
    },
    {
      name: 'Digital Wallets',
      desc: 'Apple Pay, Google Pay, and PayPal with one-touch checkout.',
      badge: 'Instant'
    },
    {
      name: 'Unified Payments Interface (UPI)',
      desc: 'Instant QR code or VPA ID payment via any UPI app (Google Pay, PhonePe, Paytm).',
      badge: 'Instant'
    },
    {
      name: 'Cash on Delivery (COD)',
      desc: 'Pay cash or scan QR at doorstep upon delivery. Available on orders up to $250.',
      badge: 'Doorstep'
    }
  ];

  const handleVerifyTxn = (e) => {
    e.preventDefault();
    if (!txnInput.trim()) return;
    setVerifying(true);
    setTxnResult(null);

    setTimeout(() => {
      setVerifying(false);
      setTxnResult({
        txnId: txnInput.toUpperCase(),
        status: 'Auto-Reversal In Progress',
        message: `Reference ${txnInput.toUpperCase()} has been verified with the merchant payment gateway. Since no order was finalized, your bank has initiated an auto-credit reversal. Funds will reflect in your account within 48 to 72 business hours.`
      });
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Billing, Checkout & Invoices
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Payment-Related Inquiries & Resolution
          </h1>
          <p className="text-sm text-slate-300">
            Resolve failed debits, verify transaction references, learn about accepted payment options, and download invoices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Methods & Invoicing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supported Methods */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Accepted Payment Methods</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethods.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{m.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Failed Transaction Resolver Tool */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 text-indigo-950">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>Amount Debited but No Order Generated?</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your bank transaction reference ID, UTR, or payment gateway reference below for an instant status lookup.
              </p>
            </div>

            <form onSubmit={handleVerifyTxn} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={txnInput}
                onChange={(e) => setTxnInput(e.target.value)}
                placeholder="Enter Transaction ID (e.g. TXN-90218821)..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={verifying || !txnInput.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                {verifying ? 'Verifying...' : 'Check Status'}
              </button>
            </form>

            {txnResult && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
                <div className="flex items-center justify-between font-bold">
                  <span>Reference: {txnResult.txnId}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[11px]">
                    {txnResult.status}
                  </span>
                </div>
                <p className="leading-relaxed">{txnResult.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant & Invoice Help */}
        <div className="space-y-6">
          {/* Ask AI box */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Ask AI About Payments</h3>
              <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                Our chatbot can verify payments for orders ORD-8821, ORD-7749, or ORD-9302 and answer billing inquiries immediately.
              </p>
            </div>
            <button
              onClick={() => triggerChatWithPrompt("What is the payment status of my orders?")}
              className="w-full py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-xs hover:bg-indigo-50 transition cursor-pointer shadow-xs"
            >
              Check Orders Payment
            </button>
          </div>

          {/* Invoices card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Tax Invoices & GST</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official tax invoices are automatically generated as soon as your order ships and are emailed to your registered address.
            </p>
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => triggerChatWithPrompt("Can I get a copy of my tax invoice?")}
                className="text-xs text-indigo-600 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Request invoice copy via AI</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
