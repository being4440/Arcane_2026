import asyncio
from db.connection import get_session
from models.material import Material
from sqlalchemy import select

async def main():
    print("Fetching materials...")
    async for db in get_session():
        result = await db.execute(select(Material))
        materials = result.scalars().all()
        for m in materials:
            print(f"Material: {m.title}, Category: {m.category}")
        return

if __name__ == "__main__":
    asyncio.run(main())
