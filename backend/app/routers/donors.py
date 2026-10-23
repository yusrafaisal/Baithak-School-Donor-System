from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.models.models import DonorCreate, DonorOut
from app.db.database import get_db

router = APIRouter(prefix="/donors", tags=["donors"])


def donor_out(doc) -> DonorOut:
    return DonorOut(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"})


@router.post("/", response_model=DonorOut, status_code=201)
async def create_donor(donor: DonorCreate):
    db = get_db()
    result = await db.donors.insert_one(donor.model_dump())
    doc = await db.donors.find_one({"_id": result.inserted_id})
    return donor_out(doc)


@router.get("/", response_model=list[DonorOut])
async def list_donors(search: str = None):
    db = get_db()
    query = {}
    if search:
        query = {"name": {"$regex": search, "$options": "i"}}
    docs = await db.donors.find(query).to_list(200)
    return [donor_out(d) for d in docs]


@router.get("/{donor_id}", response_model=DonorOut)
async def get_donor(donor_id: str):
    db = get_db()
    doc = await db.donors.find_one({"_id": ObjectId(donor_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Donor not found")
    return donor_out(doc)
