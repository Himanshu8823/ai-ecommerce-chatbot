import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadJson = (filename) => {
  const filePath = path.join(__dirname, '../data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export class NLPEngine {
  constructor() {
    this.reload();
  }

  reload() {
    this.products = loadJson('products.json');
    this.orders = loadJson('orders.json');
    this.faqs = loadJson('faqs.json');
  }

  processQuery(query, userContext = {}) {
    this.reload();
    const cleanQuery = (query || '').toLowerCase().trim();

    // 1. Order Tracking / Delivery Intent
    const orderMatch = cleanQuery.match(/ord-\d{4}/i);
    const trackingWords = ['track', 'where is', 'delivery', 'status', 'shipped', 'package', 'courier', 'arrive', 'eta', 'when will'];
    const isOrderQuery = trackingWords.some(w => cleanQuery.includes(w)) || orderMatch;

    if (orderMatch) {
      const orderId = orderMatch[0].toUpperCase();
      const foundOrder = this.orders.find(o => o.id === orderId);
      if (foundOrder) {
        return {
          intent: 'order_tracking',
          reply: `Here are the latest tracking details for **${foundOrder.id}**: \n\n` +
                 `• **Status**: ${foundOrder.status} (${foundOrder.deliveryStatus})\n` +
                 `• **Carrier**: ${foundOrder.carrier} (Tracking: \`${foundOrder.trackingNumber}\`)\n` +
                 `• **Current Location**: ${foundOrder.currentLocation}\n` +
                 `• **Estimated Delivery**: ${foundOrder.estimatedDelivery}\n\n` +
                 `You can view the full visual timeline below:`,
          data: { order: foundOrder },
          suggestions: ['Cancel this order', 'Contact Courier', 'View all my orders', 'Refund information']
        };
      } else {
        return {
          intent: 'order_not_found',
          reply: `I couldn't locate order **${orderId}** in our active records. Please double-check your Order ID (e.g., ORD-8821, ORD-7749, ORD-9302) or view your account dashboard.`,
          suggestions: ['Track ORD-8821', 'Track ORD-7749', 'Track ORD-9302', 'Talk to Support Agent']
        };
      }
    }

    if (isOrderQuery && !orderMatch) {
      // If user is asking generally where their order is
      const userOrders = this.orders;
      return {
        intent: 'order_inquiry_general',
        reply: `You currently have **${userOrders.length}** orders on file. Which one would you like to track or inspect?`,
        data: { orders: userOrders },
        suggestions: userOrders.slice(0, 3).map(o => `Track ${o.id}`)
      };
    }

    // 2. Cancellation Intent
    const cancelWords = ['cancel', 'cancellation', 'stop order', 'abort order'];
    if (cancelWords.some(w => cleanQuery.includes(w))) {
      if (orderMatch) {
        const orderId = orderMatch[0].toUpperCase();
        const foundOrder = this.orders.find(o => o.id === orderId);
        if (foundOrder) {
          if (foundOrder.cancellation.canCancel) {
            return {
              intent: 'cancellation_eligible',
              reply: `Order **${foundOrder.id}** is currently in **${foundOrder.status}** status and is eligible for immediate cancellation. Would you like to proceed with cancelling it now?`,
              data: { order: foundOrder, canCancel: true },
              suggestions: [`Confirm Cancel ${foundOrder.id}`, 'Keep my order', 'Check delivery date']
            };
          } else {
            return {
              intent: 'cancellation_ineligible',
              reply: `Order **${foundOrder.id}** cannot be cancelled directly because: *${foundOrder.cancellation.reasonCannotCancel}*. \n\nOnce delivered, you can initiate a return within 14 days for a 100% refund.`,
              data: { order: foundOrder, canCancel: false },
              suggestions: [`Track ${foundOrder.id}`, 'Return policy', 'Talk to Human Agent']
            };
          }
        }
      }
      return {
        intent: 'cancellation_info',
        reply: `Orders can be cancelled free of charge while in the **Processing** or **Confirmed** stage. \n\nFor example, order **ORD-9302** is currently in Processing and can be cancelled right away. Which order would you like to cancel?`,
        suggestions: ['Cancel ORD-9302', 'Cancel ORD-8821', 'View Return Policy']
      };
    }

    // 3. Return & Refund Intent
    const returnWords = ['return', 'exchange', 'replacement', 'send back'];
    const refundWords = ['refund', 'money back', 'reimbursement', 'credit to card', 'refund status'];

    if (returnWords.some(w => cleanQuery.includes(w))) {
      return {
        intent: 'returns_policy',
        reply: `We offer a **14-day hassle-free return window** on delivered electronics and products. Return pickup is scheduled from your doorstep at zero cost.\n\n` +
               `• **Delivered orders eligible for return**: **ORD-7749** (Aura Smartwatch Series 6).\n` +
               `Would you like to initiate a return request now?`,
        data: {
          eligibleOrders: this.orders.filter(o => o.return && o.return.eligible)
        },
        suggestions: ['Return ORD-7749', 'Check refund status', 'Return guidelines']
      };
    }

    if (refundWords.some(w => cleanQuery.includes(w))) {
      const refundedOrder = this.orders.find(o => o.status === 'Refunded');
      return {
        intent: 'refund_status',
        reply: `Here is the status of your recent refunds:\n\n` +
               `• **Order ORD-6512** (Apex SoundBar): **Refund Completed ($194.39)** credited to original Visa card.\n` +
               `• **Bank Reference / ARN**: \`ARN-4920194821\`.\n\n` +
               `Typical timelines: Credit/Debit cards take **3-5 business days**, while UPI/PayPal reflect within **24 hours**.`,
        data: { refundedOrder },
        suggestions: ['Track another order', 'Payment query', 'FAQ on refunds']
      };
    }

    // 4. Product Availability & Stock Check
    const stockWords = ['available', 'availability', 'in stock', 'out of stock', 'inventory', 'left'];
    const isStockQuery = stockWords.some(w => cleanQuery.includes(w));

    // Check if query mentions a specific product name or keyword
    const matchedProduct = this.products.find(p => {
      const pName = p.name.toLowerCase();
      const pCat = p.category.toLowerCase();
      return (
        cleanQuery.includes(pName) ||
        pName.split(' ').some(word => word.length > 3 && cleanQuery.includes(word)) ||
        cleanQuery.includes(p.id.toLowerCase())
      );
    });

    if (matchedProduct) {
      const stockMsg = matchedProduct.stock > 0
        ? `✅ **In Stock**: ${matchedProduct.stock} units currently available at ${matchedProduct.warehouse}. Estimated delivery: ${matchedProduct.deliveryEstimate}.`
        : `❌ **Out of Stock**: Currently unavailable. Expected restock within 3-5 days.`;

      return {
        intent: 'product_detail',
        reply: `Here are the details for **${matchedProduct.name}**:\n\n` +
               `• **Price**: $${matchedProduct.price.toFixed(2)} (Original: ~~$${matchedProduct.originalPrice.toFixed(2)}~~)\n` +
               `• **Stock Status**: ${stockMsg}\n` +
               `• **Rating**: ⭐ ${matchedProduct.rating} / 5 (${matchedProduct.reviewCount} customer reviews)\n` +
               `• **Key Specs**: ${Object.entries(matchedProduct.specifications).map(([k, v]) => `${k}: ${v}`).join(' | ')}\n\n` +
               `${matchedProduct.description}`,
        data: { product: matchedProduct },
        suggestions: [
          `Check shipping for ${matchedProduct.name.split(' ')[0]}`,
          'View all products',
          'Track my order',
          'Payment methods'
        ]
      };
    }

    if (isStockQuery || cleanQuery.includes('product') || cleanQuery.includes('catalog') || cleanQuery.includes('items')) {
      const inStockCount = this.products.filter(p => p.stock > 0).length;
      return {
        intent: 'products_overview',
        reply: `We currently feature **${this.products.length} catalog items**, with **${inStockCount} products actively in stock** across our regional warehouses.\n\nTop categories: Audio, Wearables, Computers, Peripherals, and Accessories. Which category or product would you like to explore?`,
        data: { products: this.products },
        suggestions: ['Show NovaPulse Headphones', 'Show Aura Smartwatch', 'Show Zenith Laptop', 'View all products']
      };
    }

    // 5. Payment Queries
    const paymentWords = ['payment', 'pay', 'credit card', 'debit card', 'upi', 'paypal', 'cod', 'cash on delivery', 'emi', 'failed transaction'];
    if (paymentWords.some(w => cleanQuery.includes(w))) {
      return {
        intent: 'payment_query',
        reply: `**Supported Payment Options & Guidelines:**\n\n` +
               `1. **Cards**: Visa, MasterCard, Amex (Encrypted 256-bit SSL)\n` +
               `2. **Digital Wallets**: PayPal, Apple Pay, Google Pay\n` +
               `3. **UPI & Net Banking**: Instant checkout\n` +
               `4. **Cash On Delivery (COD)**: Available on orders up to $250\n\n` +
               `⚠️ *Did a payment fail but your bank account was debited?* Banks automatically auto-reverse pending amounts within 48-72 business hours.`,
        suggestions: ['Payment failed issue', 'Refund status', 'Track my order', 'Check order ORD-8821 payment']
      };
    }

    // 6. Frequently Asked Questions match
    const faqMatch = this.faqs.find(f => {
      return f.keywords.some(k => cleanQuery.includes(k));
    });

    if (faqMatch) {
      return {
        intent: 'faq_match',
        reply: `**${faqMatch.question}**\n\n${faqMatch.answer}`,
        data: { faq: faqMatch },
        suggestions: ['Track an order', 'Return an item', 'Check product availability', 'View all FAQs']
      };
    }

    // 7. Greetings & General Inquiries
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'help', 'start'];
    if (greetings.some(g => cleanQuery === g || cleanQuery.startsWith(g + ' '))) {
      return {
        intent: 'greeting',
        reply: `👋 Hello! Welcome to our **E-Commerce Customer Support AI**.\n\n` +
               `I can help you with:\n` +
               `📦 **Live Order Tracking & Delivery Status** (e.g. "Track ORD-8821")\n` +
               `🔍 **Product Information & Stock Availability**\n` +
               `💳 **Payment Queries & Invoices**\n` +
               `🔄 **Cancellations & Return Requests**\n` +
               `💰 **Refund Status Checks**\n` +
               `❓ **Frequently Asked Questions**\n\n` +
               `How can I assist you today?`,
        suggestions: [
          'Track my order',
          'Is NovaPulse headphone in stock?',
          'Cancel an order',
          'How do returns work?',
          'Payment methods'
        ]
      };
    }

    // 8. Human Agent Escalation
    const humanWords = ['human', 'agent', 'representative', 'operator', 'talk to person', 'real person'];
    if (humanWords.some(w => cleanQuery.includes(w))) {
      return {
        intent: 'escalate_human',
        reply: `🎧 **Connecting to Live Support**: A senior customer care specialist is ready to take over this session.\n\n` +
               `• Queue Position: #1 in line\n` +
               `• Estimated wait time: < 1 minute\n` +
               `• Reference Ticket: \`TCK-${Math.floor(100000 + Math.random() * 900000)}\`\n\n` +
               `In the meantime, feel free to share your specific issue or order number below so our agent can review it immediately!`,
        suggestions: ['Track ORD-8821', 'Check refund status', 'Return ORD-7749', 'Back to AI Chat']
      };
    }

    // 9. Intelligent Default Fallback
    return {
      intent: 'fallback',
      reply: `I want to make sure I get you the exact information you need! \n\n` +
             `You can ask me questions like:\n` +
             `• *"Where is my order ORD-8821?"*\n` +
             `• *"Is the Zenith Slim laptop available in stock?"*\n` +
             `• *"Can I cancel order ORD-9302?"*\n` +
             `• *"What is the status of my refund?"*\n` +
             `• *"What payment methods do you accept?"*`,
      suggestions: [
        'Track Order ORD-8821',
        'Check Product Availability',
        'How to Return an Item',
        'Talk to a Human Agent'
      ]
    };
  }
}

export const nlpEngine = new NLPEngine();
