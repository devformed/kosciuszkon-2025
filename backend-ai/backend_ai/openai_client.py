§"""OpenAI client module for interacting with OpenAI ChatCompletion API."""
import os
from dotenv import load_dotenv
import openai
from typing import Optional, List, Dict

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")
openai.api_key = api_key

class OpenAIClient:
    def __init__(self, default_model: str = "gpt-3.5-turbo"):
        self.default_model = default_model

    async def chat(self, system_message: Optional[str], message: str, model: Optional[str] = None) -> str:
        used_model = model or self.default_model
        messages: List[Dict[str, str]] = []
        if system_message:
            messages.append({"role": "system", "content": system_message})

        messages.append({"role": "user", "content": message})
        response = await openai.ChatCompletion.acreate(
            model=used_model,
            messages=messages
        )
        content = response.choices[0].message.content
        if content is None:
            return ""
        return content.strip()
