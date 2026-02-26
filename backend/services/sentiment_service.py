from textblob import TextBlob

def analyze_sentiment(text: str):
    text_lower = text.lower()

    # Only genuinely angry/negative words — removed "now" and "immediately"
    # which are urgency words, not anger words
    anger_keywords = [
        "ridiculous", "worst", "furious", "so angry", "i am angry",
        "i'm angry", "useless", "terrible", "i hate", "this is awful",
        "worst service", "unacceptable", "disgusting", "pathetic"
    ]

    positive_keywords = [
        "thank", "thanks", "great", "awesome", "excellent", "perfect",
        "love it", "happy", "satisfied", "wonderful", "amazing", "good job"
    ]

    for phrase in anger_keywords:
        if phrase in text_lower:
            return "angry", 80

    for phrase in positive_keywords:
        if phrase in text_lower:
            return "positive", 75

    # TextBlob for everything else
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    if polarity <= -0.25:
        # Map -0.25 to -1.0  →  score 25 to 100
        score = min(100, abs(polarity) * 100)
        return "angry", round(score, 1)

    elif polarity >= 0.25:
        score = min(100, polarity * 100)
        return "positive", round(score, 1)

    else:
        # Neutral — give a meaningful score based on how close to 0
        # polarity range -0.25 to +0.25 → score 0 to 25
        score = round(abs(polarity) * 40, 1)
        return "neutral", score