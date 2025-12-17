"""
Matching & Swipe API Endpoints
Enterprise-grade matching with pgvector similarity search
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import SwipeAction
from app.services.database import DatabaseService
from app.services.matching import MatchingService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/recommendations/{auth_id}", response_model=dict)
async def get_recommendations(auth_id: str, limit: int = 10):
    """
    Get profile recommendations using AI-powered vector similarity search.
    
    This endpoint:
    1. Uses pgvector to find similar profiles at the database level
    2. Filters by gender preferences and grade
    3. Excludes already-swiped users
    4. Returns ranked by compatibility percentage
    """
    matching = MatchingService()
    
    try:
        recommendations = await matching.get_recommendations(auth_id, limit)
        
        return {
            "recommendations": recommendations,
            "count": len(recommendations)
        }
        
    except Exception as e:
        logger.error(f"Recommendations fetch failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/swipe", response_model=dict)
async def record_swipe(swipe: SwipeAction):
    """
    Record a swipe action (yes/no/super) and check for matches.
    
    If both users have swiped 'yes' or 'super' on each other,
    a match is automatically created.
    
    Returns:
    - swipe_recorded: bool
    - match_created: bool
    - match_id: str (if match created)
    - is_super_match: bool (if either user super-liked)
    """
    matching = MatchingService()
    
    try:
        result = await matching.process_swipe(
            swipe.user_id,  # This is auth_id from frontend
            swipe.target_user_id,  # This is internal user_id
            swipe.action
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Swipe failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/matches/{auth_id}", response_model=dict)
async def get_matches(auth_id: str):
    """
    Get all matches for a user.
    
    Returns full profile data of matched users along with:
    - match_id
    - is_super_match
    - created_at
    """
    db = DatabaseService()
    
    try:
        matches = await db.get_user_matches_by_auth_id(auth_id)
        
        return {
            "matches": matches,
            "count": len(matches)
        }
        
    except Exception as e:
        logger.error(f"Matches fetch failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/{auth_id}", response_model=dict)
async def get_user_stats(auth_id: str):
    """Get user statistics (matches count, etc.)"""
    db = DatabaseService()
    
    try:
        matches = await db.get_user_matches_by_auth_id(auth_id)
        super_matches = [m for m in matches if m.get("is_super_match")]
        
        return {
            "total_matches": len(matches),
            "super_matches": len(super_matches),
            "regular_matches": len(matches) - len(super_matches)
        }
        
    except Exception as e:
        logger.error(f"Stats fetch failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))