from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PyPDF2 import PdfReader
from chunking import chunk_text
from embedding_service import generate_embedding
from vector_store import store_embeddings, search_embeddings, clear_collection
from rag_service import generate_answer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    question: str


@app.get("/")
def home():
   return {
       "message": "AI Resume Assistant API is running"
   }

@app.post("/upload")
def upload_resume(file: UploadFile = File(...)):
   clear_collection()
   reader = PdfReader(file.file)

   text = ""

   for page in reader.pages:
       page_text = page.extract_text()

       if page_text:
           text += page_text

   # Split resume text into chunks
   chunks = chunk_text(text)
   embeddings = []

   for chunk in chunks:
        vector = generate_embedding(chunk)
        embeddings.append(vector)

   store_embeddings(chunks, embeddings)


   return {
   "filename": file.filename,
   "pages": len(reader.pages),
   "text": text,
   "chunks": chunks,
   "chunk_count": len(chunks),
   "embedding_count": len(embeddings)
    }

class IngestTextRequest(BaseModel):
    text: str

@app.post("/ingest_text")
def ingest_text(request: IngestTextRequest):
    clear_collection()
    chunks = chunk_text(request.text)
    embeddings = []

    for chunk in chunks:
        vector = generate_embedding(chunk)
        embeddings.append(vector)

    if chunks and embeddings:
        store_embeddings(chunks, embeddings)

    return {
        "text": request.text,
        "chunks": chunks,
        "chunk_count": len(chunks),
        "embedding_count": len(embeddings)
    }

@app.post("/search")
def search_resume(request: SearchRequest):
    # Convert question into an embedding
    query_embedding = generate_embedding(request.question)

    # Search ChromaDB
    results = search_embeddings(query_embedding)

    # Get relevant chunks safely
    relevant_chunks = (
        results["documents"][0]
        if results.get("documents") and len(results["documents"]) > 0 and results["documents"][0] is not None
        else []
    )

    # Combine chunks into one context
    context = "\n\n".join(relevant_chunks) if relevant_chunks else ""

    # Generate AI answer
    answer = generate_answer(
        request.question,
        context
    )

    return {
        "question": request.question,
        "context": relevant_chunks,
        "answer": answer
    }
