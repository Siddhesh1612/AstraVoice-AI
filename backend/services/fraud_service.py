def detect_fraud(text: str):
    risky_keywords = [
        "otp",
        "password",
        "bank",
        "account number",
        "transfer",
        "credit card",
        "debit card",
        "cvv",
        "pin"
    ]

    score = 0

    for word in risky_keywords:
        if word in text.lower():
            score += 20

    return min(score, 100)