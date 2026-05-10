import uuid
from sqlalchemy import Column, String, Integer, Boolean, Numeric, Date, Time, Text, ForeignKey, SmallInteger
from sqlalchemy import DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    profile_photo_url = Column(Text)
    preferred_currency = Column(String(3), default='INR')
    num_trips_created = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True))

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    region = Column(String(100))
    timezone = Column(String(50))
    currency_code = Column(String(3))
    avg_daily_cost_usd = Column(Numeric(8, 2))
    popularity_score = Column(SmallInteger)
    climate_zone = Column(String(20))
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))

class Trip(Base):
    __tablename__ = "trips"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    cover_photo_url = Column(Text)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    num_travelers = Column(Integer, default=1)
    total_budget_limit = Column(Numeric(12, 2))
    is_public = Column(Boolean, default=False)
    share_token = Column(String(64), unique=True)
    status = Column(String(20), default='draft')
    created_at = Column(DateTime(timezone=True))

class TripStop(Base):
    __tablename__ = "trip_stops"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"))
    arrival_date = Column(Date, nullable=False)
    departure_date = Column(Date, nullable=False)
    stop_order = Column(SmallInteger, nullable=False)
    accommodation_name = Column(String(200))
    accommodation_cost = Column(Numeric(10, 2), default=0)
    transport_type = Column(String(20))
    transport_cost = Column(Numeric(10, 2), default=0)
    flight_number = Column(String(20))

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, autoincrement=True)
    city_id = Column(Integer, ForeignKey("cities.id"))
    name = Column(String(200), nullable=False)
    category = Column(String(30))
    avg_cost_usd = Column(Numeric(8, 2), default=0)
    duration_hours = Column(Numeric(4, 1))
    description = Column(Text)
    rating = Column(Numeric(2, 1))
    group_suitable = Column(Boolean, default=False)

class StopActivity(Base):
    __tablename__ = "stop_activities"
    stop_id = Column(String(36), ForeignKey("trip_stops.id", ondelete="CASCADE"), primary_key=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), primary_key=True)
    scheduled_date = Column(Date)
    scheduled_time = Column(Time)
    cost_override = Column(Numeric(10, 2))
    notes = Column(Text)

class PackingItem(Base):
    __tablename__ = "packing_items"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(200), nullable=False)
    category = Column(String(20))
    is_packed = Column(Boolean, default=False)
    is_suggested = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True))

class CommunityPost(Base):
    __tablename__ = "community_posts"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    author = Column(String(100), nullable=False)
    avatar = Column(String(10))
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    emoji = Column(String(10))
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    posted_at = Column(String(50))
    cover = Column(String(200))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True))
