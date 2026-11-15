import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const ChatContext = createContext();

const INITIAL_MESSAGES = [
  {
    id: 'msg-welcome',
    sender: 'bot',
    text: `👋 Hello! I am your **AI E-Commerce Assistant**.\n\nI can help you track orders, verify product stock availability, assist with cancellations, initiate returns, check refunds, and answer any payment questions!\n\nHow can I help you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'Track Order ORD-8821',
      'Is NovaPulse Headphones in stock?',
      'How to return an item?',
      'Cancel an order',
      'Payment options'
    ]
  }
];

export const ChatProvider = ({ children }) => {
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('ecom_chatbot_session_id');
    if (!sid) {
      sid = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      sessionStorage.setItem('ecom_chatbot_session_id', sid);
    }
    return sid;
  });
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('ecom_chatbot_history');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('ecom_chatbot_history', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const data = await api.sendChatMessage(text.trim(), {}, sessionId);

      const botMsg = {
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        text: data.reply || "I'm sorry, I couldn't process that query. Please try again.",
        intent: data.intent,
        data: data.data,
        suggestions: data.suggestions || ['Track an order', 'View Products', 'Talk to Support'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'bot',
          text: '⚠️ Unable to connect to the AI support server. Please make sure the backend is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: ['Try again', 'Check Orders', 'Frequently Asked Questions']
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const triggerChatWithPrompt = (prompt) => {
    setIsOpen(true);
    sendMessage(prompt);
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    sessionStorage.removeItem('ecom_chatbot_history');
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        setIsOpen,
        isTyping,
        sendMessage,
        triggerChatWithPrompt,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
