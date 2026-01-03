
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.connection import get_session
from services import stats_service
from core import deps
from schemas.auth import TokenData
from pydantic import BaseModel

class SellerRatingResponse(BaseModel):
    org_id: int
    avg_rating: float
    total_reviews: int

router = APIRouter()

@router.get("/org/{org_id}/rating", response_model=SellerRatingResponse)
async def get_org_rating(
    org_id: int,
    db: AsyncSession = Depends(get_session)
):
    return await stats_service.get_seller_rating(db, org_id)
