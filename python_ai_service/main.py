import os
import sys
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from context_manager import context_manager
from nlp_processor import nlp_processor
from openai_service import openai_service
from knowledge_base import knowledge_base

app = FastAPI(
    title="E-Commerce AI Customer Support Service",
    description="Python & NLP Powered E-Commerce Chatbot with OpenAI Integration",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_user_session"
    context: Optional[Dict[str, Any]] = None

class EscalateRequest(BaseModel):
    session_id: Optional[str] = "default_user_session"
    reason: Optional[str] = "Customer requested human support"

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Python AI E-Commerce Chatbot Service",
        "python_version": sys.version,
        "openai_available": openai_service.is_available(),
        "openai_model": openai_service.model,
        "products_indexed": len(knowledge_base.products),
        "orders_indexed": len(knowledge_base.orders),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    clean_msg = req.message.strip()
    session = context_manager.get_or_create(req.session_id)

    # 1. Update session history
    session.add_message("user", clean_msg)

    # 2. Try OpenAI API first if API key is provided
    openai_res = None
    if openai_service.is_available():
        try:
            openai_res = openai_service.chat(clean_msg, session)
        except Exception as e:
            print(f"[Chat] OpenAI call failed: {e}")

    if openai_res:
        reply_text = openai_res["reply"]
        session.add_message("assistant", reply_text)
        return {
            "success": True,
            "reply": reply_text,
            "engine": "OpenAI " + openai_service.model,
            "intent": "openai_tool_assisted",
            "data": openai_res.get("tool_data", {}),
            "suggestions": openai_res.get("suggestions", ["Track an order", "Check product stock", "Contact Human Agent"]),
            "timestamp": datetime.utcnow().isoformat()
        }

    # 3. Intelligent Python NLP Engine (Rule + Entity + Context)
    nlp_res = nlp_processor.process(clean_msg, session)
    session.add_message("assistant", nlp_res["reply"])

    return {
        "success": True,
        "reply": nlp_res["reply"],
        "engine": "Python NLP Engine",
        "intent": nlp_res.get("intent", "general"),
        "data": nlp_res.get("data", {}),
        "can_escalate": nlp_res.get("can_escalate", False),
        "suggestions": nlp_res.get("suggestions", ["Track an order", "View catalog", "Talk to human agent"]),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/escalate")
async def escalate_endpoint(req: EscalateRequest):
    session = context_manager.get_or_create(req.session_id)
    session.context["human_requested"] = True
    ticket_id = f"TCK-{hash(req.session_id + str(datetime.utcnow())) % 900000 + 100000}"

    msg = f"Your request has been escalated to a senior support representative. Ticket: `{ticket_id}`."
    session.add_message("assistant", msg)

    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": msg,
        "queue_position": 1,
        "eta": "< 1 minute"
    }

@app.post("/api/context/clear")
async def clear_context(session_id: Optional[str] = "default_user_session"):
    context_manager.clear(session_id)
    return {"success": True, "message": f"Context cleared for session {session_id}."}

if __name__ == "__main__":
    # Ensure UTF-8 output on Windows
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"[Python AI Service] Running at http://127.0.0.1:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
