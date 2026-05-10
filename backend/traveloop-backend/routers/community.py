from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from auth import get_current_user
from database import get_db
from models import User, CommunityPost

router = APIRouter(prefix="/api/community", tags=["community"])

class CommunityPostOut(BaseModel):
    id: str
    author: str
    avatar: str
    city: str
    country: str
    emoji: str
    title: str
    body: str
    likes: int
    comments: int
    postedAt: str
    cover: str
    tripId: str | None = None

mock_community_posts = [
    { "id": "c1", "author": "Mei", "avatar": "🌸", "city": "Lisbon", "country": "Portugal", "emoji": "🇵🇹", "title": "Sintra in the rain hit different", "body": "Skipped Pena Palace queues, took the woodland trail. Quietest 90 minutes of the trip.", "likes": 124, "comments": 18, "posted_at": "2 days ago", "cover": "linear-gradient(135deg, oklch(0.78 0.13 60), oklch(0.55 0.17 28))" },
    { "id": "c2", "author": "Theo", "avatar": "🌲", "city": "Reykjavik", "country": "Iceland", "emoji": "🇮🇸", "title": "Aurora at 2am from the parking lot", "body": "We almost didn't go out. Glad we did. Layers > camera. Phone wide-angle was enough.", "likes": 312, "comments": 41, "posted_at": "5 days ago", "cover": "linear-gradient(135deg, oklch(0.55 0.08 220), oklch(0.78 0.04 220))" },
    { "id": "c3", "author": "Kabir", "avatar": "🌊", "city": "Tokyo", "country": "Japan", "emoji": "🇯🇵", "title": "Skip the obvious sushi line", "body": "Gonpachi Nishi-Azabu after 21:30 — same omakase, half the wait. Order the seasonal set.", "likes": 198, "comments": 22, "posted_at": "1 week ago", "cover": "linear-gradient(135deg, oklch(0.42 0.06 150), oklch(0.18 0.01 60))" },
    { "id": "c4", "author": "Aanya", "avatar": "🌅", "city": "Marrakech", "country": "Morocco", "emoji": "🇲🇦", "title": "Riad over hotel — every single time", "body": "Riad Yima had a rooftop with mint tea and 4G. We barely left. Worth the splurge.", "likes": 87, "comments": 9, "posted_at": "2 weeks ago", "cover": "linear-gradient(135deg, oklch(0.78 0.13 75), oklch(0.62 0.15 38))" },
    { "id": "c5", "author": "Mei", "avatar": "🌸", "city": "Cape Town", "country": "South Africa", "emoji": "🇿🇦", "title": "Table Mountain at dawn, no crowds", "body": "Cable car at 07:00 = empty summit. Full panorama with coffee from a thermos. 11/10.", "likes": 156, "comments": 14, "posted_at": "3 weeks ago", "cover": "linear-gradient(135deg, oklch(0.42 0.06 150), oklch(0.55 0.08 220))" },
    { "id": "c6", "author": "Theo", "avatar": "🌲", "city": "Mexico City", "country": "Mexico", "emoji": "🇲🇽", "title": "Roma Norte > Polanco, fight me", "body": "Cheaper rent, better cafes, walkable. We cancelled our second hotel and stayed put.", "likes": 211, "comments": 33, "posted_at": "1 month ago", "cover": "linear-gradient(135deg, oklch(0.62 0.15 38), oklch(0.78 0.13 75))" }
]

@router.get("", response_model=List[CommunityPostOut])
async def get_community_posts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CommunityPost))
    posts = result.scalars().all()
    
    if not posts:
        # Seed mock data
        for p in mock_community_posts:
            new_post = CommunityPost(**p)
            db.add(new_post)
        await db.commit()
        result = await db.execute(select(CommunityPost))
        posts = result.scalars().all()
        
    return [
        CommunityPostOut(
            id=p.id,
            author=p.author,
            avatar=p.avatar,
            city=p.city,
            country=p.country,
            emoji=p.emoji,
            title=p.title,
            body=p.body,
            likes=p.likes,
            comments=p.comments,
            postedAt=p.posted_at,
            cover=p.cover,
            tripId=p.trip_id
        ) for p in posts
    ]
