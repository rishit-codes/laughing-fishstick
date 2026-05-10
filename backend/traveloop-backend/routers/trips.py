from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from database import get_db
from models import Trip, TripStop, StopActivity, User, Activity
from schemas import TripCreate, TripOut, TripOutWithHealth, TripWithStops, BudgetSummaryOut, DeadDayOut, ActivityOut
from auth import get_current_user

router = APIRouter(prefix="/api/trips", tags=["trips"])
share_router = APIRouter(prefix="/api/share", tags=["share"])

@router.get("", response_model=List[TripOutWithHealth])
async def get_trips(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.owner_id == current_user.id))
    trips = result.scalars().all()
    
    out_trips = []
    for t in trips:
        score = 85
        trip_dict = TripOut.model_validate(t).model_dump()
        trip_dict["health_score"] = score
        out_trips.append(TripOutWithHealth(**trip_dict))
        
    return out_trips

@router.post("", response_model=TripOut)
async def create_trip(trip_in: TripCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_trip = Trip(**trip_in.model_dump(), owner_id=current_user.id)
    db.add(new_trip)
    await db.commit()
    await db.refresh(new_trip)
    return new_trip

@router.get("/{trip_id}", response_model=TripWithStops)
async def get_trip(trip_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    stops_res = await db.execute(select(TripStop).where(TripStop.trip_id == trip_id).order_by(TripStop.stop_order))
    stops = stops_res.scalars().all()
    
    trip_dict = TripOut.model_validate(trip).model_dump()
    trip_dict["stops"] = stops
    return TripWithStops(**trip_dict)

@router.get("/{trip_id}/health")
async def get_health(trip_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    score = 85
    return {"score": score}

@router.get("/{trip_id}/budget", response_model=BudgetSummaryOut)
async def get_budget(trip_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return BudgetSummaryOut(trip_id=trip_id, num_travelers=trip.num_travelers, total_budget_limit=trip.total_budget_limit, transport_total=0, accommodation_total=0, activities_total=0, grand_total=0, cost_per_person=0)

@router.get("/{trip_id}/free-days", response_model=List[DeadDayOut])
async def get_free_days(trip_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return []

@router.post("/{trip_id}/copy", response_model=TripOut)
async def copy_trip(trip_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    original_trip = result.scalar_one_or_none()
    if not original_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if original_trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        new_trip = Trip(
            owner_id=current_user.id,
            title=f"{original_trip.title} (Copy)",
            description=original_trip.description,
            cover_photo_url=original_trip.cover_photo_url,
            start_date=original_trip.start_date,
            end_date=original_trip.end_date,
            num_travelers=original_trip.num_travelers,
            total_budget_limit=original_trip.total_budget_limit,
            is_public=original_trip.is_public,
            status=original_trip.status
        )
        db.add(new_trip)
        await db.flush() 
        
        stops_res = await db.execute(select(TripStop).where(TripStop.trip_id == trip_id))
        original_stops = stops_res.scalars().all()
        
        for stop in original_stops:
            new_stop = TripStop(
                trip_id=new_trip.id,
                city_id=stop.city_id,
                arrival_date=stop.arrival_date,
                departure_date=stop.departure_date,
                stop_order=stop.stop_order,
                accommodation_name=stop.accommodation_name,
                accommodation_cost=stop.accommodation_cost,
                transport_type=stop.transport_type,
                transport_cost=stop.transport_cost,
                flight_number=stop.flight_number
            )
            db.add(new_stop)
            await db.flush()
            
            acts_res = await db.execute(select(StopActivity).where(StopActivity.stop_id == stop.id))
            original_acts = acts_res.scalars().all()
            for act in original_acts:
                new_act = StopActivity(
                    stop_id=new_stop.id,
                    activity_id=act.activity_id,
                    scheduled_date=act.scheduled_date,
                    scheduled_time=act.scheduled_time,
                    cost_override=act.cost_override,
                    notes=act.notes
                )
                db.add(new_act)
                
        await db.commit()
        await db.refresh(new_trip)
        return new_trip
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to copy trip: {str(e)}")

@share_router.get("/{share_token}", response_model=TripWithStops)
async def get_shared_trip(share_token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).where(Trip.share_token == share_token))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    stops_res = await db.execute(select(TripStop).where(TripStop.trip_id == trip.id).order_by(TripStop.stop_order))
    stops = stops_res.scalars().all()
    
    trip_dict = TripOut.model_validate(trip).model_dump()
    trip_dict["stops"] = stops
    return TripWithStops(**trip_dict)
