from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: UUID
    profile_photo_url: Optional[str] = None
    preferred_currency: Optional[str] = None
    num_trips_created: Optional[int] = None
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class TokenOut(BaseModel):
    access_token: str
    token_type: str

class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_photo_url: Optional[str] = None
    start_date: date
    end_date: date
    num_travelers: Optional[int] = 1
    total_budget_limit: Optional[float] = None
    is_public: Optional[bool] = False
    status: Optional[str] = 'draft'

class TripCreate(TripBase):
    pass

class TripOut(TripBase):
    id: UUID
    owner_id: UUID
    share_token: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class StopBase(BaseModel):
    city_id: int
    arrival_date: date
    departure_date: date
    stop_order: int
    accommodation_name: Optional[str] = None
    accommodation_cost: Optional[float] = 0
    transport_type: Optional[str] = None
    transport_cost: Optional[float] = 0
    flight_number: Optional[str] = None

class StopCreate(StopBase):
    pass

class StopOut(StopBase):
    id: UUID
    trip_id: UUID

    model_config = ConfigDict(from_attributes=True)

class ActivityOut(BaseModel):
    id: int
    city_id: Optional[int] = None
    name: str
    category: Optional[str] = None
    avg_cost_usd: Optional[float] = None
    duration_hours: Optional[float] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    group_suitable: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class TripOutWithHealth(TripOut):
    health_score: int

class TripWithStops(TripOut):
    stops: List[StopOut] = []

class BudgetSummaryOut(BaseModel):
    trip_id: UUID
    num_travelers: Optional[int]
    total_budget_limit: Optional[float]
    transport_total: float
    accommodation_total: float
    activities_total: float
    grand_total: float
    cost_per_person: Optional[float]

class DeadDayOut(BaseModel):
    dead_date: date
    city_name: str
    city_id: int
    top_activities: List[ActivityOut] = []

class StopUpdate(BaseModel):
    city_id: Optional[int] = None
    arrival_date: Optional[date] = None
    departure_date: Optional[date] = None
    stop_order: Optional[int] = None
    accommodation_name: Optional[str] = None
    accommodation_cost: Optional[float] = None
    transport_type: Optional[str] = None
    transport_cost: Optional[float] = None
    flight_number: Optional[str] = None
