# openai_client.py
import os
from typing import Optional
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

class OpenAIClient:
    def __init__(self, api_key: Optional[str] = None):
        # pick up key from ctor or ENV
        key = api_key or os.getenv("OPENAI_API_KEY")
        if not key:
            raise RuntimeError("OPENAI_API_KEY not set")
        self.client = AsyncOpenAI(api_key=key)

    async def chat(
        self,
        system_message: Optional[str],
        message: str,
        model: Optional[str] = None
    ) -> str:
        # default model if none provided
        model = model or "gpt-3.5-turbo"
        msgs = []
        if system_message:
            msgs.append({"role": "system", "content": system_message})
        msgs.append({"role": "user",   "content": message})

        resp = await self.client.chat.completions.create(
            model=model,
            messages=msgs
        )
        # extract and return the assistant’s reply
        return resp.choices[0].message.content
