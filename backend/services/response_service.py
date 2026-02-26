def generate_response(intent, sentiment, escalation_score, fraud_score=0):

    if fraud_score >= 40:
        return "Warning: This conversation contains sensitive financial information. Please do not share OTPs or banking details. Escalating for security review."

    if escalation_score > 70:
        return "I understand your frustration. I'm escalating this to a human representative immediately."

    if intent == "refund_request":
        if sentiment == "angry":
            return "I sincerely apologize for the inconvenience. Let me process your refund right away."
        return "Sure, I can help you with your refund request."

    if intent == "order_status":
        return "Let me check your order status for you."

    if intent == "complaint":
        return "I'm sorry to hear that. Please provide more details so I can assist you."

    if intent == "cancellation_request":
        return "I can help you cancel your request. Please confirm the details."

    if intent == "support_request":
        return "I'm here to help. Please tell me more about the issue."

    return "How can I assist you today?"