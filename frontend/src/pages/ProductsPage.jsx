import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Bot, Star, Zap, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { api } from '../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all');
  const { triggerChatWithPrompt } = useChat();

  const categories = ['All', 'Audio & Electronics', 'Wearables', 'Computers', 'Peripherals', 'Accessories', 'Home Audio'];

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (search) params.search = search;
    if (stockFilter !== 'all') params.stockStatus = stockFilter;

    api.getProducts(params).then(res => {
      if (res.success) {
        setProducts(res.products);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedCategory, search, stockFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xs">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Store Catalog & Inventory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Product Information & Real-Time Stock
          </h1>
          <p className="text-sm text-slate-300">
            Check live inventory availability across our regional distribution hubs, read technical specifications, or consult our AI chatbot for comparisons.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, category, or specs..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Stock Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Availability:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock Only</option>
              <option value="out-of-stock">Out of Stock Only</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading product catalog...</div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-sm font-medium text-slate-700">No products found matching your filters.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); setStockFilter('all'); }}
            className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const inStock = product.stock > 0;
            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
              >
                {/* Image Container */}
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Stock badge */}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs flex items-center space-x-1 ${
                      inStock
                        ? product.stock < 10
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    <span>{product.status} ({product.stock})</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-medium text-indigo-600">{product.category}</span>
                      <span className="flex items-center space-x-1 font-semibold text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{product.rating} ({product.reviewCount})</span>
                      </span>
                    </div>

                    <Link to={`/products/${product.id}`} className="hover:text-indigo-600 transition">
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-700">Warehouse:</span> {product.warehouse}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => triggerChatWithPrompt(`Is ${product.name} currently in stock and when can it be delivered?`)}
                        title="Ask AI about stock & specs"
                        className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition cursor-pointer"
                      >
                        <Bot className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/products/${product.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1 transition"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
