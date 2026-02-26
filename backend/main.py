from fastapi import FastAPI
from routes.chat_route import router as chat_router
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

def init_db():
    conn = sqlite3.connect("Database.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT,
            response TEXT,
            sentiment TEXT,
            escalation_score INTEGER,
            fraud_score INTEGER,
            language TEXT
        )
    """)

    conn.commit()
    conn.close()

init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)