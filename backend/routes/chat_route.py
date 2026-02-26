from fastapi import APIRouter
from pydantic import BaseModel

from services.intent_service import detect_intent
from services.sentiment_service import analyze_sentiment
from services.fraud_service import detect_fraud
from services.escalation_service import calculate_escalation
from services.response_service import generate_response
from services.llm_service import generate_llm_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    failed_attempts: int = 0

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

    response_text = generate_llm_response(
        request.message,
        intent,
        sentiment_label,
        escalation_score,
        fraud_score
    )

    return{
        "intent": intent,
        "sentiment": sentiment_label,
        "sentiment_score": sentiment_score,
        "fraud_score": fraud_score,
        "escalation_score": escalation_score,
        "response": response_text
    }