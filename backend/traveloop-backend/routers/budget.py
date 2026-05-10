from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID
from datetime import timedelta, date
from pydantic import BaseModel

from database import get_db
from models import Trip, TripStop, StopActivity, Activity, City, User
from auth import get_current_user

router = APIRouter(prefix="/api/trips", tags=["budget"])

class DailyBudgetOut(BaseModel):
    date: date
    city_name: str
    accommodation_cost: float
    transport_cost: float
    activities_cost: float
    day_total: float

@router.get("/{trip_id}/budget/daily", response_model=List[DailyBudgetOut])
async def get_daily_budget(trip_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    stops_res = await db.execute(select(TripStop).where(TripStop.trip_id == trip_id))
    stops = stops_res.scalars().all()
    
    city_ids = [s.city_id for s in stops if s.city_id is not None]
    cities = {}
    if city_ids:
        cities_res = await db.execute(select(City).where(City.id.in_(city_ids)))
        cities = {c.id: c.name for c in cities_res.scalars().all()}

    stop_ids = [s.id for s in stops]
    stop_activities = []
    if stop_ids:
        activities_res = await db.execute(
            select(StopActivity, Activity)
            .join(Activity, StopActivity.activity_id == Activity.id)
            .where(StopActivity.stop_id.in_(stop_ids))
        )
        stop_activities = activities_res.all()

    daily_budget = []
    current_date = trip.start_date
    while current_date <= trip.end_date:
        day_acc_cost = 0.0
        day_trans_cost = 0.0
        day_act_cost = 0.0
        city_name = "Transit / Unknown"

        active_stop = None
        for stop in stops:
            if stop.arrival_date <= current_date <= stop.departure_date:
                active_stop = stop
                break
        
        if active_stop:
            city_name = cities.get(active_stop.city_id, "Unknown")
            duration = (active_stop.departure_date - active_stop.arrival_date).days + 1
            if duration < 1:
                duration = 1
            
            day_acc_cost = float(active_stop.accommodation_cost or 0) / duration
            day_trans_cost = float(active_stop.transport_cost or 0) / duration

            for sa, act in stop_activities:
                if sa.stop_id == active_stop.id and sa.scheduled_date == current_date:
                    cost = float(sa.cost_override) if sa.cost_override is not None else float(act.avg_cost_usd or 0)
                    day_act_cost += cost

        day_total = day_acc_cost + day_trans_cost + day_act_cost
        
        daily_budget.append(DailyBudgetOut(
            date=current_date,
            city_name=city_name,
            accommodation_cost=round(day_acc_cost, 2),
            transport_cost=round(day_trans_cost, 2),
            activities_cost=round(day_act_cost, 2),
            day_total=round(day_total, 2)
        ))

        current_date += timedelta(days=1)

    return daily_budget
