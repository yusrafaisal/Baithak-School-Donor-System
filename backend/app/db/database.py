from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

client = None
db = None


def get_db():
    global client, db
    if db is None:
        client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
        db = client[os.getenv("DB_NAME", "baithak_dms")]
    return db


async def connect_db():
    database = get_db()
    await client.admin.command("ping")  # fail fast on a bad URI
    print("Connected to MongoDB")


async def close_db():
    global client, db
    if client:
        client.close()
    client = None
    db = None