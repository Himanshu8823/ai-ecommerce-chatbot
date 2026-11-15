import time
import re
from typing import Dict, List, Optional, Any

class ConversationSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.history: List[Dict[str, str]] = [] # [{role: "user"|"assistant"|"system", content: "..."}]
        self.context: Dict[str, Any] = {
            "last_order_id": None,
            "last_product_id": None,
            "last_product_name": None,
            "human_requested": False
        }
        self.last_active = time.time()

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
        self.last_active = time.time()
        # Keep maximum last 20 messages for prompt window
        if len(self.history) > 20:
            self.history = self.history[-20:]

    def update_entities(self, text: str):
        # Look for order ID
        order_match = re.search(r'\b(ORD-\d{4})\b', text, re.IGNORECASE)
        if order_match:
            self.context["last_order_id"] = order_match.group(1).upper()

class ContextManager:
    def __init__(self):
        self.sessions: Dict[str, ConversationSession] = {}

    def get_or_create(self, session_id: Optional[str] = None) -> ConversationSession:
        sid = session_id or "default_user_session"
        if sid not in self.sessions:
            self.sessions[sid] = ConversationSession(sid)
        return self.sessions[sid]

    def clear(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

context_manager = ContextManager()
