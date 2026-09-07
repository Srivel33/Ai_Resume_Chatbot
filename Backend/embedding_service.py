import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def get_api_clients():
    keys = []
    for i in range(1, 10):
        k = os.getenv(f"GEMINI_API_KEY_{i}")
        if k and k.strip():
            keys.append(k.strip())
    single = os.getenv("GEMINI_API_KEY")
    if single and single.strip() and single.strip() not in keys:
        keys.append(single.strip())
    
    if not keys:
        return [genai.Client()]
    return [genai.Client(api_key=k) for k in keys]

def generate_embedding(text: str) -> list[float]:
    clients = get_api_clients()
    last_error = None

    for client in clients:
        try:
            response = client.models.embed_content(
                model="gemini-embedding-2",
                contents=text
            )
            return response.embeddings[0].values
        except Exception as e:
            last_error = e
            continue

    raise last_error if last_error else RuntimeError("Failed to generate embedding.")

def generate_batch_embeddings(chunks: list[str]) -> list[list[float]]:
    if not chunks:
        return []

    clients = get_api_clients()
    contents = [
        types.Content(parts=[types.Part.from_text(text=chunk)])
        for chunk in chunks
    ]
    last_error = None

    for client in clients:
        try:
            response = client.models.embed_content(
                model="gemini-embedding-2",
                contents=contents
            )
            return [item.values for item in response.embeddings]
        except Exception as e:
            last_error = e
            continue

    raise last_error if last_error else RuntimeError("Failed to generate batch embeddings.")
