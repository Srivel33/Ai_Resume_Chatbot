import chromadb

client = chromadb.PersistentClient(
   path="./chroma_db"
)

collection = client.get_or_create_collection(
   name="resume_collection"
)

def clear_collection():
   global collection
   client.delete_collection("resume_collection")
   collection = client.get_or_create_collection(name="resume_collection")

def store_embeddings(chunks, embeddings):
   ids = []

   for i in range(len(chunks)):
       ids.append(f"chunk_{i}")

   collection.upsert(
       ids=ids,
       documents=chunks,
       embeddings=embeddings
   )
   
def search_embeddings(query_embedding, top_k=3):
   results = collection.query(
       query_embeddings=[query_embedding],
       n_results=top_k
   )

   return results
