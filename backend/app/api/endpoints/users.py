"""
User Profile API Endpoints
Enterprise-grade with proper validation and error handling
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict
from app.models.schemas import ProfileEmbedding, UserPhoto, PhotoUpload
from app.services.database import DatabaseService
from app.services.matching import MatchingService
from app.api.dependencies import get_current_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/profile", response_model=dict)
async def create_or_update_profile(
    profile: ProfileEmbedding,
    current_user: Dict = Depends(get_current_user)
):
    """
    Create or update user profile and generate embedding.
    This is the main profile setup endpoint.
    """
    db = DatabaseService()
    matching = MatchingService()

    auth_id = current_user["sub"]
    email = current_user.get("email") or f"{auth_id}@prommatch.app"

    # Known columns in the users table — keeps unknown schema fields from causing DB errors
    # Note: "photos" is excluded — stored in user_photos table, not users table
    ALLOWED_COLUMNS = {
        "name", "bio", "gender", "looking_for", "grade", "school",
        "hobbies", "socials", "profile_pic_url",
        "personality", "question_answers",
    }

    try:
        existing = await db.get_user_by_auth_id(auth_id)

        raw = profile.model_dump(exclude={"user_id"})
        profile_data = {k: v for k, v in raw.items() if k in ALLOWED_COLUMNS}

        if existing:
            updated = await db.update_user_by_auth_id(auth_id, profile_data)
            action = "updated"
        else:
            profile_data["email"] = email
            updated = await db.create_user(auth_id, email, profile_data)
            action = "created"

        # Generate and store embedding
        embedding_success = await matching.generate_and_store_embedding(auth_id, profile_data)

        return {
            "success": True,
            "action": action,
            "embedding_generated": embedding_success,
            "user_id": updated.get("id") if updated else None
        }

    except Exception as e:
        logger.error(f"Profile create/update failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/check/{auth_id}", response_model=dict)
async def check_profile_exists(auth_id: str):
    """Check if user has completed their profile — must be defined BEFORE /profile/{auth_id}"""
    db = DatabaseService()

    try:
        exists = await db.user_exists(auth_id)
        return {"exists": exists}
    except Exception as e:
        logger.error(f"Profile check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{auth_id}", response_model=dict)
async def get_profile(auth_id: str):
    """Get user profile by auth ID"""
    db = DatabaseService()

    try:
        profile = await db.get_user_by_auth_id(auth_id)

        if not profile:
            raise HTTPException(status_code=404, detail="User not found")

        profile.pop("embedding", None)

        return {"profile": profile}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# PHOTO ENDPOINTS
# ==========================================

@router.post("/photos", response_model=dict)
async def add_photo(
    photo: PhotoUpload,
    current_user: Dict = Depends(get_current_user)
):
    """Add a photo URL to user's profile (frontend uploads to Supabase Storage, sends URL here)"""
    auth_id = current_user["sub"]
    db = DatabaseService()

    try:
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="User profile not found")

        existing_photos = await db.get_user_photos(user["id"])
        if len(existing_photos) >= 10:
            raise HTTPException(status_code=400, detail="Maximum 10 photos allowed")

        order_index = photo.order_index if photo.order_index is not None else len(existing_photos)
        is_primary = len(existing_photos) == 0  # First photo is primary

        result = await db.add_user_photo(user["id"], photo.url, order_index, is_primary)

        # Sync profile_pic_url if this is the primary photo
        if is_primary:
            await db.update_user_by_auth_id(auth_id, {"profile_pic_url": photo.url})

        return {"success": True, "photo": result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add photo failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/photos/{photo_id}", response_model=dict)
async def delete_photo(
    photo_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete a photo from user's profile"""
    auth_id = current_user["sub"]
    db = DatabaseService()

    try:
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="User profile not found")

        deleted = await db.delete_user_photo(photo_id, user["id"])
        if not deleted:
            raise HTTPException(status_code=404, detail="Photo not found or not authorized")

        # Update profile_pic_url to next primary photo
        remaining = await db.get_user_photos(user["id"])
        primary = next((p for p in remaining if p.get("is_primary")), None)
        if not primary and remaining:
            primary = remaining[0]
            await db.set_primary_photo(user["id"], primary["id"])

        new_pic_url = primary["url"] if primary else None
        await db.update_user_by_auth_id(auth_id, {"profile_pic_url": new_pic_url})

        return {"success": True, "message": "Photo deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete photo failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/photos/{auth_id}", response_model=dict)
async def get_photos(auth_id: str):
    """Get all photos for a user"""
    db = DatabaseService()

    try:
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        photos = await db.get_user_photos(user["id"])
        return {"photos": photos, "count": len(photos)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get photos failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/account/{auth_id}", response_model=dict)
async def delete_account(
    auth_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Delete user account completely.
    Cascades to swipes, matches, and photos.
    """
    from app.core.config import get_settings
    from supabase import create_client

    # Verify user can only delete their own account
    if current_user["sub"] != auth_id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's account")

    db = DatabaseService()
    settings = get_settings()

    try:
        deleted = await db.delete_user_by_auth_id(auth_id)

        if not deleted:
            raise HTTPException(status_code=404, detail="User not found")

        try:
            admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            admin_client.auth.admin.delete_user(auth_id)
            logger.info(f"✅ Auth user deleted: {auth_id}")
        except Exception as auth_error:
            logger.warning(f"Failed to delete auth user {auth_id}: {auth_error}")

        return {"success": True, "message": "Account deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Account deletion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
