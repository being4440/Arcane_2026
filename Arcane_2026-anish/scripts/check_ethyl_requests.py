import asyncio
from sqlalchemy.future import select
from db.connection import AsyncSessionLocal
from models.material import Material
from models.request import Request

async def main():
    async with AsyncSessionLocal() as session:
        print('Searching for materials with title like "ethyl alcohol"...')
        stmt = select(Material).where(Material.title.ilike('%ethyl alcohol%'))
        res = await session.execute(stmt)
        materials = res.scalars().all()
        if not materials:
            print('No materials found matching "ethyl alcohol"')
            return
        for m in materials:
            print(f'Found Material: id={m.material_id}, title={m.title}, org_id={m.org_id}, availability={m.availability_status}')
            stmt2 = select(Request).where(Request.material_id == m.material_id)
            rres = await session.execute(stmt2)
            reqs = rres.scalars().all()
            print(f'  Requests found: {len(reqs)}')
            for r in reqs:
                print(f'    request_id={r.request_id}, buyer_id={r.buyer_id}, qty={r.requested_quantity}, status={r.status}, date={r.created_at}, message={r.message}')

if __name__ == '__main__':
    asyncio.run(main())
