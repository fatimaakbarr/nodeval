from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load model once at startup (runs locally on CPU, no API needed)
print("Loading sentence transformer model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("✓ Sentence transformer ready!")

def compute_semantic_similarity(text1: str, text2: str) -> float:
    """
    Computes cosine similarity between two texts.
    Returns a percentage from 0 to 100.
    """
    if not text1 or not text2:
        return 0.0

    embeddings = model.encode([text1, text2])
    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]

    # Convert to percentage and clamp between 0-100
    return round(float(similarity) * 100, 1)


def compute_batch_similarities(pairs: list) -> list:
    """
    Computes similarities for a batch of (text1, text2) pairs efficiently.
    Much faster than calling compute_semantic_similarity in a loop.
    """
    if not pairs:
        return []

    texts1 = [p[0] for p in pairs]
    texts2 = [p[1] for p in pairs]

    all_texts = texts1 + texts2
    embeddings = model.encode(all_texts)

    embeddings1 = embeddings[:len(texts1)]
    embeddings2 = embeddings[len(texts1):]

    results = []
    for e1, e2 in zip(embeddings1, embeddings2):
        sim = cosine_similarity([e1], [e2])[0][0]
        results.append(round(float(sim) * 100, 1))

    return results