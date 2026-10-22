from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.models.models import DonationCreate, DonationOut
from app.db.database import get_db

router = APIRouter(prefix="/donations", tags=["donations"])


def donation_out(doc) -> DonationOut:
    total = sum(item["amount"] for item in doc.get("line_items", []))
    return DonationOut(id=str(doc["_id"]), total=total,
                       **{k: v for k, v in doc.items() if k != "_id"})


@router.post("/", response_model=DonationOut, status_code=201)
async def create_donation(donation: DonationCreate):
    db = get_db()
    data = donation.model_dump()
    data["date"] = str(data["date"])  # serialize date for Mongo
    result = await db.donations.insert_one(data)
    doc = await db.donations.find_one({"_id": result.inserted_id})
    return donation_out(doc)


@router.get("/{donation_id}", response_model=DonationOut)
async def get_donation(donation_id: str):
    db = get_db()
    doc = await db.donations.find_one({"_id": ObjectId(donation_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation_out(doc)


@router.get("/")
async def list_donations(donor_id: str = None, project: str = None):
    db = get_db()
    query = {}
    if donor_id:
        query["donor_id"] = donor_id
    if project:
        query["line_items.project"] = project
    docs = await db.donations.find(query).sort("date", -1).to_list(500)
    return [donation_out(d) for d in docs]
