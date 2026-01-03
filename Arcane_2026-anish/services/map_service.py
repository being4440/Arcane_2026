
import math
from services import material_service
from sqlalchemy.ext.asyncio import AsyncSession

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371 
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) * math.sin(d_lat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) * math.sin(d_lon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def get_nearby_materials(
    db: AsyncSession,
    lat: float,
    long: float,
    radius_km: float,
    category: str = None
):
    materials = await material_service.get_materials(db, category=category)
    
    nearby_results = []
    
    for m in materials:
        if not m.organization or not m.organization.location:
            continue
            
        loc = m.organization.location
        if loc.lat_approx is None or loc.long_approx is None:
            continue
            
        dist = haversine_distance(lat, long, float(loc.lat_approx), float(loc.long_approx))
        
        if dist <= radius_km:
            nearby_results.append({
                "material_id": m.material_id,
                "title": m.title,
                "category": m.category,
                "quantity_value": m.quantity_value,
                "quantity_unit": m.quantity_unit,
                "lat": float(loc.lat_approx),
                "long": float(loc.long_approx),
                "org_city": loc.city,
                "distance_km": round(dist, 2)
            })
            
    nearby_results.sort(key=lambda x: x["distance_km"])
    return nearby_results
