"""API module for FastAPI application."""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from .openai_client import OpenAIClient

app = FastAPI()
client = OpenAIClient()

class ChatRequest(BaseModel):
    system_message: Optional[str] = None
    message: str
    model: Optional[str] = None

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = await client.chat(
            system_message=request.system_message,
            message=request.message,
            model=request.model
        )
        return ChatResponse(response=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))