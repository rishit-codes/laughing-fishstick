import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from sqlalchemy import text
from datetime import date
from models import City, Trip, TripStop, CommunityPost, User
from database import DATABASE_URL
import uuid

engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed():
    async with async_session() as db:
        # Create users if not exist
        res = await db.execute(select(User))
        user = res.scalars().first()
        if not user:
            user = User(id=str(uuid.uuid4()), email='test@test.com', name='Test User')
            db.add(user)
            await db.commit()
            
        uid = user.id
            
        new_cities = [
            {'id': 11, 'name': 'Leh/Ladakh', 'country': 'India', 'climate_zone': 'alpine', 'avg_daily_cost_usd': 50},
            {'id': 12, 'name': 'Delhi', 'country': 'India', 'climate_zone': 'temperate', 'avg_daily_cost_usd': 40},
            {'id': 13, 'name': 'Mumbai', 'country': 'India', 'climate_zone': 'tropical', 'avg_daily_cost_usd': 60},
            {'id': 14, 'name': 'Bangalore', 'country': 'India', 'climate_zone': 'tropical', 'avg_daily_cost_usd': 55},
            {'id': 15, 'name': 'New York', 'country': 'USA', 'climate_zone': 'temperate', 'avg_daily_cost_usd': 200},
        ]
        for c in new_cities:
            res = await db.execute(select(City).where(City.id == c['id']))
            if not res.scalars().first():
                db.add(City(**c))
        await db.commit()
        
        # Clear community posts
        await db.execute(text('DELETE FROM community_posts'))
        
        # We need 6 trips and 6 posts based on user's exact input
        posts_data = [
            {'city_id': 11, 'city': 'Leh/Ladakh', 'country': 'India', 'emoji': '🏔️', 'title': 'Peak Life: Ladakh Road Trip', 'body': 'For:\n1. Unreal mountain landscapes\n2. Bike trips\n3. Cold desert vibes\n4. Stargazing\n\nMust-do:\n1. Pangong Lake sunrise\n2. Nubra Valley stay\n3. Leh cafés at night', 'author': 'Kabir', 'avatar': '🏍️'},
            {'city_id': 12, 'city': 'Delhi', 'country': 'India', 'emoji': '🏛️', 'title': 'Peak Life: Delhi Winter Food Runs', 'body': 'For:\n1. Mughal history\n2. Legendary food\n3. Winter atmosphere\n\nMust-do:\n1. Chandni Chowk food walk\n2. India Gate late evening\n3. Humayun’s Tomb photography', 'author': 'Aanya', 'avatar': '🍛'},
            {'city_id': 13, 'city': 'Mumbai', 'country': 'India', 'emoji': '🌊', 'title': 'Peak Life: Mumbai Monsoon Nights', 'body': 'For:\n1. Maximum city energy\n2. Nightlife\n3. Sea vibes\n4. Street food\n\nMust-do:\n1. Marine Drive at midnight\n2. Bandra cafés\n3. Colaba roaming during rain', 'author': 'Mei', 'avatar': '🌧️'},
            {'city_id': 14, 'city': 'Bangalore', 'country': 'India', 'emoji': '🍺', 'title': 'Peak Life: Bangalore Café/Pub Life', 'body': 'For:\n1. Chill urban life\n2. Startup culture\n3. Cafés + pubs\n4. Pleasant weather\n\nMust-do:\n1. Church Street hopping\n2. Cubbon Park morning\n3. Nandi Hills sunrise ride', 'author': 'Theo', 'avatar': '🍺'},
            {'city_id': 15, 'city': 'New York', 'country': 'USA', 'emoji': '🗽', 'title': 'First time in NYC', 'body': 'For:\n1. Broadway shows\n2. Central Park walks\n3. Skyline views\n\nMust-do:\n1. Times Square at night\n2. Brooklyn Bridge walk\n3. 9/11 Memorial', 'author': 'Kabir', 'avatar': '🍎'},
            {'city_id': 2, 'city': 'Barcelona', 'country': 'Spain', 'emoji': '🇪🇸', 'title': 'Peak Life: Barcelona Summer Trip', 'body': 'For:\n1. Beach + architecture combo\n2. Football culture\n3. Vibrant nightlife\n4. Artsy aesthetic\n\nMust-do:\n1. Sagrada Família\n2. Gothic Quarter at night\n3. Sunset at Barceloneta Beach', 'author': 'Aanya', 'avatar': '🍷'},
            {'city_id': 2, 'city': 'Spain Explorer', 'country': 'Spain', 'emoji': '🥘', 'title': 'Spain: The Ultimate Experience', 'body': 'For:\n1. Food\n2. Mediterranean lifestyle\n3. Historic cities\n4. Party + culture balance\n\nMust-do cities:\n1. Madrid\n2. Seville\n3. Valencia\n4. Granada', 'author': 'Theo', 'avatar': '🥘'}
        ]
        
        for pd in posts_data:
            tid = str(uuid.uuid4())
            trip = Trip(
                id=tid,
                owner_id=uid,
                title=f"{pd['city']} Trip",
                description=pd['body'],
                start_date=date(2026, 1, 1),
                end_date=date(2026, 1, 5),
                is_public=True,
                status='completed'
            )
            db.add(trip)
            
            ts = TripStop(
                trip_id=tid,
                city_id=pd['city_id'],
                arrival_date=date(2026, 1, 1),
                departure_date=date(2026, 1, 5),
                stop_order=1
            )
            db.add(ts)
            
            cp = CommunityPost(
                id=str(uuid.uuid4()),
                trip_id=tid,
                author=pd['author'],
                avatar=pd['avatar'],
                city=pd['city'],
                country=pd['country'],
                emoji=pd['emoji'],
                title=pd['title'],
                body=pd['body'],
                likes=100,
                comments=10,
                posted_at='1 week ago',
                cover='linear-gradient(135deg, oklch(0.78 0.13 60), oklch(0.55 0.17 28))'
            )
            db.add(cp)
            
        await db.commit()
        print('Seeded posts and trips!')

asyncio.run(seed())
