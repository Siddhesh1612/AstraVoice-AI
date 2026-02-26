import re

def detect_intent(text: str):
    t = text.lower()

    # ── Refund ─────────────────────────────────────────────────────────────
    if any(w in t for w in [
        "refund", "money back", "return", "reimburse", "reimbursement",
        "charge back", "chargeback", "paid but", "not received refund"
    ]):
        return "refund_request"

    # ── Order status ───────────────────────────────────────────────────────
    if any(w in t for w in [
        "order status", "where is my order", "track", "tracking",
        "where is my", "delivery status", "shipment", "shipped", "dispatch",
        "when will", "expected delivery", "order number", "package"
    ]):
        return "order_status"

    # ── Cancellation ───────────────────────────────────────────────────────
    if any(w in t for w in [
        "cancel", "cancellation", "stop", "terminate", "end subscription",
        "unsubscribe", "close account", "delete account", "dont want"
    ]):
        return "cancellation_request"

    # ── Complaint ──────────────────────────────────────────────────────────
    if any(w in t for w in [
        "complaint", "complain", "issue", "problem", "broken", "not working",
        "damaged", "defective", "wrong item", "wrong product", "bad experience",
        "disappointed", "unsatisfied", "not happy", "cheated", "fraud"
    ]):
        return "complaint"

    # ── Payment / billing ──────────────────────────────────────────────────
    if any(w in t for w in [
        "payment", "pay", "bill", "billing", "invoice", "charge",
        "transaction", "deducted", "amount", "price", "cost", "fee"
    ]):
        return "payment_inquiry"

    # ── Account / login ────────────────────────────────────────────────────
    if any(w in t for w in [
        "account", "login", "sign in", "password", "forgot password",
        "reset", "locked", "access", "profile", "username"
    ]):
        return "account_support"

    # ── General support / help ─────────────────────────────────────────────
    if any(w in t for w in [
        "help", "support", "assist", "how to", "how do i", "guide",
        "explain", "what is", "tell me", "information", "info"
    ]):
        return "support_request"

    # ── Greeting ───────────────────────────────────────────────────────────
    if any(w in t for w in [
        "hello", "hi", "hey", "namaste", "namaskar", "good morning",
        "good evening", "good afternoon", "how are you", "kaise ho",
        "kasa aahe", "helo", "hii"
    ]):
        return "greeting"

    return "general_query"