import os
import json
from typing import Dict, Any, List, Optional
from openai import OpenAI
from knowledge_base import knowledge_base
from context_manager import ConversationSession

class OpenAIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.client = None
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"[OpenAIService] Warning: OpenAI client initialization failed: {e}")

    def is_available(self) -> bool:
        return bool(self.client and self.api_key and not self.api_key.startswith("your_"))

    def get_system_prompt(self, session: ConversationSession) -> str:
        ctx = session.context
        last_order = ctx.get("last_order_id") or "None"
        last_prod = ctx.get("last_product_name") or "None"

        return (
            "You are OmniBot, an advanced, polite, and helpful AI Customer Support Assistant for an e-commerce platform.\n"
            "Your responsibilities:\n"
            "1. Answer product questions accurately (specs, price, warranties).\n"
            "2. Check live product availability and warehouse stock.\n"
            "3. Track customer orders and provide real-time delivery status using Order IDs (e.g., ORD-8821, ORD-7749, ORD-9302).\n"
            "4. Guide customers on cancellations, return procedures (14-day window), and refund timelines (ARN numbers).\n"
            "5. Answer payment queries (Cards, UPI, COD, PayPal) and resolve failed transactions.\n"
            "6. Always maintain conversation context (active order: " + last_order + ", active product: " + last_prod + ").\n"
            "7. IF YOU CANNOT CONFIDENTLY RESOLVE A QUESTION OR THE CUSTOMER ASKS FOR A HUMAN, explicitly offer to connect them to a Live Human Support Agent.\n\n"
            "Format your answers with clean markdown, bullet points, and bold text for easy reading. Keep responses friendly, professional, and concise."
        )

    def execute_tool(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        if name == "track_order":
            order_id = args.get("order_id", "")
            order = knowledge_base.get_order(order_id)
            return {"order": order} if order else {"error": f"Order {order_id} not found"}
        
        elif name == "check_product_stock":
            product_name = args.get("product_name", "")
            pincode = args.get("pincode")
            return knowledge_base.check_availability(product_name, pincode)
        
        elif name == "check_cancellation":
            order_id = args.get("order_id", "")
            return knowledge_base.check_cancellation(order_id)
        
        elif name == "check_refund_and_return":
            order_id = args.get("order_id")
            return knowledge_base.check_refund_and_return(order_id)
        
        elif name == "escalate_to_human_agent":
            return {
                "escalated": True,
                "ticket_id": f"TCK-{hash(str(args)) % 900000 + 100000}",
                "message": "Senior care specialist dispatched to session."
            }
        
        return {"error": f"Unknown tool: {name}"}

    def chat(self, user_message: str, session: ConversationSession) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            return None

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "track_order",
                    "description": "Look up real-time delivery tracking and carrier status for an order ID",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "order_id": {"type": "string", "description": "The order ID such as ORD-8821, ORD-7749"}
                        },
                        "required": ["order_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "check_product_stock",
                    "description": "Check warehouse inventory, stock count and delivery estimate for a product",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "product_name": {"type": "string", "description": "The name or ID of the product"},
                            "pincode": {"type": "string", "description": "Optional customer postal zip code"}
                        },
                        "required": ["product_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "check_cancellation",
                    "description": "Check if an order can be cancelled and get cancellation policy details",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "order_id": {"type": "string", "description": "The order ID to check"}
                        },
                        "required": ["order_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "check_refund_and_return",
                    "description": "Check return eligibility, return policy, and bank refund ARN status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "order_id": {"type": "string", "description": "Optional specific order ID"}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "escalate_to_human_agent",
                    "description": "Transfer customer to a live human support specialist when customer requests or issue cannot be answered",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "reason": {"type": "string", "description": "Reason for human handoff"}
                        },
                        "required": ["reason"]
                    }
                }
            }
        ]

        messages = [{"role": "system", "content": self.get_system_prompt(session)}]
        for h in session.history[-6:]:
            messages.append(h)
        messages.append({"role": "user", "content": user_message})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=0.7
            )
            msg = response.choices[0].message

            # Handle tool calls
            tool_data = {}
            if msg.tool_calls:
                for tool_call in msg.tool_calls:
                    fn_name = tool_call.function.name
                    fn_args = json.loads(tool_call.function.arguments or "{}")
                    result = self.execute_tool(fn_name, fn_args)
                    tool_data[fn_name] = result

                # Send tool results back to OpenAI for final natural language generation
                messages.append(msg)
                for tool_call in msg.tool_calls:
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(tool_data.get(tool_call.function.name, {}))
                    })
                
                final_res = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7
                )
                final_reply = final_res.choices[0].message.content
                return {
                    "reply": final_reply,
                    "engine": "openai",
                    "tool_data": tool_data,
                    "suggestions": ["Track an order", "Check product stock", "Talk to Human Agent"]
                }
            
            return {
                "reply": msg.content or "How else can I assist you with your shopping today?",
                "engine": "openai",
                "suggestions": ["Track an order", "Check product stock", "Return policy", "Talk to Human Agent"]
            }

        except Exception as e:
            print(f"[OpenAIService] API error: {e}. Falling back to Python NLP processor.")
            return None

openai_service = OpenAIService()
