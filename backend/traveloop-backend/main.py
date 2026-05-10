from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth_router import router as auth_router
from routers.trips import router as trips_router
from routers.trips import share_router
from routers.stops import router as stops_router
from routers.cities import router as cities_router
from routers.budget import router as budget_router

import os
from dotenv import load_dotenv

load_dotenv()

from routers.community import router as community_router
from routers.admin import router as admin_router

from contextlib import asynccontextmanager
from database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Traveloop API", lifespan=lifespan)

allowed_origins = [
    origin.strip() 
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:8080,http://127.0.0.1:8080").split(",") 
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(share_router)
app.include_router(stops_router)
app.include_router(cities_router)
app.include_router(budget_router)
app.include_router(community_router)
app.include_router(admin_router)

@app.get("/")
async def root():
    return {"status": "Traveloop API running"}
