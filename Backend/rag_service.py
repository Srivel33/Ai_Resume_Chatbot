import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
   api_key=os.getenv("GEMINI_API_KEY")
)

AVAILABLE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
]

def generate_answer(question, context):
    prompt = f"""You are an AI Resume Assistant.

Answer the user's question accurately and concisely using only the information provided in the resume context below.
If the answer cannot be found in the resume context, state that clearly.

Resume Context:
{context if context.strip() else "No specific resume context available."}

Question:
{question}
"""

    last_error = None
    for model_name in AVAILABLE_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            last_error = e
            continue

    return f"Unable to generate response at this time. (Error: {str(last_error)})"


