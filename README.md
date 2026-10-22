# Baithak School Network — Donor Management System

A web-based donor management system built for Baithak School Network as a university project. Staff can record donations split across multiple projects, manage donors, search past donations, and print receipts.

## Tech Stack

- **Backend:** Python, FastAPI, MongoDB Atlas
- **Frontend:** Next.js (Pages Router) <!-- verify: pages/ vs app/ -->

## Repository Structure

```
.
├── app/                    # FastAPI backend
│   ├── main.py             # App entry point
│   ├── db/database.py      # MongoDB connection
│   ├── models/models.py    # Pydantic schemas
│   └── routers/
│       ├── donors.py       # Donor endpoints
│       └── donations.py    # Donation endpoints
├── scripts/seed.py         # Seeds projects, accounts, cost centers
├── baithak-frontend/       # Next.js frontend
│   ├── pages/
│   │   ├── index.js        # Donation form
│   │   ├── donors.js       # Add/view donors
│   │   └── receipt/[id].js # Printable receipt
│   └── styles/globals.css
├── requirements.txt
├── .env.example
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- A MongoDB Atlas cluster and a database user

## Setup

### 1. Clone and configure

```bash
git clone https://github.com/yusrafaisal/Baithak-School-Donor-System.git
cd Baithak-School-Donor-System
cp .env.example .env
```

Edit `.env` and fill in your own values:

```
MONGODB_URI=<your MongoDB connection string>
DB_NAME=baithak_dms
```

> Never commit `.env`. Ask the project owner for credentials; do not share them in the repo.

### 2. Backend

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed.py          # run once to seed static data
python -m uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd baithak-frontend
npm install
npm run dev
```

- App: http://localhost:3000
- The backend must be running first. <!-- verify: how the frontend finds the API URL; add an env var if hardcoded -->

## Features

- **Donations:** donor, date, payment mode, and line items split across projects
- **Donors:** add and view donors (`/donors`)
- **Search:** filter donations
- **Receipts:** printable receipt page for any saved donation

## API Endpoints

| Method | Endpoint          | Description           |
|--------|-------------------|-----------------------|
| GET    | `/donors/`        | List all donors       |
| POST   | `/donors/`        | Add a donor           |
| GET    | `/donors/{id}`    | Get donor by ID       |
| POST   | `/donations/`     | Create a donation     |
| GET    | `/donations/`     | List/filter donations |
| GET    | `/donations/{id}` | Get donation by ID    |

## Pending (to confirm with client)

- Full list of schools/cost centers
- Full list of account names
- Fund Receipt No: auto-generated or manual?
- Printed receipt format (logo, address, fields)
- Authentication / login requirements