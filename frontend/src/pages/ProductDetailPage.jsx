import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Bot,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { useChat } from '../context/ChatContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { triggerChatWithPrompt } = useChat();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProductById(id).then(res => {
      if (res.success) {
        setProduct(res.product);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!pincode.trim() || !product) return;
    setCheckingStock(true);
    try {
      const res = await api.checkStock(product.id, pincode);
      if (res.success) {
        setDeliveryResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingStock(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-slate-500 text-sm">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all products</span>
        </Link>
      </div>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        {/* Product Image */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100 h-80 sm:h-[450px]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <span
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              inStock
                ? product.stock < 10
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {product.status}
          </span>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-indigo-600 uppercase tracking-wider">{product.category}</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Price block */}
            <div className="pt-2 flex items-baseline space-x-3">
              <span className="text-3xl font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-base text-slate-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Real-time availability indicator */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Stock Availability:</span>
                <span className={`font-bold ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {inStock ? `${product.stock} units ready for immediate dispatch` : 'Out of stock'}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Warehouse Location: <strong className="text-slate-700">{product.warehouse}</strong></span>
              </div>

              {/* Pincode checker */}
              <form onSubmit={handlePincodeCheck} className="pt-2 border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter postal zip code..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={checkingStock}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {checkingStock ? 'Checking...' : 'Check ETA'}
                </button>
              </form>

              {deliveryResult && (
                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  ⚡ Delivery to {pincode}: <strong>{deliveryResult.deliveryEstimate}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => triggerChatWithPrompt(`I have questions about ${product.name}. Is it covered under warranty and what is the return policy?`)}
              className="w-full py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Chatbot About This Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Specifications & Warranty section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Technical Specifications & Warranty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(product.specifications || {}).map(([key, val], idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-semibold text-slate-600">{key}</span>
              <span className="font-medium text-slate-900 text-right">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
