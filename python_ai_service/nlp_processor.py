import re
from typing import Dict, Any, Optional
from knowledge_base import knowledge_base
from context_manager import ConversationSession

class NLPProcessor:
    """
    Intelligent Python-based NLP Engine for E-Commerce intent classification,
    entity extraction, and context-aware response routing.
    """

    def process(self, query: str, session: ConversationSession) -> Dict[str, Any]:
        clean_q = query.lower().strip()
        session.update_entities(query)

        # 1. Human Escalation Intent
        human_triggers = ["human", "agent", "real person", "representative", "support team", "operator", "talk to human", "speak with agent", "customer care person"]
        if any(trigger in clean_q for trigger in human_triggers):
            ticket_id = f"TCK-{hash(query + str(session.session_id)) % 900000 + 100000}"
            session.context["human_requested"] = True
            return {
                "intent": "human_escalation",
                "reply": f"🎧 **Live Support Hand-off Activated**\n\n"
                         f"I have notified our senior customer care team. A live support specialist is currently connecting to your chat.\n\n"
                         f"• **Priority Queue**: Position #1\n"
                         f"• **Estimated Wait**: Less than 1 minute\n"
                         f"• **Support Ticket**: `{ticket_id}`\n\n"
                         f"Please feel free to share your specific issue or order number below so our representative has all context ready!",
                "can_escalate": True,
                "ticket_id": ticket_id,
                "suggestions": ["Check order status", "Cancel order", "View FAQs", "Return to AI assistant"]
            }

        # 2. Extract Order ID or use Context
        order_match = re.search(r'\b(ORD-\d{4})\b', query, re.IGNORECASE)
        active_order_id = order_match.group(1).upper() if order_match else session.context.get("last_order_id")

        # 3. Order Tracking & Delivery Status Intent
        tracking_words = ["track", "where is", "delivery", "status", "shipment", "shipped", "courier", "package", "arrive", "transit", "when will"]
        is_tracking = any(w in clean_q for w in tracking_words)

        if order_match or (is_tracking and active_order_id and any(pronoun in clean_q for pronoun in ["it", "my order", "the package", "the order"])):
            order = knowledge_base.get_order(active_order_id)
            if order:
                session.context["last_order_id"] = order["id"]
                return {
                    "intent": "order_tracking",
                    "reply": f"📦 **Live Tracking for {order['id']}**\n\n"
                             f"• **Current Status**: {order['status']} ({order.get('deliveryStatus', 'In Transit')})\n"
                             f"• **Carrier Partner**: {order.get('carrier')} (Tracking: `{order.get('trackingNumber')}`)\n"
                             f"• **Last Checkpoint**: {order.get('currentLocation')}\n"
                             f"• **Estimated Delivery**: {order.get('estimatedDelivery')}\n\n"
                             f"A detailed visual milestone tracker is displayed below.",
                    "data": {"order": order},
                    "suggestions": [f"Cancel {order['id']}", f"Contact {order.get('carrier')}", "Return an item", "Payment info"]
                }
            elif order_match:
                return {
                    "intent": "order_not_found",
                    "reply": f"⚠️ I could not locate order **{active_order_id}** in our active records.\n\n"
                             f"Please verify your Order ID (e.g., `ORD-8821`, `ORD-7749`, `ORD-9302`). If you need human help, let me know!",
                    "suggestions": ["Track ORD-8821", "Track ORD-7749", "Talk to a Human Agent"]
                }

        if is_tracking and not active_order_id:
            orders = knowledge_base.orders
            return {
                "intent": "order_inquiry_general",
                "reply": f"You currently have **{len(orders)} active orders** on file. Which one would you like to track or inspect?",
                "data": {"orders": orders},
                "suggestions": [f"Track {o['id']}" for o in orders[:3]]
            }

        # 4. Cancellation Intent
        cancel_words = ["cancel", "cancellation", "abort order", "stop order"]
        if any(w in clean_q for w in cancel_words):
            if active_order_id:
                cancel_info = knowledge_base.check_cancellation(active_order_id)
                if cancel_info["found"]:
                    order = knowledge_base.get_order(active_order_id)
                    if cancel_info["can_cancel"]:
                        return {
                            "intent": "cancellation_eligible",
                            "reply": f"✅ Order **{active_order_id}** is in **{cancel_info['status']}** status and is eligible for immediate 1-click cancellation.\n\n"
                                     f"Would you like to confirm the cancellation and initiate a 100% refund?",
                            "data": {"order": order, "can_cancel": True},
                            "suggestions": [f"Confirm Cancel {active_order_id}", "Keep Order", "Check Delivery Date"]
                        }
                    else:
                        return {
                            "intent": "cancellation_ineligible",
                            "reply": f"ℹ️ Order **{active_order_id}** cannot be cancelled directly because:\n\n"
                                     f"> *{cancel_info['reason']}*\n\n"
                                     f"Once delivered, you can initiate a **14-day hassle-free return** for a full refund.",
                            "data": {"order": order, "can_cancel": False},
                            "suggestions": [f"Track {active_order_id}", "Return Policy", "Talk to Support Agent"]
                        }
            return {
                "intent": "cancellation_procedure",
                "reply": "Orders in **Processing** or **Confirmed** status can be cancelled free of charge with instant full refund initiation.\n\n"
                         "For instance, order **ORD-9302** is currently in Processing and can be cancelled right now. Which order ID would you like to cancel?",
                "suggestions": ["Cancel ORD-9302", "Cancel ORD-8821", "Return & Refund Policy"]
            }

        # 5. Return & Refund Intent
        return_words = ["return", "exchange", "replacement", "send back"]
        refund_words = ["refund", "money back", "reimbursement", "credit to card", "bank transfer", "refund time"]

        if any(w in clean_q for w in return_words):
            return {
                "intent": "returns_info",
                "reply": "🔄 **14-Day Return & Exchange Policy**\n\n"
                         "• **Window**: 14 days from package delivery confirmation.\n"
                         "• **Condition**: Product in original condition with box and accessories.\n"
                         "• **Pickup**: Free doorstep pickup arranged within 48 hours.\n\n"
                         "Order **ORD-7749** (Aura Smartwatch) was recently delivered and is currently eligible for return.",
                "data": {"eligible_order": "ORD-7749"},
                "suggestions": ["Return ORD-7749", "Check refund status", "Talk to Human Agent"]
            }

        if any(w in clean_q for w in refund_words):
            refund_data = knowledge_base.check_refund_and_return()
            return {
                "intent": "refund_status",
                "reply": "💰 **Refund Status & Timelines**\n\n"
                         "• **Recent Settlement**: Order **ORD-6512** (Apex SoundBar) has been **Refunded ($194.39)** to original Visa card.\n"
                         "• **Bank Acquirer Reference (ARN)**: `ARN-4920194821`\n\n"
                         "**Standard Timelines**:\n"
                         "• Credit/Debit Cards: **3-5 business days**\n"
                         "• UPI & PayPal: **Within 24 hours**\n"
                         "• Cash on Delivery: Direct transfer via NEFT/UPI",
                "data": refund_data,
                "suggestions": ["Track ORD-8821", "Payment queries", "Talk to Support"]
            }

        # 6. Product Information & Availability
        stock_triggers = ["available", "availability", "in stock", "out of stock", "how many left", "inventory"]
        is_stock = any(w in clean_q for w in stock_triggers)

        # Check for pincode
        pincode_match = re.search(r'\b(\d{5,6})\b', query)
        pincode = pincode_match.group(1) if pincode_match else None

        # Check if query matches a known product
        matched_product = knowledge_base.find_product(query)

        if matched_product:
            session.context["last_product_id"] = matched_product["id"]
            session.context["last_product_name"] = matched_product["name"]
            avail = knowledge_base.check_availability(matched_product["id"], pincode)

            stock_text = f"✅ **In Stock**: {avail['stock_count']} units available at {avail['warehouse']}." if avail["in_stock"] else "❌ **Out of Stock**: Restocking in 3-5 days."
            specs_summary = " | ".join([f"{k}: {v}" for k, v in matched_product.get("specifications", {}).items()][:3])

            return {
                "intent": "product_availability" if is_stock else "product_information",
                "reply": f"🔎 **{matched_product['name']}**\n\n"
                         f"• **Price**: ${matched_product['price']:.2f} (Retail: ~~${matched_product['originalPrice']:.2f}~~)\n"
                         f"• **Stock Status**: {stock_text}\n"
                         f"• **Estimated Delivery**: {avail['delivery_estimate']}\n"
                         f"• **Customer Rating**: ⭐ {matched_product.get('rating', 4.8)}/5 ({matched_product.get('reviewCount', 100)} reviews)\n"
                         f"• **Specs**: {specs_summary}\n\n"
                         f"{matched_product.get('description', '')}",
                "data": {"product": matched_product, "availability": avail},
                "suggestions": [f"Delivery estimate for {matched_product['name'].split()[0]}", "View all products", "Track order", "Payment methods"]
            }

        # General product catalog inquiry
        if any(w in clean_q for w in ["product", "products", "item", "catalog", "buy", "headphones", "laptop", "smartwatch"]):
            prods = knowledge_base.products[:3]
            return {
                "intent": "products_catalog",
                "reply": "🛍️ We offer premium electronics across Audio, Wearables, Laptops, Peripherals, and Accessories.\n\n"
                         "Top picks in stock today:\n"
                         "1. **NovaPulse Pro Headphones** ($149.99) - In Stock\n"
                         "2. **Aura Ultra Smartwatch** ($229.00) - In Stock\n"
                         "3. **Zenith Slim 14 Laptop** ($899.99) - In Stock",
                "data": {"products": prods},
                "suggestions": ["NovaPulse Headphones", "Aura Smartwatch", "Zenith Laptop", "Check stock availability"]
            }

        # 7. Payment Inquiries
        payment_triggers = ["payment", "pay", "credit card", "debit card", "upi", "paypal", "cod", "cash on delivery", "failed transaction", "charged twice", "debited"]
        if any(w in clean_q for w in payment_triggers):
            return {
                "intent": "payment_inquiry",
                "reply": "💳 **Supported Payment Methods & Billing Assistance**\n\n"
                         "• **Cards**: Visa, MasterCard, Amex (256-bit encrypted checkout)\n"
                         "• **Digital Wallets**: PayPal, Apple Pay, Google Pay\n"
                         "• **Instant Transfer**: UPI & Net Banking\n"
                         "• **Doorstep**: Cash on Delivery (COD) on orders up to $250\n\n"
                         "⚠️ **Failed Transaction?** If your bank debited your account without generating an order, funds are automatically reversed by the banking network within 48-72 business hours.",
                "suggestions": ["Failed payment help", "Refund status", "Track my order", "Talk to human agent"]
            }

        # 8. FAQ Knowledge Match
        faq = knowledge_base.search_faqs(query)
        if faq:
            return {
                "intent": "faq_answer",
                "reply": f"❓ **{faq['question']}**\n\n{faq['answer']}",
                "data": {"faq": faq},
                "suggestions": ["Track an order", "Product stock", "Return policy", "Contact human agent"]
            }

        # 9. Greetings
        if any(clean_q.startswith(g) or clean_q == g for g in ["hi", "hello", "hey", "good morning", "good evening", "greetings"]):
            return {
                "intent": "greeting",
                "reply": "👋 Hello! I am your **AI E-Commerce Assistant** powered by Python NLP & OpenAI.\n\n"
                         "I can assist you with:\n"
                         "• 📦 Live Order Tracking (e.g., `ORD-8821`)\n"
                         "• 🔍 Real-Time Stock Availability\n"
                         "• 💳 Payment & Invoicing Queries\n"
                         "• 🔄 Cancellations, Returns & Refunds\n"
                         "• 🎧 Connecting to a Human Agent\n\n"
                         "How may I help you today?",
                "suggestions": ["Track Order ORD-8821", "Check NovaPulse stock", "Cancel ORD-9302", "How do returns work?"]
            }

        # 10. Default Fallback with Human Escalation Option
        return {
            "intent": "fallback_with_escalation",
            "reply": "I'm not completely certain I understood your exact request, but I want to make sure you get the right answer right away!\n\n"
                     "You can ask me to track an order (e.g. *'Track ORD-8821'*), check stock for a product, or ask about returns.\n\n"
                     "Would you like me to connect you with a **Live Human Support Agent**?",
            "can_escalate": True,
            "suggestions": [
                "Talk to Human Agent",
                "Track Order ORD-8821",
                "Check Product Availability",
                "Return & Refund Policy"
            ]
        }

nlp_processor = NLPProcessor()
