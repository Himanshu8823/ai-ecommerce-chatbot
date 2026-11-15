import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Package,
  RotateCcw,
  CreditCard,
  Zap,
  Headphones,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Download
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import ChatMessage from '../components/chatbot/ChatMessage';

export default function ChatbotPage() {
  const { messages, isTyping, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const topicSuggestions = [
    {
      category: 'Order & Delivery',
      icon: Package,
      queries: ['Where is order ORD-8821?', 'Check delivery status for ORD-7749', 'Track my latest shipment']
    },
    {
      category: 'Product Availability',
      icon: Zap,
      queries: ['Is NovaPulse headphones available?', 'Check stock for Aura Smartwatch', 'Show me all laptops in stock']
    },
    {
      category: 'Returns & Refunds',
      icon: RotateCcw,
      queries: ['Can I cancel order ORD-9302?', 'How do I return ORD-7749?', 'What is the status of my refund?']
    },
    {
      category: 'Payments & Billing',
      icon: CreditCard,
      queries: ['My payment failed but account debited', 'What payment methods do you support?', 'Can I pay using Cash on Delivery?']
    },
    {
      category: 'Human Escalation',
      icon: Headphones,
      queries: ['Connect me to a human agent', 'Speak with representative']
    }
  ];

  const exportChatHistory = () => {
    const text = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniBot-Chat-Transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        {/* Left Sidebar - Suggested Topics & FAQ quick triggers */}
        <div className="hidden lg:flex flex-col bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-y-auto">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Support Studio</h2>
              <p className="text-[11px] text-slate-500">Autonomous Assistance</p>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Suggested Inquiries
          </p>

          <div className="space-y-4 flex-1">
            {topicSuggestions.map((group, idx) => {
              const Icon = group.icon;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                    <Icon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{group.category}</span>
                  </div>
                  <div className="space-y-1 pl-5">
                    {group.queries.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => sendMessage(q)}
                        className="block w-full text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 px-2 py-1.5 rounded-lg transition truncate cursor-pointer"
                        title={q}
                      >
                        • {q}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>AI Engine Active</span>
            </span>
            <button
              onClick={exportChatHistory}
              title="Download Transcript"
              className="p-1.5 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition cursor-pointer flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Main Conversation Window */}
        <div className="lg:col-span-3 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm sm:text-base">OmniBot AI Assistant</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                    Online
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Ready to resolve queries on tracking, products, payments & returns
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute Sounds' : 'Enable Speech Feedback'}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={clearChat}
                title="Reset Conversation"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages scroll area */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onSelectSuggestion={(sug) => sendMessage(sug)}
              />
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 px-1">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="flex space-x-1.5 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything (e.g., 'Track ORD-8821', 'Is NovaPulse available?', 'Cancel ORD-9302')..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
