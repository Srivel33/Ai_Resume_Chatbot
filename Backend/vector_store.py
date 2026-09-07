import chromadb

client = chromadb.PersistentClient(
    path="./chroma_db"
)

def get_collection():
    return client.get_or_create_collection(name="resume_collection")

def clear_collection():
    try:
        col = get_collection()
        existing = col.get()
        if existing and existing.get("ids"):
            col.delete(ids=existing["ids"])
    except Exception:
        pass

def store_embeddings(chunks, embeddings):
    if not chunks or not embeddings:
        return
    col = get_collection()
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    col.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings
    )

def search_embeddings(query_embedding, top_k=3):
    col = get_collection()
    count = col.count()
    if count == 0:
        return {"documents": [[]]}
    
    results = col.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, count)
    )
    return results
