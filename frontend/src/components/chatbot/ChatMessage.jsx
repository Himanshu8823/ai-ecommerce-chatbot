import React from 'react';
import { Bot, User, ExternalLink, Package, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChatMessage({ message, onSelectSuggestion }) {
  const isBot = message.sender === 'bot';

  // Format message text: handle **bold**, bullet points, and newlines cleanly
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Process bold markers: **text**
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      return (
        <div key={lIdx} className={line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-800 text-xs font-mono">
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs ${
            isBot
              ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
              : 'bg-indigo-600 text-white rounded-tr-xs'
          }`}
        >
          {renderFormattedText(message.text)}

          {/* Embedded Order Card if present in data */}
          {message.data?.order && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between font-semibold border-b border-slate-200 pb-1.5">
                <span className="flex items-center space-x-1.5 text-indigo-700">
                  <Package className="w-3.5 h-3.5" />
                  <span>{message.data.order.id}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
                  {message.data.order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div><span className="text-slate-400">Carrier:</span> {message.data.order.carrier}</div>
                <div><span className="text-slate-400">ETA:</span> {message.data.order.estimatedDelivery}</div>
                <div className="col-span-2"><span className="text-slate-400">Location:</span> {message.data.order.currentLocation}</div>
              </div>
              <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
                <Link
                  to={`/tracking?orderId=${message.data.order.id}`}
                  className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline"
                >
                  <span>Open Full Tracker</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                {message.data.order.cancellation?.canCancel && (
                  <Link
                    to="/returns"
                    className="text-rose-600 hover:underline text-xs"
                  >
                    Cancel Order
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Embedded Product Card if present in data */}
          {message.data?.product && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="flex gap-3">
                <img
                  src={message.data.product.image}
                  alt={message.data.product.name}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{message.data.product.name}</p>
                  <p className="text-indigo-600 font-bold">${message.data.product.price.toFixed(2)}</p>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium ${
                      message.data.product.stock > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {message.data.product.status} ({message.data.product.stock} available)
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <Link
                  to={`/products/${message.data.product.id}`}
                  className="inline-flex items-center space-x-1 text-indigo-600 font-medium hover:underline text-xs"
                >
                  <span>View Product Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 mt-1 px-1">
          {message.timestamp}
        </span>

        {/* Suggestions chips (only on bot messages) */}
        {isBot && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion && onSelectSuggestion(sug)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs border border-slate-200/80 transition cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
