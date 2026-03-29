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
    allow_origins=[
    "http://localhost:5173",
    "https://nodeval-eosin.vercel.app",
    "https://nodeval-fatimaakbarrs-projects.vercel.app",
    "https://nodeval-git-main-fatimaakbarrs-projects.vercel.app",
],
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
        result = evaluate_response(req.prompt, req.response, req.reference)
        if not result:
            raise HTTPException(status_code=500, detail="Evaluation failed")

        result["semantic_similarity"] = 0.0
        result["prompt"] = req.prompt
        result["response"] = req.response
        result["reference"] = req.reference

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
        tasks = [
            evaluate_response_async(item.prompt, item.response, item.reference)
            for item in req.items
        ]
        results = await asyncio.gather(*tasks)

        final_results = []
        for item, result in zip(req.items, results):
            if result:
                result["semantic_similarity"] = 0.0
                result["prompt"] = item.prompt
                result["response"] = item.response
                result["reference"] = item.reference
                save_evaluation(result)
                final_results.append(result)

        return {"total": len(final_results), "results": final_results}

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
