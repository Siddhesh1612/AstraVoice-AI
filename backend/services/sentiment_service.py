from textblob import TextBlob

def analyze_sentiment(text: str):
    text_lower = text.lower()

    # 🔥 Strong negative keyword override
    anger_keywords = [
        "ridiculous",
        "worst",
        "angry",
        "frustrated",
        "useless",
        "terrible",
        "hate",
        "now",
        "immediately"
    ]

    for word in anger_keywords:
        if word in text_lower:
            return "angry", 80

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    if polarity < -0.1:   # ← reduce threshold
        return "angry", abs(polarity) * 100

    elif polarity > 0.3:
        return "positive", polarity * 100

    else:
        return "neutral", 50