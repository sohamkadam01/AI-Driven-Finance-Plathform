import os
import asyncio
import aiohttp
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
model = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")
base_url = "https://openrouter.ai/api/v1/chat/completions"

async def test():
    print(f"API Key: {api_key[:10]}...{api_key[-10:] if api_key else ''}")
    print(f"Model: {model}")
    print(f"Base URL: {base_url}")
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Hello, respond with exactly 'OK' and nothing else."}],
        "temperature": 0.0,
        "max_tokens": 10
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(base_url, json=payload, headers=headers) as response:
                print(f"Status Code: {response.status}")
                text = await response.text()
                print("Raw Response:")
                print(text)
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test())
