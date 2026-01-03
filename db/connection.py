
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/upcycle_db",
)

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session


async def test_connection():
    print("Checking connection...")
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("ok connected")
    except Exception as e:
        print(f"Connection failed: {e}")


if __name__ == "__main__":
    import asyncio
    from sqlalchemy import text
    asyncio.run(test_connection())
