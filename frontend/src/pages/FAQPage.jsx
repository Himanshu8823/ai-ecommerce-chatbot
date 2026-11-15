import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Bot,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useChat } from '../context/ChatContext';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState('faq-1');
  const [loading, setLoading] = useState(true);
  const { triggerChatWithPrompt } = useChat();

  useEffect(() => {
    setLoading(true);
    api.getFaqs(selectedCategory, search).then(res => {
      if (res.success) {
        setFaqs(res.faqs);
        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xs text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Self-Service Knowledge Base
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-300">
            Find quick solutions to common questions regarding shipments, returns, payments, stock, and account security.
          </p>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs by question or keyword (e.g. tracking, return window, refund time)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Categories Bar */}
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

      {/* Accordion FAQ list */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Searching knowledge base...</div>
      ) : faqs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-sm font-medium text-slate-700">No questions found matching your search.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
                >
                  <div className="pr-4">
                    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide block mb-1">
                      {faq.category}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 border-t border-slate-100 text-slate-600 text-xs sm:text-sm leading-relaxed space-y-4">
                    <p>{faq.answer}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
                        {faq.keywords.slice(0, 4).map((kw, idx) => (
                          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md">
                            #{kw}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => triggerChatWithPrompt(faq.question)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Ask AI Assistant</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Still need help CTA */}
      <div className="bg-indigo-50/80 border border-indigo-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="text-base font-bold text-slate-900">Still have an unanswered question?</h3>
          <p className="text-xs text-slate-600 mt-1">Our AI chatbot is ready to answer specific queries about your orders 24/7.</p>
        </div>
        <button
          onClick={() => triggerChatWithPrompt("I have a question that wasn't in the FAQ")}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
        >
          Chat with Assistant
        </button>
      </div>
    </div>
  );
}
