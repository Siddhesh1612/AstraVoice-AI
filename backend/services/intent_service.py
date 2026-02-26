def detect_intent(text: str):
    text = text.lower()

    if "refund" in text:
        return "refund_request"

    elif "order" in text and "status" in text:
        return "order_status"

    elif "complaint" in text:
        return "complaint"

    elif "cancel" in text:
        return "cancellation_request"

    elif "help" in text:
        return "support_request"

    else:
        return "general_query"