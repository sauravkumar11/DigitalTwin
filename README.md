# DigitalTwin
# TwinCare AI

An AI-powered **Digital Patient Twin** platform. Doctors manage patients through
a clickable 3D digital twin that surfaces organ-level AI health insights;
patients get a read-only view of their own twin, medications, reports, and
diet tracking.

> **Status note:** This is a complete, runnable full-stack scaffold covering
> every module in the spec (auth, digital twin, organ insights, reports,
> medications, diet, timeline, Docker, seed data). A few integration points
> that need real infrastructure or licensed assets are implemented with
> clearly-marked, working fallbacks — see [Known Simplifications](#known-simplifications-honest-notes) below.

---

## 1. Architecture

```mermaid
flowchart LR
    subgraph Client
        FE["Next.js 14 (React, TS, Tailwind)\nReact Three Fiber digital twin"]
    end

    subgraph Server
        API["FastAPI backend\nJWT auth, REST endpoints"]
        SVC["Services\norgan_mapping.py, gemini_service.py"]
    end

    subgraph Data
        PG[(PostgreSQL)]
        CH[(ChromaDB\nvector store)]
        FS[(Local uploads\nreports / meal photos)]
    end

    EXT["Google Gemini API\n(Flash model)"]

    FE -- REST / JWT --> API
    API --> SVC
    SVC --> EXT
    API --> PG
    API --> FS
    SVC --> CH
twincare-ai/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── core/
│       ├── db/
│       ├── models/models.py
│       ├── schemas/schemas.py
│       ├── api/routes/
│       ├── services/
│       └── seed/seed_data.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── app/
    ├── components/
    └── lib/api.ts
erDiagram
    USERS ||--o| DOCTORS : "has profile"
    USERS ||--o| PATIENTS : "has profile"
    DOCTORS ||--o{ PATIENTS : "primary doctor of"
    PATIENTS ||--o{ MEDICAL_HISTORY : has
    PATIENTS ||--o{ ORGAN_SUMMARIES : has


git clone https://github.com/sauravkumar11/DigitalTwin.git twincare-ai
cd twincare-ai
cp backend/.env.example backend/.env
docker compose up --build


cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload


cd frontend
npm install
npm run dev
