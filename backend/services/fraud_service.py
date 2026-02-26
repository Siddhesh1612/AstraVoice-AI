import re

def detect_fraud(text: str):
    text_lower = text.lower()

    score = 0

    # ── High-risk patterns (someone asking FOR sensitive data) ─────────────
    # These phrases suggest social engineering / phishing
    high_risk_patterns = [
        r"share your (otp|password|pin|cvv)",
        r"send (me |us )?(your )?(otp|password|pin|cvv)",
        r"tell (me|us) your (otp|password|pin|cvv)",
        r"what is your (password|pin|otp|cvv)",
        r"verify (your |the )?(otp|password|account)",
        r"confirm (your )?(otp|password|pin)",
        r"provide (your )?(otp|password|cvv|pin)",
        r"urgent.*transfer",
        r"transfer.*urgent",
        r"wire.*immediately",
        r"immediately.*wire",
        r"lottery|you (have |'ve )won",
        r"click this link.*account",
        r"your account (will be|has been) (suspended|blocked|frozen)",
        r"act now.*account",
    ]

    for pattern in high_risk_patterns:
        if re.search(pattern, text_lower):
            score += 35

    # ── Medium-risk: mentioning sensitive info unprompted ──────────────────
    # User volunteering their own OTP/password is suspicious
    medium_risk_patterns = [
        r"my otp is",
        r"my password is",
        r"my pin is",
        r"my cvv is",
        r"account number is \d+",
        r"card number is",
    ]

    for pattern in medium_risk_patterns:
        if re.search(pattern, text_lower):
            score += 25

    # ── Low-risk: general financial words in normal context ────────────────
    # Just mentioning "bank" or "transfer" is NOT fraud
    # Only flag if combined with urgency/pressure language
    urgency_words = ["urgent", "immediately", "right now", "asap", "emergency", "quick"]
    finance_words = ["transfer", "bank account", "credit card", "debit card", "payment"]

    has_urgency  = any(w in text_lower for w in urgency_words)
    has_finance  = any(w in text_lower for w in finance_words)

    if has_urgency and has_finance:
        score += 20

    return min(round(score, 1), 100)