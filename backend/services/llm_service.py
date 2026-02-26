import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_llm_response(message, intent, sentiment, escalation_score, fraud_score):

    prompt = f"""
You are AstraVoice — an advanced multilingual AI voice assistant 
for Indian enterprise customers.

Personality:
- Professional
- Calm
- Emotionally intelligent
- Natural human tone
- Not robotic

Context:
Intent: {intent}
Sentiment: {sentiment}
Escalation Score: {escalation_score}
Fraud Score: {fraud_score}

User Message:
{message}

Rules:
1. Detect user language automatically.
2. Respond in the SAME language.
3. If escalation_score > 70 → apologize and say you are transferring to a human agent.
4. If fraud_score > 40 → warn politely about security risks and OTP sharing.
5. Keep response short, conversational, and voice-friendly.
"""

    text_response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    response_text = text_response.text.strip()

    return response_text, None