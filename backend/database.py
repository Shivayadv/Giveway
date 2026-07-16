import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient = None


async def connect():
    global client
    client = AsyncIOMotorClient(settings.mongodb_uri, tlsCAFile=certifi.where())


async def disconnect():
    global client
    if client:
        client.close()


def get_db():
    return client["giveway"]


def users_col():
    return get_db()["users"]


def brands_col():
    return get_db()["brands"]


def campaigns_col():
    return get_db()["campaigns"]


def entries_col():
    return get_db()["entries"]
