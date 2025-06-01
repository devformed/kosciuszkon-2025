# backend-ai

## Requirements

Install poetry dependency manager:
```
sudo apt-get instal poetry
```
or
```
brew install poetry
```

Install dependencies and initialize the virtual environment:
```
poetry install --no-root
```

## Setup

Copy `.env.example` to `.env` and set your `OPENAI_API_KEY`:
```
cp .env.example .env
```

## Running

Start the server via Poetry script:
```
poetry run start
``` 

## Endpoint

POST /chat

Request JSON (fields):
- `system_message` (optional): role instructions to the assistant
- `message`: user’s message
- `model` (optional): e.g. "gpt-3.5-turbo", default set in the request model
```json
{
  "system_message": "You are a helpful assistant.",
  "message": "Hello, world!",
  "model": "gpt-3.5-turbo"
}
```

Response JSON:
```json
{
  "response": "..."
}
```