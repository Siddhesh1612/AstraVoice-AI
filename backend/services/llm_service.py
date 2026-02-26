import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_llm_response(message, intent, sentiment, escalation_score, fraud_score):

    prompt = f"""
You are AstraVoice, a multilingual enterprise AI voice assistant.

Intent: {intent}
Sentiment: {sentiment}
Escalation Score: {escalation_score}
Fraud Score: {fraud_score}

User message:
{message}

Instructions:
- Detect language automatically.
- Respond in same language.
- If escalation_score > 70 → say you are transferring to human.
- If fraud_score > 40 → warn about security risk.
- Keep response concise and voice-friendly.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text