# Nodeval — AI Evaluation & Red-Teaming Suite

> A production-grade framework for evaluating, stress-testing, and monitoring conversational AI systems.

**Live Demo:** https://nodeval-eosin.vercel.app

---

## What is Nodeval?

Nodeval is an open-source AI evaluation framework that answers one question most teams skip:

**"How do we actually know if our chatbot is any good?"**

It scores chatbot responses across 5 quality dimensions, detects 7 safety threats, runs adversarial red-team attacks automatically, and stores everything in a searchable history with trend charts — all powered by a free LLM API and local sentence embeddings.

---

## Features

### Evaluator
- Chain-of-Thought LLM judging via LLaMA 3.3 70B
- Scores coherence, relevance, fluency, safety, and empathy (0–100)
- Local semantic similarity using `sentence-transformers` (no API needed)
- Pydantic-validated structured output
- Latency tracking per evaluation

### Safety Classifier
- Detects 7 threat categories in real time:
  - Prompt Injection
  - Jailbreak attempts
  - Harmful Content
  - PII Leakage
  - Bias
  - Misinformation
  - Inappropriate Tone
- Returns risk level (LOW / MEDIUM / HIGH) and risk score 0–100

### Red Team Studio
- 5 built-in adversarial attack templates:
  1. Prompt Injection
  2. Roleplay Jailbreak
  3. Character Encoding Obfuscation
  4. Authority Impersonation
  5. Hypothetical Framing
- Fires all attacks concurrently and logs which ones bypass safety
- Live terminal-style feed during attack execution

### Batch Evaluator
- Evaluate 50+ responses concurrently using async FastAPI
- Visual pipeline with 3-stage animation (Ingest → Analyze → Score)
- CSV export of all results

### History & Analytics
- SQLite storage with timestamps, scores, reasoning, and latency
- Timeline-based UI with expandable evaluation cards
- Score trend line chart, verdict pie chart, dimension bar chart
- Search and filter across all past evaluations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 · FastAPI · Uvicorn |
| AI Judge | LLaMA 3.3 70B via Groq (free tier) |
| Local Scoring | sentence-transformers · all-MiniLM-L6-v2 |
| Validation | Pydantic v2 |
| Database | SQLite |
| Frontend | React · Vite · Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Recharts |
| Deployment | Railway (backend) · Vercel (frontend) |
| Design Reference | Google Stitch (UI prototyping) |

---

## Project Structure

```
nodeval/
├── backend/
│   ├── main.py          # FastAPI routes (7 endpoints)
│   ├── evaluator.py     # Chain-of-Thought LLM judge + Pydantic schemas
│   ├── safety.py        # Safety threat classifier
│   ├── similarity.py    # Local semantic similarity scoring
│   ├── redteam.py       # Adversarial attack engine
│   ├── database.py      # SQLite storage layer
│   ├── requirements.txt
│   ├── Procfile
│   ├── runtime.txt
│   └── nixpacks.toml
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── MetricCard.jsx
        │   └── ScoreBar.jsx
        └── pages/
            ├── Evaluator.jsx
            ├── Safety.jsx
            ├── Batch.jsx
            ├── RedTeam.jsx
            └── History.jsx
```

---

## Getting Started

### Prerequisites
- Python 3.11
- Node.js 18+
- A free Groq API key from https://console.groq.com

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/nodeval.git
cd nodeval

# Create virtual environment
python -m venv nodeval-env
nodeval-env\Scripts\activate  # Windows
source nodeval-env/bin/activate  # Mac/Linux

# Install dependencies
cd backend
pip install -r requirements.txt

# Add your API key
echo "GROQ_API_KEY=your_key_here" > .env

# Run the server
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/evaluate` | Full quality evaluation of a prompt/response pair |
| POST | `/safety` | Safety threat classification |
| POST | `/batch` | Concurrent batch evaluation |
| POST | `/redteam` | Adversarial stress test (5 attacks) |
| GET | `/history` | Fetch all past evaluations |
| GET | `/stats` | Aggregate statistics |
| DELETE | `/history` | Clear evaluation history |

---

## Evaluation Dimensions

| Dimension | What it measures |
|-----------|-----------------|
| Coherence | Logical flow and internal consistency |
| Relevance | How directly the response addresses the question |
| Fluency | Grammar, naturalness, and readability |
| Safety | Absence of harmful, biased, or dangerous content |
| Empathy | Tone, emotional appropriateness, and consideration |

---

## Deployment

### Backend → Railway
1. Connect your GitHub repo to Railway
2. Set root directory to `backend`
3. Add `GROQ_API_KEY` in Variables tab
4. Railway auto-deploys on every push

### Frontend → Vercel
1. Connect your GitHub repo to Vercel
2. Set root directory to `frontend`
3. Vercel auto-deploys on every push

---

## Why Nodeval?

Most teams ship AI products without any systematic evaluation. They test manually, miss edge cases, and only discover failures when users complain. Nodeval automates the evaluation pipeline so you can catch problems before they reach production.

It's built entirely on free APIs and open-source libraries — no OpenAI, no paid services, zero ongoing cost.

---

## Built By

Built as a portfolio project for a Conversational AI internship application. Demonstrates end-to-end AI engineering: prompt design, LLM-as-judge evaluation, local NLP scoring, adversarial testing, async API design, and full-stack deployment.

---

## License

MIT — free to use, modify, and distribute.
