import React from 'react';
import { CheckCircle2, Clock, Truck, Package, MapPin, AlertCircle } from 'lucide-react';

export default function TrackingTimeline({ order }) {
  if (!order || !order.timeline) return null;

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';
  const isReturned = order.status === 'Refunded' || order.status === 'Return Initiated';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              Order ID
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{order.id}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Carrier: <span className="font-medium text-slate-700">{order.carrier}</span> • Tracking: <span className="font-mono text-slate-700 font-medium">{order.trackingNumber}</span>
          </p>
        </div>

        <div className="flex sm:flex-col sm:items-end">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isDelivered
                ? 'bg-emerald-100 text-emerald-800'
                : isCancelled
                ? 'bg-rose-100 text-rose-800'
                : isReturned
                ? 'bg-purple-100 text-purple-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
            <span>{order.deliveryStatus || order.status}</span>
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Estimated Delivery: <span className="font-semibold text-slate-800">{order.estimatedDelivery}</span>
          </p>
        </div>
      </div>

      {/* Current Location Highlight Banner */}
      <div className="my-5 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center space-x-3 text-xs text-indigo-900">
        <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
        <div>
          <span className="font-semibold">Current Dispatch Location: </span>
          <span>{order.currentLocation}</span>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="relative mt-8">
        <div className="space-y-6">
          {order.timeline.map((step, idx) => {
            const isCompleted = step.completed;
            const isLast = idx === order.timeline.length - 1;

            return (
              <div key={idx} className="relative flex items-start group">
                {/* Vertical connecting line */}
                {!isLast && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-full -ml-[1px] ${
                      isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step icon node */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    isCompleted
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-100 border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Content */}
                <div className="ml-4 flex-1 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4
                      className={`text-sm font-semibold ${
                        isCompleted ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {step.status}
                    </h4>
                    <span className="text-xs text-slate-400 mt-0.5 sm:mt-0 font-medium">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Package Items Preview */}
      {order.items && order.items.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Package Contents ({order.items.length} item{order.items.length > 1 ? 's' : ''})
          </h4>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500">Qty: {item.quantity} • ${item.price.toFixed(2)} each</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
