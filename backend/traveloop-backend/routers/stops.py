from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from uuid import UUID

from datetime import timedelta
from database import get_db
from models import Trip, TripStop, User, Activity, StopActivity
from schemas import StopCreate, StopOut, StopUpdate
from auth import get_current_user

router = APIRouter(prefix="/api/trips", tags=["stops"])

@router.post("/{trip_id}/stops")
async def create_stop(trip_id: str, stop_in: StopCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if stop_in.departure_date < stop_in.arrival_date:
        raise HTTPException(status_code=400, detail="Departure date cannot be before arrival date")
        
    # Check overlap
    stops_res = await db.execute(select(TripStop).where(TripStop.trip_id == trip_id))
    existing_stops = stops_res.scalars().all()
    
    for existing in existing_stops:
        if stop_in.arrival_date <= existing.departure_date and stop_in.departure_date >= existing.arrival_date:
            raise HTTPException(status_code=409, detail="Date overlap with existing stop")
            
    new_stop = TripStop(
        trip_id=trip_id,
        city_id=stop_in.city_id,
        arrival_date=stop_in.arrival_date,
        departure_date=stop_in.departure_date,
        stop_order=stop_in.stop_order,
        accommodation_name=stop_in.accommodation_name,
        accommodation_cost=stop_in.accommodation_cost,
        transport_type=stop_in.transport_type,
        transport_cost=stop_in.transport_cost,
        flight_number=stop_in.flight_number
    )
    db.add(new_stop)
    await db.flush()
    
    # Auto-generate itinerary plan
    activities_res = await db.execute(select(Activity).where(Activity.city_id == stop_in.city_id))
    activities = activities_res.scalars().all()
    if activities:
        duration_days = (stop_in.departure_date - stop_in.arrival_date).days + 1
        current_date = stop_in.arrival_date
        for i, act in enumerate(activities):
            act_date = current_date + timedelta(days=(i % duration_days))
            new_sa = StopActivity(
                stop_id=new_stop.id,
                activity_id=act.id,
                scheduled_date=act_date,
                scheduled_time="10:00:00"
            )
            db.add(new_sa)
            
    await db.commit()
    await db.refresh(new_stop)
    
    return {"stop": StopOut.model_validate(new_stop), "conflicts": []}

@router.get("/{trip_id}/stops", response_model=List[StopOut])
async def get_stops(trip_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    stops_res = await db.execute(select(TripStop).where(TripStop.trip_id == trip_id).order_by(TripStop.stop_order))
    return stops_res.scalars().all()

@router.put("/{trip_id}/stops/{stop_id}", response_model=StopOut)
async def update_stop(trip_id: str, stop_id: str, stop_update: StopUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    stop_res = await db.execute(select(TripStop).where(TripStop.id == stop_id, TripStop.trip_id == trip_id))
    stop = stop_res.scalar_one_or_none()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    update_data = stop_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(stop, key, value)
        
    if stop.departure_date < stop.arrival_date:
        raise HTTPException(status_code=400, detail="Departure date cannot be before arrival date")
        
    await db.commit()
    await db.refresh(stop)
    return stop

@router.delete("/{trip_id}/stops/{stop_id}")
async def delete_stop(trip_id: str, stop_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    stop_res = await db.execute(select(TripStop).where(TripStop.id == stop_id, TripStop.trip_id == trip_id))
    stop = stop_res.scalar_one_or_none()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
        
    await db.delete(stop)
    await db.flush()
    
    # Resequence
    stops_res = await db.execute(select(TripStop).where(TripStop.trip_id == trip_id).order_by(TripStop.stop_order))
    remaining_stops = stops_res.scalars().all()
    for i, s in enumerate(remaining_stops):
        s.stop_order = i + 1
        
    await db.commit()
    return {"detail": "Stop deleted and order re-sequenced"}
