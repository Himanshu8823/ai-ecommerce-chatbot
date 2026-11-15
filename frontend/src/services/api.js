// Base API URL: Environment configurable for production or relative for dev proxy
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = (RAW_API_URL ? RAW_API_URL.replace(/\/$/, '') : '') + '/api';

/**
 * Universal safe fetch wrapper with production error handling
 */
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      return {
        success: false,
        status: res.status,
        message: errorBody.message || `Request failed with HTTP status ${res.status}`,
        ...errorBody
      };
    }
    return await res.json();
  } catch (networkError) {
    console.error(`[API Network Error] URL: ${url}`, networkError);
    return {
      success: false,
      message: 'Network connection error. Please ensure the backend server is reachable.'
    };
  }
};

export const api = {
  // Chatbot
  sendChatMessage: async (message, context = {}, sessionId = '') => {
    return safeFetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, session_id: sessionId }),
    });
  },

  // Products Catalog & Availability
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return safeFetch(`${API_BASE}/products${query ? `?${query}` : ''}`);
  },

  getProductById: async (id) => {
    return safeFetch(`${API_BASE}/products/${id}`);
  },

  checkStock: async (id, pincode = '') => {
    return safeFetch(`${API_BASE}/products/${id}/stock${pincode ? `?pincode=${pincode}` : ''}`);
  },

  // Orders, Tracking & Logistics
  getOrders: async () => {
    return safeFetch(`${API_BASE}/orders`);
  },

  getOrderById: async (id) => {
    return safeFetch(`${API_BASE}/orders/${id}`);
  },

  cancelOrder: async (id) => {
    return safeFetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  requestReturn: async (id, reason, comment = '') => {
    return safeFetch(`${API_BASE}/orders/${id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, comment })
    });
  },

  getRefunds: async () => {
    return safeFetch(`${API_BASE}/orders/refunds`);
  },

  // FAQs
  getFaqs: async (category = '', search = '') => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return safeFetch(`${API_BASE}/faqs?${params.toString()}`);
  },

  // Customer Authentication
  login: async (email, password) => {
    return safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  register: async (data) => {
    return safeFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  getProfile: async () => {
    return safeFetch(`${API_BASE}/auth/profile`);
  }
};
