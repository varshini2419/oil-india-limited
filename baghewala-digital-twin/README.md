# Baghewala Heavy-Oil Digital Twin Prototype

## Overview
The **Baghewala Heavy-Oil Digital Twin** is an SIH prototype project designed to model, simulate, and optimize Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) recovery operations for heavy oil reservoirs in the Baghewala field.

---

## Current Step 1 Scope
This repository currently contains **Step 1 — Project Foundation ONLY**.
- Sets up project structure for frontend, backend, simulation, data, and docs.
- Initializes independent React + Vite + TypeScript + Tailwind CSS frontend.
- Initializes independent Python + FastAPI backend with a minimal `/api/health` endpoint.
- Configures environment variable template (`.env.example`) and comprehensive `.gitignore`.
- Establishes placeholder directory structures for engineering simulation modules, field data, and documentation.

> **Note:** Simulation physics models, 2D visual digital twins, thermal/viscosity models, database integrations, AI components, and complex UI dashboards will be added incrementally in subsequent development steps.

---

## Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS

### Backend
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Language:** Python 3.14+
- **Environment Management:** python-dotenv / Pydantic settings

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

---

### Starting the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   python main.py
   # Or using uvicorn directly:
   uvicorn main:app --reload --port 8000
   ```

5. Verify backend health endpoint:
   Open browser or API client to `http://localhost:8000/api/health`.

---

### Starting the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5173`.

---

## Project Architecture

```
baghewala-digital-twin/
│
├── frontend/             # React + Vite + TypeScript + Tailwind UI Foundation
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Views & routes
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript interfaces & types
│   │   ├── utils/        # Utility helpers
│   │   ├── assets/       # Static assets
│   │   └── config/       # Frontend configuration
│   └── package.json
│
├── backend/              # FastAPI Python Server Foundation
│   ├── app/
│   │   ├── api/          # API route definitions
│   │   ├── core/         # Core config & settings
│   │   ├── models/       # Data models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Core business logic
│   │   └── utils/        # Backend utilities
│   ├── requirements.txt
│   └── main.py
│
├── simulation/           # Simulation Physics Modules (Step 2+ Placeholders)
│   ├── thermal/
│   ├── viscosity/
│   ├── reservoir/
│   ├── mobility/
│   ├── css/
│   ├── srp/
│   ├── production/
│   ├── energy/
│   └── risk/
│
├── data/                 # Baseline Field & Equipment Datasets
│   ├── field/
│   ├── reservoir/
│   ├── equipment/
│   └── scenarios/
│
├── docs/                 # Engineering Specifications & Documentation
│   ├── field-history/
│   ├── reservoir/
│   ├── css/
│   ├── srp/
│   └── assumptions/
│
├── .env.example
├── .gitignore
└── README.md
```
