from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DB_NAME", "baithak_dms")]
    print("Connected to MongoDB")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
