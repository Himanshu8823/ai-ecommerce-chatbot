import json
import os
from typing import Dict, List, Optional, Any
import pymysql

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "data"))

def _load_json(filename: str) -> Any:
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

class KnowledgeBase:
    def __init__(self):
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_user = os.getenv("DB_USER", "root")
        self.db_pass = os.getenv("DB_PASSWORD", "")
        self.db_name = os.getenv("DB_NAME", "ecommerce_chatbot_db")
        self.db_port = int(os.getenv("DB_PORT", 3306))
        self.using_mysql = False
        self.reload()

    def _get_mysql_connection(self):
        try:
            return pymysql.connect(
                host=self.db_host,
                user=self.db_user,
                password=self.db_pass,
                database=self.db_name,
                port=self.db_port,
                cursorclass=pymysql.cursors.DictCursor,
                connect_timeout=2
            )
        except Exception:
            return None

    def reload(self):
        # Try loading from MySQL first
        conn = self._get_mysql_connection()
        if conn:
            try:
                with conn.cursor() as cursor:
                    # Load products
                    cursor.execute("SELECT * FROM products")
                    db_products = cursor.fetchall()
                    if db_products:
                        self.products = [
                            {
                                "id": p.get("product_code") or f"PROD-{p['id']}",
                                "name": p["name"],
                                "category": p["category"],
                                "price": float(p["price"]),
                                "originalPrice": float(p.get("original_price") or p["price"]),
                                "rating": float(p.get("rating", 4.8)),
                                "reviewCount": p.get("review_count", 100),
                                "stock": p.get("stock_quantity", 0),
                                "status": p.get("status", "In Stock"),
                                "image": p.get("image_url", ""),
                                "description": p.get("description", ""),
                                "specifications": json.loads(p["specifications"]) if isinstance(p.get("specifications"), str) else (p.get("specifications") or {}),
                                "warehouse": p.get("warehouse_location", "Dallas Hub, TX"),
                                "deliveryEstimate": p.get("delivery_estimate", "2-3 business days")
                            }
                            for p in db_products
                        ]

                    # Load orders with delivery info
                    cursor.execute("""
                        SELECT o.*, 
                               d.carrier_name, d.tracking_number, d.delivery_status AS del_status, 
                               d.current_location, d.courier_phone, d.estimated_delivery_date, d.timeline_milestones,
                               p.payment_method, p.payment_status, p.payment_reference
                        FROM orders o
                        LEFT JOIN deliveries d ON d.order_id = o.id
                        LEFT JOIN payments p ON p.order_id = o.id
                    """)
                    db_orders = cursor.fetchall()
                    if db_orders:
                        self.orders = [
                            {
                                "id": o.get("order_code") or f"ORD-{o['id']}",
                                "status": o.get("status"),
                                "deliveryStatus": o.get("del_status") or o.get("delivery_status", "On Schedule"),
                                "carrier": o.get("carrier_name", "BlueDart Express"),
                                "trackingNumber": o.get("tracking_number", "BLD-998822104"),
                                "estimatedDelivery": str(o.get("estimated_delivery_date", "2-3 business days")),
                                "currentLocation": o.get("current_location", "Regional Sorting Hub"),
                                "courierPhone": o.get("courier_phone", "+1 (800) 463-3339"),
                                "timeline": json.loads(o["timeline_milestones"]) if isinstance(o.get("timeline_milestones"), str) else (o.get("timeline_milestones") or []),
                                "payment": {
                                    "method": o.get("payment_method", "Credit Card"),
                                    "paymentStatus": o.get("payment_status", "Paid"),
                                    "transactionId": o.get("payment_reference", "TXN-90218821"),
                                    "total": float(o.get("total_amount", 0.0))
                                },
                                "cancellation": {
                                    "canCancel": bool(o.get("can_cancel")),
                                    "reasonCannotCancel": o.get("cancellation_reason")
                                }
                            }
                            for o in db_orders
                        ]

                    # Load FAQs
                    cursor.execute("SELECT * FROM faqs WHERE is_active = TRUE")
                    db_faqs = cursor.fetchall()
                    if db_faqs:
                        self.faqs = [
                            {
                                "id": f"faq-{f['id']}",
                                "category": f["category"],
                                "question": f["question"],
                                "answer": f["answer"],
                                "keywords": json.loads(f["keywords"]) if isinstance(f.get("keywords"), str) else (f.get("keywords") or [])
                            }
                            for f in db_faqs
                        ]

                self.using_mysql = True
                conn.close()
                return
            except Exception as e:
                print(f"[KnowledgeBase] Warning: Failed to query MySQL ({e}). Using JSON fallback.")
                if conn: conn.close()

        # Fallback to JSON database files
        self.using_mysql = False
        self.products: List[Dict[str, Any]] = _load_json("products.json")
        self.orders: List[Dict[str, Any]] = _load_json("orders.json")
        self.faqs: List[Dict[str, Any]] = _load_json("faqs.json")

    def find_product(self, query: str) -> Optional[Dict[str, Any]]:
        self.reload()
        q = query.lower().strip()
        for p in self.products:
            if p["id"].lower() == q or p["name"].lower() == q:
                return p
        for p in self.products:
            if q in p["name"].lower() or p["category"].lower() in q:
                return p
            words = [w for w in p["name"].lower().split() if len(w) > 3]
            if any(w in q for w in words):
                return p
        return None

    def search_products(self, query: str) -> List[Dict[str, Any]]:
        self.reload()
        q = query.lower().strip()
        matched = []
        for p in self.products:
            if q in p["name"].lower() or q in p["category"].lower() or q in p.get("description", "").lower():
                matched.append(p)
        return matched or self.products[:3]

    def check_availability(self, product_identifier: str, pincode: Optional[str] = None) -> Dict[str, Any]:
        p = self.find_product(product_identifier)
        if not p:
            return {"found": False, "message": f"Product '{product_identifier}' not found in catalog."}
        
        in_stock = p.get("stock", 0) > 0
        eta = p.get("deliveryEstimate", "2-4 business days")
        if pincode:
            eta = "1-2 business days (Express)" if pincode.startswith("7") else "3-4 business days (Standard)"

        return {
            "found": True,
            "product": p,
            "in_stock": in_stock,
            "stock_count": p.get("stock", 0),
            "warehouse": p.get("warehouse", "Regional Distribution Hub"),
            "delivery_estimate": eta
        }

    def get_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        self.reload()
        order_clean = order_id.upper().strip()
        for o in self.orders:
            if o["id"] == order_clean:
                return o
        return None

    def check_cancellation(self, order_id: str) -> Dict[str, Any]:
        o = self.get_order(order_id)
        if not o:
            return {"found": False, "message": f"Order {order_id} not found."}
        
        can_cancel = o.get("cancellation", {}).get("canCancel", False)
        reason = o.get("cancellation", {}).get("reasonCannotCancel", "")
        return {
            "found": True,
            "order_id": o["id"],
            "status": o.get("status"),
            "can_cancel": can_cancel,
            "reason": reason if not can_cancel else "Eligible for immediate one-click cancellation."
        }

    def check_refund_and_return(self, order_id: Optional[str] = None) -> Dict[str, Any]:
        self.reload()
        if order_id:
            o = self.get_order(order_id)
            if not o:
                return {"found": False, "message": f"Order {order_id} not found."}
            ret = o.get("return", {})
            return {
                "found": True,
                "order_id": o["id"],
                "status": o.get("status"),
                "is_eligible_for_return": ret.get("eligible", False),
                "return_status": ret.get("returnStatus"),
                "refund_status": ret.get("refundStatus"),
                "refund_reference": ret.get("refundReference")
            }
        
        refunded = [o for o in self.orders if o.get("status") == "Refunded"]
        return {
            "found": True,
            "refunded_orders": refunded,
            "policy": "14-day return window from delivery date. Refunds reflect in 3-5 business days."
        }

    def search_faqs(self, query: str) -> Optional[Dict[str, Any]]:
        self.reload()
        q = query.lower()
        for f in self.faqs:
            for kw in f.get("keywords", []):
                if kw in q:
                    return f
            if q in f.get("question", "").lower():
                return f
        return None

knowledge_base = KnowledgeBase()
