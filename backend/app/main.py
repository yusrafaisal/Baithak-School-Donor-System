from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import connect_db, close_db
from app.routers import donors, donations


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Baithak DMS API",
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vercel passes the original path through, so every route lives under /api
app.include_router(donors.router, prefix="/api")
app.include_router(donations.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "Baithak DMS running"}