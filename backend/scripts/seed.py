"""
Run once to seed static reference data.
Usage: python scripts/seed.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

PROJECTS = [
    "School Sponsorship", "Student Sponsorship", "Class Sponsorship",
    "Non-Formal Education", "Orphan Support Program", "Industrial Home",
    "Zabiha", "Library", "Water Cooler", "Solar",
    "General Donation", "General Zakat"
]

# Extend these as the client confirms actual account/cost-center names
ACCOUNTS = ["Income", "Zakat Fund", "Sadqah Fund", "General Fund"]

COST_CENTERS = ["Head Office"]  # client to provide full school list


async def seed():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DB_NAME", "baithak_dms")]

    for col, docs, key in [
        ("projects", PROJECTS, "name"),
        ("accounts", ACCOUNTS, "name"),
        ("cost_centers", COST_CENTERS, "name"),
    ]:
        for item in docs:
            await db[col].update_one(
                {key: item}, {"$setOnInsert": {key: item}}, upsert=True
            )
        print(f"Seeded {col}")

    client.close()
    print("Done.")


asyncio.run(seed())
