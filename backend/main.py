import asyncio
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from evaluator import evaluate_response, evaluate_response_async
from safety import classify_safety
from similarity import compute_semantic_similarity, compute_batch_similarities
from redteam import run_stress_test
from database import (
    save_evaluation, get_all_evaluations,
    get_all_redteam_logs, get_stats
)

app = FastAPI(title="Nodeval API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ──
class EvalRequest(BaseModel):
    prompt: str
    response: str
    reference: Optional[str] = ""

class BatchItem(BaseModel):
    prompt: str
    response: str
    reference: Optional[str] = ""

class BatchRequest(BaseModel):
    items: List[BatchItem]

class SafetyRequest(BaseModel):
    prompt: str
    response: str

class RedTeamRequest(BaseModel):
    prompt: str

# ── Routes ──

@app.get("/")
def root():
    return {"name": "Nodeval API", "version": "2.0.0", "status": "running"}


@app.get("/stats")
def stats():
    return get_stats()


@app.post("/evaluate")
async def evaluate(req: EvalRequest):
    try:
        # Run quality evaluation
        result = evaluate_response(req.prompt, req.response, req.reference)
        if not result:
            raise HTTPException(status_code=500, detail="Evaluation failed")

        # Run semantic similarity if reference provided
       # Run semantic similarity if reference provided
semantic_similarity = 0.0
if req.reference:
    try:
        semantic_similarity = compute_semantic_similarity(
            req.response, req.reference
        )
    except Exception as e:
        print(f"Similarity skipped: {e}")
        semantic_similarity = 0.0

        # Save to database
        save_evaluation(result)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/safety")
async def safety(req: SafetyRequest):
    try:
        result = classify_safety(req.prompt, req.response)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch")
async def batch_evaluate(req: BatchRequest):
    try:
        # Run evaluations concurrently
        tasks = [
            evaluate_response_async(
                item.prompt,
                item.response,
                item.reference
            )
            for item in req.items
        ]
        results = await asyncio.gather(*tasks)

        # Compute semantic similarities in batch
        pairs = [
            (item.response, item.reference)
            for item in req.items
            if item.reference
        ]
        similarities = compute_batch_similarities(pairs) if pairs else []
        sim_index = 0

        final_results = []
        for i, (item, result) in enumerate(zip(req.items, results)):
            if result:
                if item.reference:
                    result["semantic_similarity"] = similarities[sim_index]
                    sim_index += 1
                else:
                    result["semantic_similarity"] = 0.0

                result["prompt"] = item.prompt
                result["response"] = item.response
                result["reference"] = item.reference
                save_evaluation(result)
                final_results.append(result)

        return {
            "total": len(final_results),
            "results": final_results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/redteam")
async def redteam(req: RedTeamRequest):
    try:
        result = run_stress_test(req.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
def history():
    return get_all_evaluations()


@app.get("/history/redteam")
def redteam_history():
    return get_all_redteam_logs()


@app.delete("/history")
def clear_history():
    import sqlite3
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM evaluations")
    conn.commit()
    conn.close()
    return {"message": "History cleared"}

