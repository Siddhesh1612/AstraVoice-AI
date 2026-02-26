def calculate_escalation(sentiment_score, fraud_score, failed_attempts):
    """
    Escalation score 0-100.

    sentiment_score meaning depends on sentiment_label:
      - angry    → higher score = more escalation
      - neutral  → low score (0-25), minimal escalation weight
      - positive → score is positivity, REDUCES escalation

    We receive the raw score here without the label, so we weight
    fraud and failed_attempts more heavily as hard signals.
    """

    # fraud_score is the clearest hard signal
    fraud_weight = fraud_score * 0.45

    # sentiment_score: capped contribution, neutral scores stay low
    sentiment_weight = min(sentiment_score, 80) * 0.35

    # failed_attempts: each failed attempt is a strong escalation trigger
    attempt_weight = min(failed_attempts * 20, 40)

    escalation = fraud_weight + sentiment_weight + attempt_weight

    return min(round(escalation, 1), 100)