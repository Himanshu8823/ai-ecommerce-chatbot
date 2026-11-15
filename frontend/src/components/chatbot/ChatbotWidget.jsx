import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  Trash2,
  HelpCircle,
  Truck,
  RotateCcw,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatMessage from './ChatMessage';
import { Link } from 'react-router-dom';

export default function ChatbotWidget() {
  const { messages, isOpen, setIsOpen, isTyping, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestion = (sug) => {
    sendMessage(sug);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-medium shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          aria-label="Open AI Support Chatbot"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-soft-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-700"></span>
          </div>
          <span className="text-sm font-semibold pr-1">Ask AI Assistant</span>
          <span className="absolute -top-2.5 -right-1 bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            24/7 Live
          </span>
        </button>
      )}

      {/* Expanded Chatbot Modal */}
      {isOpen && (
        <div
          className={`flex flex-col bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-600"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">OmniBot AI Assistant</h3>
                <p className="text-[10px] text-indigo-100 flex items-center space-x-1">
                  <span>Customer Support Intelligence</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {!isMinimized && (
                <>
                  <Link
                    to="/chatbot"
                    onClick={() => setIsOpen(false)}
                    title="Open Fullscreen Assistant Studio"
                    className="p-1.5 rounded-lg hover:bg-white/10 transition text-indigo-100 hover:text-white"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={clearChat}
                    title="Clear Conversation"
                    className="p-1.5 rounded-lg hover:bg-white/10 transition text-indigo-100 hover:text-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-indigo-100 hover:text-white cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-indigo-100 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Topic Chips */}
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar">
                <button
                  onClick={() => handleSuggestion('Track my order')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  <Truck className="w-3 h-3 text-indigo-500" />
                  <span>Track Order</span>
                </button>
                <button
                  onClick={() => handleSuggestion('Is NovaPulse headphone in stock?')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Check Stock</span>
                </button>
                <button
                  onClick={() => handleSuggestion('How do returns work?')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3 text-emerald-500" />
                  <span>Return Item</span>
                </button>
                <button
                  onClick={() => handleSuggestion('What payment methods are supported?')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  <CreditCard className="w-3 h-3 text-blue-500" />
                  <span>Payment Query</span>
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onSelectSuggestion={handleSuggestion}
                  />
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 px-1">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="flex space-x-1 bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-tl-xs">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about orders, products, refunds..."
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
