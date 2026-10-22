# Baithak School Network — Donor Management System

A web-based donor management system built for Baithak School Network as a university project.

---

## Project Structure

```
baithak-dms/          ← Python FastAPI backend
baithak-frontend/     ← Next.js frontend
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- A MongoDB Atlas account (cluster already set up)

---

## Backend Setup

```bash
cd baithak-dms
pip install -r requirements.txt
```

Create a `.env` file in `baithak-dms/`:

```env
MONGODB_URI=<paste the MongoDB connection string>
DB_NAME=baithak_dms
```

Seed the static data (run once):

```bash
python scripts/seed.py
```

Start the backend:

```bash
# If python is not on PATH, use the full path to python.exe
python -m uvicorn app.main:app --reload

# Or on Windows if above doesn't work:
C:\Users\<YourUser>\AppData\Local\Python\pythoncore-3.14-64\python.exe -m uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`  
Auto-generated API docs: `http://localhost:8000/docs`

---

## Frontend Setup

```bash
cd baithak-frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

> Make sure the backend is running before using the frontend.

---

## Features

- **Donation Tab** — Enter a donation with donor, date, payment mode, and line items split across multiple projects
- **Manage Donors** — Add and view donors (`/donors`)
- **Search Tab** — Filter donations
- **Print Receipt** — Opens a printable receipt page for any saved donation

---

## Project File Structure

```
baithak-dms/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── db/database.py       # MongoDB connection
│   ├── models/models.py     # Pydantic schemas
│   └── routers/
│       ├── donors.py        # Donor endpoints
│       └── donations.py     # Donation endpoints
├── scripts/seed.py          # Seeds projects, accounts, cost centers
├── requirements.txt
└── .env                     # Not committed — create manually

baithak-frontend/
├── pages/
│   ├── index.js             # Main donation form
│   ├── donors.js            # Add/view donors
│   └── receipt/[id].js      # Printable receipt
└── styles/globals.css
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/donors/` | List all donors |
| POST | `/donors/` | Add a donor |
| GET | `/donors/{id}` | Get donor by ID |
| POST | `/donations/` | Create a donation |
| GET | `/donations/{id}` | Get donation by ID |
| GET | `/donations/` | List/filter donations |

---

## Pending (to confirm with client)

- Full list of schools/cost centers
- Full list of account names
- Fund Receipt No — auto-generated or manual?
- Printed receipt format (logo, address, fields)
- Auth / login requirement
