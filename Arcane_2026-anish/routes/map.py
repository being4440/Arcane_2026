
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from db.connection import get_session
from services import map_service

router = APIRouter()

class MapItem(BaseModel):
    material_id: int
    title: str
    category: str
    quantity_value: Optional[float]
    quantity_unit: Optional[str]
    lat: float
    long: float
    org_city: Optional[str]
    distance_km: float

@router.get("/", response_model=List[MapItem])
async def get_map_materials(
    lat: float,
    long: float,
    radius_km: float = 50.0,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_session)
):
    results = await map_service.get_nearby_materials(db, lat, long, radius_km, category)
    return results
