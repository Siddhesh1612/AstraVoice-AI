from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3
import re

from services.intent_service import detect_intent
from services.sentiment_service import analyze_sentiment
from services.fraud_service import detect_fraud
from services.escalation_service import calculate_escalation
from services.llm_service import generate_llm_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    failed_attempts: int = 0


# Ensure table exists
def init_db():
    conn = sqlite3.connect("Database.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT,
            response TEXT,
            sentiment TEXT,
            escalation_score INTEGER,
            fraud_score INTEGER,
            language TEXT
        )
    """)

    conn.commit()
    conn.close()

init_db()


@router.post("/chat")
def chat(request: ChatRequest):

    intent = detect_intent(request.message)
    sentiment_label, sentiment_score = analyze_sentiment(request.message)
    fraud_score = detect_fraud(request.message)

    escalation_score = calculate_escalation(
        sentiment_score,
        fraud_score,
        request.failed_attempts
    )

    # Language detection
    if re.search(r'[\u0900-\u097F]', request.message):
        detected_language = "hi-IN"
    else:
        detected_language = "en-IN"

    response_text, _ = generate_llm_response(
        request.message,
        intent,
        sentiment_label,
        escalation_score,
        fraud_score
    )

    conn = sqlite3.connect("Database.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO chats 
        (message, response, sentiment, escalation_score, fraud_score, language)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        request.message,
        response_text,
        sentiment_label,
        escalation_score,
        fraud_score,
        detected_language
    ))

    conn.commit()
    conn.close()

    return {
        "intent": intent,
        "sentiment": sentiment_label,
        "sentiment_score": sentiment_score,
        "fraud_score": fraud_score,
        "escalation_score": escalation_score,
        "language": detected_language,
        "response": response_text,
        "audio": None
    }


@router.get("/history")
def get_history():
    conn = sqlite3.connect("Database.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, message, response 
        FROM chats 
        ORDER BY id DESC 
        LIMIT 10
    """)

    rows = cursor.fetchall()
    conn.close()

    history = [
        {
            "id": row[0],
            "message": row[1],
            "response": row[2]
        }
        for row in rows
    ]

    return {"history": history}


@router.delete("/history/{chat_id}")
def delete_chat(chat_id: int):
    conn = sqlite3.connect("Database.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM chats WHERE id = ?", (chat_id,))
    conn.commit()
    conn.close()

    return {"message": "Chat deleted"}


@router.delete("/history")
def clear_history():
    conn = sqlite3.connect("Database.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM chats")
    conn.commit()
    conn.close()

    return {"message": "All chats cleared"}