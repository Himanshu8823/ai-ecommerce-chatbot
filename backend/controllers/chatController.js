import { nlpEngine } from '../services/nlpEngine.js';
import { dbRepository } from '../services/dbRepository.js';

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000/api/chat';

export const handleChatMessage = async (req, res) => {
  try {
    const { message, context, session_id, customer_id } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A valid message string is required.'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds maximum allowed length of 2000 characters.'
      });
    }

    const cleanMessage = message.trim();
    const sessionId = session_id || 'default_user_session';

    // Log incoming customer message to MySQL
    await dbRepository.saveChatMessage(sessionId, customer_id, 'user', cleanMessage, null, null);

    let chatResponse = null;

    // 1. Try communicating with Python AI & NLP Service (with OpenAI support)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const pyResponse = await fetch(PYTHON_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanMessage,
          session_id: sessionId,
          context: context || {}
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (pyResponse.ok) {
        const pyData = await pyResponse.json();
        chatResponse = {
          success: true,
          source: 'python_ai_service',
          ...pyData
        };
      }
    } catch (pyErr) {
      console.log('[Chat Controller] Python AI Service not responding; utilizing fallback NLP engine.');
    }

    // 2. Fallback to built-in local NLP engine if Python is unavailable
    if (!chatResponse) {
      const localResponse = nlpEngine.processQuery(cleanMessage, context);
      chatResponse = {
        success: true,
        source: 'local_nlp_engine',
        timestamp: new Date().toISOString(),
        ...localResponse
      };
    }

    // Log AI bot reply to MySQL
    if (chatResponse && chatResponse.reply) {
      await dbRepository.saveChatMessage(
        sessionId,
        customer_id,
        'bot',
        chatResponse.reply,
        chatResponse.intent || 'general',
        chatResponse.data || null
      );
    }

    res.json(chatResponse);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      reply: 'An error occurred while processing your request. Please try again.',
      suggestions: ['Track an order', 'Check stock', 'Contact support']
    });
  }
};
