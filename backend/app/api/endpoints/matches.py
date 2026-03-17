"""
Matching & Swipe API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict
from app.models.schemas import SwipeAction
from app.services.database import DatabaseService
from app.services.matching import MatchingService
from app.api.dependencies import get_current_user
from app.core.limiter import limiter
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/recommendations", response_model=dict)
@limiter.limit("20/minute")
async def get_recommendations(
    request: Request,
    limit: int = 10,
    current_user: Dict = Depends(get_current_user),
):
    auth_id = current_user["sub"]

    # Clamp limit to prevent overfetching
    limit = max(1, min(limit, 50))

    matching = MatchingService()
    try:
        recommendations = await matching.get_recommendations(auth_id, limit)
        return {"recommendations": recommendations, "count": len(recommendations)}
    except Exception as e:
        logger.error(f"Recommendations failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recommendations")


@router.post("/swipe", response_model=dict)
@limiter.limit("60/minute")
async def record_swipe(
    request: Request,
    swipe: SwipeAction,
    current_user: Dict = Depends(get_current_user),
):
    auth_id = current_user["sub"]

    # Prevent self-swipe
    if swipe.target_user_id == auth_id:
        raise HTTPException(status_code=400, detail="Cannot swipe on yourself")

    matching = MatchingService()
    try:
        result = await matching.process_swipe(auth_id, swipe.target_user_id, swipe.action)
        return result
    except Exception as e:
        logger.error(f"Swipe failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to record swipe")


@router.get("/matches", response_model=dict)
@limiter.limit("30/minute")
async def get_matches(
    request: Request,
    current_user: Dict = Depends(get_current_user),
):
    auth_id = current_user["sub"]
    db = DatabaseService()
    try:
        matches = await db.get_user_matches_by_auth_id(auth_id)
        return {"matches": matches, "count": len(matches)}
    except Exception as e:
        logger.error(f"Matches fetch failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch matches")


@router.get("/stats", response_model=dict)
@limiter.limit("30/minute")
async def get_user_stats(
    request: Request,
    current_user: Dict = Depends(get_current_user),
):
    auth_id = current_user["sub"]
    db = DatabaseService()
    try:
        matches = await db.get_user_matches_by_auth_id(auth_id)
        super_matches = [m for m in matches if m.get("is_super_match")]
        return {
            "total_matches": len(matches),
            "super_matches": len(super_matches),
            "regular_matches": len(matches) - len(super_matches),
        }
    except Exception as e:
        logger.error(f"Stats fetch failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")
