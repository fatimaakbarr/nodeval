import sqlite3
import json
import os
from datetime import datetime

DB_PATH = "nodeval.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            prompt TEXT,
            response TEXT,
            reference TEXT,
            coherence REAL,
            relevance REAL,
            fluency REAL,
            safety REAL,
            empathy REAL,
            overall_score REAL,
            verdict TEXT,
            reasoning TEXT,
            improvement TEXT,
            semantic_similarity REAL,
            violation_detected INTEGER,
            latency_ms REAL
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS redteam_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            attack_type TEXT,
            original_prompt TEXT,
            attack_prompt TEXT,
            bypassed INTEGER,
            risk_score REAL
        )
    ''')
    conn.commit()
    conn.close()

def save_evaluation(data: dict):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO evaluations (
            timestamp, prompt, response, reference,
            coherence, relevance, fluency, safety, empathy,
            overall_score, verdict, reasoning, improvement,
            semantic_similarity, violation_detected, latency_ms
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (
        datetime.now().isoformat(),
        data.get("prompt", ""),
        data.get("response", ""),
        data.get("reference", ""),
        data.get("coherence", 0),
        data.get("relevance", 0),
        data.get("fluency", 0),
        data.get("safety", 0),
        data.get("empathy", 0),
        data.get("overall_score", 0),
        data.get("verdict", ""),
        data.get("reasoning", ""),
        data.get("improvement", ""),
        data.get("semantic_similarity", 0),
        1 if data.get("violation_detected") else 0,
        data.get("latency_ms", 0)
    ))
    conn.commit()
    conn.close()

def save_redteam_log(data: dict):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO redteam_logs (
            timestamp, attack_type, original_prompt,
            attack_prompt, bypassed, risk_score
        ) VALUES (?,?,?,?,?,?)
    ''', (
        datetime.now().isoformat(),
        data.get("attack_type", ""),
        data.get("original_prompt", ""),
        data.get("attack_prompt", ""),
        1 if data.get("bypassed") else 0,
        data.get("risk_score", 0)
    ))
    conn.commit()
    conn.close()

def get_all_evaluations():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM evaluations ORDER BY timestamp DESC")
    rows = [dict(row) for row in c.fetchall()]
    conn.close()
    return rows

def get_all_redteam_logs():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM redteam_logs ORDER BY timestamp DESC")
    rows = [dict(row) for row in c.fetchall()]
    conn.close()
    return rows

def get_stats():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM evaluations")
    total = c.fetchone()[0]
    c.execute("SELECT AVG(overall_score) FROM evaluations")
    avg_score = c.fetchone()[0] or 0
    c.execute("SELECT COUNT(*) FROM evaluations WHERE verdict='PASS'")
    passes = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM evaluations WHERE violation_detected=1")
    violations = c.fetchone()[0]
    c.execute("SELECT AVG(latency_ms) FROM evaluations")
    avg_latency = c.fetchone()[0] or 0
    conn.close()
    return {
        "total": total,
        "avg_score": round(avg_score, 1),
        "pass_rate": round((passes / total * 100) if total > 0 else 0, 1),
        "violations": violations,
        "avg_latency": round(avg_latency, 1)
    }

init_db()