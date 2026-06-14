import os
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI(title="NovaBite Insights - Operational Gemini Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "novabite.db"

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

class ChatRequest(BaseModel):
    message: str

def get_db_schema():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        schema_text = ""
        for table_name, create_sql in tables:
            schema_text += f"Table: {table_name}\nCreation Query: {create_sql}\n\n"
        return schema_text

@app.post("/api/chat")
def process_text_to_sql(request: ChatRequest):
    global client
    if not client:
        return {"answer": "Gemini API Key is missing inside the .env context layer.", "sql_query": None, "error": True}

    schema = get_db_schema()
    user_prompt = request.message

    try:
        # Phase 1: Text-to-SQL Generation
        sql_system_prompt = (
            f"You are an expert SQL generator. Given this SQLite Schema:\n{schema}\n"
            "Generate ONLY a valid SQLite query based on the user's question. "
            "Do not wrap it in markdown code blocks, do not write text, output raw SQL string only."
        )
        
        sql_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=sql_system_prompt,
                temperature=0.0
            )
        )
        generated_sql = sql_response.text.replace("```sql", "").replace("```", "").strip()

        # Phase 2: Database Execution
        db_result = []
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(generated_sql)
            db_result = [dict(row) for row in cursor.fetchmany(10)]

        # Phase 3: Response Synthesis
        synthesis_system_prompt = (
            "You are NovaBite Insights executive assistant. Translate the raw database result "
            "into a concise, professional, human-readable answer that directly responds to the user's question."
        )
        
        final_prompt = f"Question: {user_prompt}\nSQL Query: {generated_sql}\nDatabase Result: {db_result}"
        
        synthesis_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=final_prompt,
            config=types.GenerateContentConfig(
                system_instruction=synthesis_system_prompt,
                temperature=0.3
            )
        )
        human_answer = synthesis_response.text.strip()

        return {
            "answer": human_answer,
            "sql_query": generated_sql,
            "error": None
        }

    except Exception as e:
        return {
            "answer": "Failed to compile semantic relational logic successfully via Gemini Layer.",
            "sql_query": generated_sql if 'generated_sql' in locals() else None,
            "error": str(e)
        }