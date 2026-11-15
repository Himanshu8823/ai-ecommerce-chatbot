// ========================================================
// Comprehensive End-to-End System Integration Test Suite
// ========================================================

const BACKEND_URL = 'http://localhost:5000';
const PYTHON_URL = 'http://127.0.0.1:8000';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING FULL SYSTEM INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (title, condition, extra = '') => {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${title} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} ${extra ? `(${extra})` : ''}`);
    }
  };

  // 1. Backend Health Check
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    const data = await res.json();
    assert('1. Node.js/Express Backend Health API', res.ok && data.status === 'online', `Service: ${data.service}`);
  } catch (err) {
    assert('1. Node.js/Express Backend Health API', false, err.message);
  }

  // 2. Python AI Service Health Check
  try {
    const res = await fetch(`${PYTHON_URL}/api/health`);
    const data = await res.json();
    assert('2. Python AI / NLP Service Health API', res.ok && data.status === 'online', `OpenAI Model: ${data.openai_model}`);
  } catch (err) {
    assert('2. Python AI / NLP Service Health API', false, err.message);
  }

  // 3. Products Database / API
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`);
    const data = await res.json();
    assert('3. Products Catalog API', res.ok && data.products.length > 0, `Products loaded: ${data.products.length}`);
  } catch (err) {
    assert('3. Products Catalog API', false, err.message);
  }

  // 4. Product Stock & Availability Check
  try {
    const res = await fetch(`${BACKEND_URL}/api/products/PROD-101/stock?pincode=78701`);
    const data = await res.json();
    assert('4. Real-time Product Stock & ETA API', res.ok && data.stock > 0, `Stock: ${data.stock}, ETA: ${data.deliveryEstimate}`);
  } catch (err) {
    assert('4. Real-time Product Stock & ETA API', false, err.message);
  }

  // 5. Order Tracking & Delivery Status
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/ORD-8821`);
    const data = await res.json();
    assert('5. Order & Delivery Tracking API', res.ok && data.order.id === 'ORD-8821', `Status: ${data.order.status}, Carrier: ${data.order.carrier}`);
  } catch (err) {
    assert('5. Order & Delivery Tracking API', false, err.message);
  }

  // 6. AI Chatbot: Product Inquiry (Connected via Backend & Python)
  const sessionId = 'test-session-' + Date.now();
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Tell me about the NovaPulse Pro headphones and check its price',
        session_id: sessionId
      })
    });
    const data = await res.json();
    assert(
      '6. AI Chatbot Product Inquiry',
      res.ok && data.reply && data.reply.includes('NovaPulse'),
      `Engine: ${data.engine || data.source}`
    );
  } catch (err) {
    assert('6. AI Chatbot Product Inquiry', false, err.message);
  }

  // 7. AI Chatbot: Order Tracking Inquiry
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Where is my order ORD-8821 right now?',
        session_id: sessionId
      })
    });
    const data = await res.json();
    assert(
      '7. AI Chatbot Order Tracking',
      res.ok && data.reply && data.reply.includes('ORD-8821'),
      `Found tracking details for ${data.data?.order?.id || 'ORD-8821'}`
    );
  } catch (err) {
    assert('7. AI Chatbot Order Tracking', false, err.message);
  }

  // 8. AI Chatbot: Context Preservation Across Multi-Turn Conversation
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Can I cancel it?', // Context: 'it' refers to ORD-8821 from previous turn!
        session_id: sessionId
      })
    });
    const data = await res.json();
    assert(
      '8. Multi-Turn Context Memory ("it" -> ORD-8821)',
      res.ok && data.reply && data.reply.includes('ORD-8821'),
      `Correctly resolved active order in context`
    );
  } catch (err) {
    assert('8. Multi-Turn Context Memory ("it" -> ORD-8821)', false, err.message);
  }

  // 9. AI Chatbot: Human Support Escalation
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I want to talk to a human customer care agent',
        session_id: sessionId
      })
    });
    const data = await res.json();
    assert(
      '9. Human Support Escalation Handoff',
      res.ok && (data.can_escalate || data.reply.includes('Ticket') || data.reply.includes('Support')),
      `Ticket reference generated`
    );
  } catch (err) {
    assert('9. Human Support Escalation Handoff', false, err.message);
  }

  // 10. Error Handling & Validation
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' })
    });
    const data = await res.json();
    assert('10. Validation & Error Handling (Empty Message Rejection)', res.status === 400 && !data.success, 'Proper HTTP 400 validation');
  } catch (err) {
    assert('10. Validation & Error Handling', false, err.message);
  }

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('======================================================\n');
}

runTests();
