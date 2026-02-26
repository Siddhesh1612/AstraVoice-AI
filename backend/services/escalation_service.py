def calculate_escalation(sentiment_score, fraud_score, failed_attempts):
    escalation = (
        (sentiment_score * 0.5) +
        (fraud_score * 0.3) +
        (failed_attempts * 25)
    )

    return min(round(escalation, 2), 100)