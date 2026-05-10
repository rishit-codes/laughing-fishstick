from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from auth import get_current_user
from models import User

router = APIRouter(prefix="/api/admin", tags=["admin"])

mock_admin_stats = {
  "users": 12480,
  "newUsers7d": 312,
  "trips": 4218,
  "activeTrips": 982,
  "popularCities": [
    { "name": "Lisbon", "trips": 412, "growth": "+18%" },
    { "name": "Tokyo", "trips": 388, "growth": "+22%" },
    { "name": "Rome", "trips": 364, "growth": "+11%" },
    { "name": "Reykjavik", "trips": 248, "growth": "+34%" },
    { "name": "Marrakech", "trips": 196, "growth": "+9%" },
  ],
  "popularActivities": [
    { "name": "Food walks", "bookings": 1820 },
    { "name": "Sunset cruises", "bookings": 1340 },
    { "name": "Museum passes", "bookings": 1120 },
    { "name": "Hiking guides", "bookings": 980 },
    { "name": "Cooking classes", "bookings": 720 },
  ],
  "trends": [
    { "week": "W1", "value": 60 },
    { "week": "W2", "value": 72 },
    { "week": "W3", "value": 68 },
    { "week": "W4", "value": 84 },
    { "week": "W5", "value": 92 },
    { "week": "W6", "value": 88 },
    { "week": "W7", "value": 105 },
    { "week": "W8", "value": 118 },
  ],
  "recentUsers": [
    { "id": "ru1", "name": "Aanya Iyer", "email": "aanya@traveloop.app", "trips": 7, "plan": "Pro", "joined": "2024-11-04" },
    { "id": "ru2", "name": "Kabir Sen", "email": "kabir@traveloop.app", "trips": 4, "plan": "Free", "joined": "2025-02-18" },
    { "id": "ru3", "name": "Mei Tanaka", "email": "mei@traveloop.app", "trips": 11, "plan": "Pro", "joined": "2024-05-22" },
    { "id": "ru4", "name": "Theo Marin", "email": "theo@traveloop.app", "trips": 3, "plan": "Free", "joined": "2025-09-01" },
    { "id": "ru5", "name": "Cristina López", "email": "cristina@traveloop.app", "trips": 6, "plan": "Pro", "joined": "2025-01-14" },
  ],
}

@router.get("/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    return mock_admin_stats
