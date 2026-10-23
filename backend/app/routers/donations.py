# from fastapi import APIRouter, HTTPException
# from bson import ObjectId
# from app.models.models import DonationCreate, DonationOut
# from app.db.database import get_db

# router = APIRouter(prefix="/donations", tags=["donations"])


# def donation_out(doc) -> DonationOut:
#     total = sum(item["amount"] for item in doc.get("line_items", []))
#     return DonationOut(id=str(doc["_id"]), total=total,
#                        **{k: v for k, v in doc.items() if k != "_id"})


# @router.post("/", response_model=DonationOut, status_code=201)
# async def create_donation(donation: DonationCreate):
#     db = get_db()
#     data = donation.model_dump()
#     data["date"] = str(data["date"])  # serialize date for Mongo
#     result = await db.donations.insert_one(data)
#     doc = await db.donations.find_one({"_id": result.inserted_id})
#     return donation_out(doc)


# @router.get("/{donation_id}", response_model=DonationOut)
# async def get_donation(donation_id: str):
#     db = get_db()
#     doc = await db.donations.find_one({"_id": ObjectId(donation_id)})
#     if not doc:
#         raise HTTPException(status_code=404, detail="Donation not found")
#     return donation_out(doc)


# @router.get("/")
# async def list_donations(donor_id: str = None, project: str = None):
#     db = get_db()
#     query = {}
#     if donor_id:
#         query["donor_id"] = donor_id
#     if project:
#         query["line_items.project"] = project
#     docs = await db.donations.find(query).sort("date", -1).to_list(500)
#     return [donation_out(d) for d in docs]

import re
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Response

from app.db.database import get_db
from app.models.models import DonationCreate, DonationOut
from app.utils import parse_object_id

router = APIRouter(prefix="/donations", tags=["donations"])


def donation_out(doc, donor_name: Optional[str] = None) -> DonationOut:
    total = sum(item["amount"] for item in doc.get("line_items", []))
    data = {k: v for k, v in doc.items() if k != "_id"}
    return DonationOut(id=str(doc["_id"]), total=total, donor_name=donor_name, **data)


async def donor_name_map(db, donations) -> dict:
    """Look up all donor names for a list of donations in one query."""
    object_ids = []
    for donor_id in {d["donor_id"] for d in donations}:
        try:
            object_ids.append(ObjectId(donor_id))
        except Exception:
            pass  # skip malformed legacy IDs
    if not object_ids:
        return {}
    donors = await db.donors.find({"_id": {"$in": object_ids}}).to_list(length=None)
    return {str(d["_id"]): d["name"] for d in donors}


@router.post("/", response_model=DonationOut, status_code=201)
async def create_donation(donation: DonationCreate):
    db = get_db()
    donor = await db.donors.find_one({"_id": parse_object_id(donation.donor_id)})
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    data = donation.model_dump()
    data["date"] = str(data["date"])  # serialize date for Mongo
    result = await db.donations.insert_one(data)
    doc = await db.donations.find_one({"_id": result.inserted_id})
    return donation_out(doc, donor["name"])


@router.get("/", response_model=list[DonationOut])
async def list_donations(
    donor_id: Optional[str] = None,
    donor_name: Optional[str] = None,
    project: Optional[str] = None,
):
    db = get_db()
    conditions = []

    if donor_name:
        matches = await db.donors.find(
            {"name": {"$regex": re.escape(donor_name), "$options": "i"}},
            {"_id": 1},
        ).to_list(length=None)
        conditions.append({"donor_id": {"$in": [str(m["_id"]) for m in matches]}})
    if donor_id:
        conditions.append({"donor_id": donor_id})
    if project:
        conditions.append({"line_items.project": project})

    query = {"$and": conditions} if conditions else {}
    docs = await db.donations.find(query).sort("date", -1).to_list(500)
    names = await donor_name_map(db, docs)
    return [donation_out(d, names.get(d["donor_id"])) for d in docs]


@router.get("/{donation_id}", response_model=DonationOut)
async def get_donation(donation_id: str):
    db = get_db()
    doc = await db.donations.find_one({"_id": parse_object_id(donation_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Donation not found")
    names = await donor_name_map(db, [doc])
    return donation_out(doc, names.get(doc["donor_id"]))


@router.delete("/{donation_id}", status_code=204)
async def delete_donation(donation_id: str):
    db = get_db()
    result = await db.donations.delete_one({"_id": parse_object_id(donation_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Donation not found")
    return Response(status_code=204)