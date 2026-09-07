import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

AVAILABLE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
]

# In-memory cache: (question, context_hash) -> answer
_answer_cache = {}

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

def generate_answer(question: str, context: str) -> str:
    cleaned_question = question.strip()
    cache_key = (cleaned_question.lower(), hash(context))

    # Return cached answer if identical inquiry on same resume context
    if cache_key in _answer_cache:
        return _answer_cache[cache_key]

    prompt = f"""You are an AI Resume Assistant.

Answer the user's question accurately and concisely using only the information provided in the resume context below.
If the answer cannot be found in the resume context, state that clearly.

Resume Context:
{context if context.strip() else "No specific resume context available."}

Question:
{cleaned_question}
"""

    clients = get_api_clients()
    last_error = None
    is_quota_error = False

    # Iterate through all available API keys, then through available models for each key
    for client in clients:
        for model_name in AVAILABLE_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and response.text:
                    result = response.text.strip()
                    _answer_cache[cache_key] = result
                    return result
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                    is_quota_error = True
                last_error = e
                # Try next model or next API key
                continue

    if is_quota_error:
        return "Daily AI request limit reached. Please try again tomorrow or retry in a few moments."

    return "Unable to generate response at this time. Please retry in a moment."
