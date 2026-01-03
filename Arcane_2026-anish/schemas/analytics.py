
from typing import List, Optional
from pydantic import BaseModel

class ImpactStats(BaseModel):
    total_materials_listed: int
    total_materials_transferred: int
    waste_diverted_kg: float
    co2_reduction_kg: float

class ActivityStats(BaseModel):
    requests_per_org: List[dict]
    requests_per_material: List[dict]
    conversion_ratio: float
