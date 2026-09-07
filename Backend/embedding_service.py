import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
   api_key=os.getenv("GEMINI_API_KEY")
)

from google.genai import types

def generate_embedding(text):
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )
    return response.embeddings[0].values

def generate_batch_embeddings(chunks: list[str]) -> list[list[float]]:
    if not chunks:
        return []
    
    # Send all chunks in a single batch API call
    contents = [
        types.Content(parts=[types.Part.from_text(text=chunk)])
        for chunk in chunks
    ]
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=contents
    )
    return [item.values for item in response.embeddings]

