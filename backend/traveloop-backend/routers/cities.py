from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from database import get_db
from models import City, Activity, User
from schemas import ActivityOut
from auth import get_current_user

router = APIRouter(prefix="/api/cities", tags=["cities"])

class CityOut(BaseModel):
    id: int
    name: str
    country: str
    region: Optional[str] = None
    timezone: Optional[str] = None
    currency_code: Optional[str] = None
    avg_daily_cost_usd: Optional[float] = None
    popularity_score: Optional[int] = None
    climate_zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

@router.get("/search", response_model=List[CityOut])
async def search_cities(q: str = "", db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if len(q) < 2:
        return []
    result = await db.execute(select(City).where(City.name.ilike(f"%{q}%")))
    return result.scalars().all()

@router.get("/{city_id}", response_model=CityOut)
async def get_city(city_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(City).where(City.id == city_id))
    city = result.scalar_one_or_none()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city

@router.get("/{city_id}/activities", response_model=List[ActivityOut])
async def get_city_activities(city_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Activity).where(Activity.city_id == city_id).order_by(Activity.rating.desc()))
    return result.scalars().all()
