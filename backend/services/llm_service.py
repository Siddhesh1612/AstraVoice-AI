import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL = "meta-llama/llama-3.1-8b-instruct"


def generate_llm_response(message, intent, sentiment, escalation_score, fraud_score):

    system_prompt = f"""
You are AstraVoice, a professional enterprise AI assistant.

CRITICAL LANGUAGE RULES:
- Respond in ONLY ONE language.
- Use EXACTLY the same language as the user's message.
- Do NOT translate.
- Do NOT repeat the answer in another language.
- Do NOT provide bilingual output.
- Do NOT mix languages.

RESPONSE STYLE:
- Keep it short.
- Make it natural and conversational.
- No extra explanations.

Business Context:
Intent: {intent}
Sentiment: {sentiment}
Escalation Score: {escalation_score}
Fraud Score: {fraud_score}

Operational Rules:
- If escalation_score > 70 → politely transfer to human agent.
- If fraud_score > 40 → warn about possible security risk.
"""

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": message}
        ],
        "temperature": 0.6,
        "max_tokens": 300,
        "top_p": 0.9
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "AstraVoice"
    }

    try:
        response = requests.post(
            OPENROUTER_URL,
            json=payload,
            headers=headers,
            timeout=20
        )

        data = response.json()

        if "choices" in data:
            reply = data["choices"][0]["message"]["content"].strip()
            return reply, None
        else:
            print("OpenRouter Error:", data)
            return "System temporarily unavailable.", None

    except Exception as e:
        print("LLM Error:", e)
        return "System temporarily unavailable.", None