"""
User Profile API Endpoints
"""
import re
import html
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Optional, Dict
from app.models.schemas import ProfileEmbedding, UserPhoto, PhotoUpload
from app.services.database import DatabaseService
from app.services.matching import MatchingService
from app.api.dependencies import get_current_user
from app.core.limiter import limiter
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# ─── Allowed values (server-side whitelist) ───────────────────────────────────

ALLOWED_GRADES = {"junior", "senior"}
ALLOWED_GENDERS = {"male", "female", "non-binary", "other"}
ALLOWED_SOCIALS_KEYS = {"instagram", "snapchat", "tiktok"}
# Matches alphanumeric, underscore, period, hyphen, and leading @
SOCIAL_HANDLE_RE = re.compile(r'^@?[\w.\-]{1,50}$')

ALLOWED_COLUMNS = {
    "name", "bio", "gender", "looking_for", "grade", "school",
    "hobbies", "socials", "profile_pic_url", "personality", "question_answers",
}


# ─── Input sanitisation helpers ──────────────────────────────────────────────

def _sanitize_str(value: str, max_len: int, field: str) -> str:
    """Strip HTML entities and enforce max length."""
    value = html.escape(value.strip())
    if len(value) > max_len:
        raise HTTPException(status_code=422, detail=f"'{field}' exceeds maximum length of {max_len}")
    return value


def _validate_profile(raw: dict) -> dict:
    """
    Validate and sanitize all user-supplied profile fields.
    Raises HTTP 422 for any invalid or out-of-range value.
    """
    out = {}

    if "name" in raw and raw["name"] is not None:
        out["name"] = _sanitize_str(str(raw["name"]), 100, "name")
        if not out["name"]:
            raise HTTPException(status_code=422, detail="'name' cannot be empty")

    if "bio" in raw and raw["bio"] is not None:
        out["bio"] = _sanitize_str(str(raw["bio"]), 600, "bio")

    if "personality" in raw and raw["personality"] is not None:
        out["personality"] = _sanitize_str(str(raw["personality"]), 3000, "personality")

    if "grade" in raw and raw["grade"] is not None:
        grade = str(raw["grade"]).lower().strip()
        if grade not in ALLOWED_GRADES:
            raise HTTPException(status_code=422, detail=f"'grade' must be one of {sorted(ALLOWED_GRADES)}")
        out["grade"] = grade

    if "gender" in raw and raw["gender"] is not None:
        gender = str(raw["gender"]).lower().strip()
        if gender not in ALLOWED_GENDERS:
            raise HTTPException(status_code=422, detail=f"'gender' must be one of {sorted(ALLOWED_GENDERS)}")
        out["gender"] = gender

    if "looking_for" in raw and raw["looking_for"] is not None:
        lf = raw["looking_for"]
        if not isinstance(lf, list):
            raise HTTPException(status_code=422, detail="'looking_for' must be a list")
        for item in lf:
            if str(item).lower().strip() not in ALLOWED_GENDERS:
                raise HTTPException(status_code=422, detail=f"Invalid value in 'looking_for': {item}")
        out["looking_for"] = [str(i).lower().strip() for i in lf]

    if "school" in raw and raw["school"] is not None:
        out["school"] = _sanitize_str(str(raw["school"]), 200, "school")

    if "hobbies" in raw and raw["hobbies"] is not None:
        hobbies = raw["hobbies"]
        if not isinstance(hobbies, list):
            raise HTTPException(status_code=422, detail="'hobbies' must be a list")
        if len(hobbies) > 15:
            raise HTTPException(status_code=422, detail="Maximum 15 hobbies allowed")
        out["hobbies"] = [_sanitize_str(str(h), 60, "hobby") for h in hobbies]

    if "socials" in raw and raw["socials"] is not None:
        socials = raw["socials"]
        if not isinstance(socials, dict):
            raise HTTPException(status_code=422, detail="'socials' must be an object")
        cleaned = {}
        for key, val in socials.items():
            if key not in ALLOWED_SOCIALS_KEYS:
                continue  # Silently drop unknown social keys
            if val and not SOCIAL_HANDLE_RE.match(str(val)):
                raise HTTPException(status_code=422, detail=f"Invalid format for social handle '{key}'")
            cleaned[key] = str(val).strip() if val else ""
        out["socials"] = cleaned

    if "profile_pic_url" in raw and raw["profile_pic_url"] is not None:
        url = str(raw["profile_pic_url"]).strip()
        if url and not url.startswith("https://"):
            raise HTTPException(status_code=422, detail="'profile_pic_url' must be an HTTPS URL")
        out["profile_pic_url"] = url

    if "question_answers" in raw and raw["question_answers"] is not None:
        qa = raw["question_answers"]
        if not isinstance(qa, dict):
            raise HTTPException(status_code=422, detail="'question_answers' must be an object")
        # Limit keys and values
        if len(qa) > 100:
            raise HTTPException(status_code=422, detail="Too many question answers")
        sanitized_qa = {}
        for k, v in qa.items():
            clean_key = _sanitize_str(str(k), 200, "question key")
            clean_val = _sanitize_str(str(v), 1000, "question answer") if v is not None else ""
            sanitized_qa[clean_key] = clean_val
        out["question_answers"] = sanitized_qa

    return out


# ─── Profile Endpoints ────────────────────────────────────────────────────────

@router.post("/profile", response_model=dict)
@limiter.limit("10/minute")
async def create_or_update_profile(
    request: Request,
    profile: ProfileEmbedding,
    current_user: Dict = Depends(get_current_user),
):
    db = DatabaseService()
    matching = MatchingService()
    auth_id = current_user["sub"]
    email = current_user.get("email") or f"{auth_id}@prommatch.app"

    try:
        raw = profile.model_dump(exclude={"user_id"})
        raw_allowed = {k: v for k, v in raw.items() if k in ALLOWED_COLUMNS}
        profile_data = _validate_profile(raw_allowed)

        existing = await db.get_user_by_auth_id(auth_id)

        if existing:
            await db.update_user_by_auth_id(auth_id, profile_data)
            action = "updated"
        else:
            profile_data["email"] = email
            updated = await db.create_user(auth_id, email, profile_data)
            action = "created"

        await matching.generate_and_store_embedding(auth_id, profile_data)

        return {"success": True, "action": action}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile create/update failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to save profile")


@router.get("/profile/check/{auth_id}", response_model=dict)
@limiter.limit("30/minute")
async def check_profile_exists(
    request: Request,
    auth_id: str,
    current_user: Dict = Depends(get_current_user),
):
    """Only the account owner may check their own profile status."""
    if current_user["sub"] != auth_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db = DatabaseService()
    try:
        exists = await db.user_exists(auth_id)
        return {"exists": exists}
    except Exception as e:
        logger.error(f"Profile check failed: {e}")
        raise HTTPException(status_code=500, detail="Profile check failed")


@router.get("/profile/{auth_id}", response_model=dict)
@limiter.limit("60/minute")
async def get_profile(
    request: Request,
    auth_id: str,
    current_user: Dict = Depends(get_current_user),
):
    """
    Fetch a profile. Only the owner may fetch their own full profile
    (including socials and email). This endpoint is not used to view
    other users — those come through the recommendations endpoint.
    """
    if current_user["sub"] != auth_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db = DatabaseService()
    try:
        profile = await db.get_user_by_auth_id(auth_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Never return the vector embedding to the client
        profile.pop("embedding", None)
        return {"profile": profile}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile fetch failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


# ─── Photo Endpoints ──────────────────────────────────────────────────────────

@router.post("/photos", response_model=dict)
@limiter.limit("10/minute")
async def add_photo(
    request: Request,
    photo: PhotoUpload,
    current_user: Dict = Depends(get_current_user),
):
    auth_id = current_user["sub"]
    db = DatabaseService()

    # Validate URL
    url = str(photo.url).strip()
    if not url.startswith("https://"):
        raise HTTPException(status_code=422, detail="Photo URL must be HTTPS")
    if len(url) > 500:
        raise HTTPException(status_code=422, detail="Photo URL too long")

    try:
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")

        existing_photos = await db.get_user_photos(user["id"])
        if len(existing_photos) >= 10:
            raise HTTPException(status_code=400, detail="Maximum 10 photos allowed")

        order_index = photo.order_index if photo.order_index is not None else len(existing_photos)
        is_primary = len(existing_photos) == 0

        result = await db.add_user_photo(user["id"], url, order_index, is_primary)

        if is_primary:
            await db.update_user_by_auth_id(auth_id, {"profile_pic_url": url})

        return {"success": True, "photo": result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add photo failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to add photo")


@router.delete("/photos/{photo_id}", response_model=dict)
@limiter.limit("10/minute")
async def delete_photo(
    request: Request,
    photo_id: str,
    current_user: Dict = Depends(get_current_user),
):
    auth_id = current_user["sub"]
    db = DatabaseService()

    try:
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")

        # delete_user_photo checks user_id ownership at the DB level
        deleted = await db.delete_user_photo(photo_id, user["id"])
        if not deleted:
            raise HTTPException(status_code=404, detail="Photo not found")

        remaining = await db.get_user_photos(user["id"])
        primary = next((p for p in remaining if p.get("is_primary")), None)
        if not primary and remaining:
            primary = remaining[0]
            await db.set_primary_photo(user["id"], primary["id"])

        new_pic_url = primary["url"] if primary else None
        await db.update_user_by_auth_id(auth_id, {"profile_pic_url": new_pic_url})

        return {"success": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete photo failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete photo")


@router.get("/photos/{auth_id}", response_model=dict)
@limiter.limit("60/minute")
async def get_photos(
    request: Request,
    auth_id: str,
    current_user: Dict = Depends(get_current_user),
):
    """Only the owner can retrieve their own photos via this endpoint."""
    if current_user["sub"] != auth_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db = DatabaseService()
    try:
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")

        photos = await db.get_user_photos(user["id"])
        return {"photos": photos, "count": len(photos)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get photos failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch photos")


# ─── Account Deletion ─────────────────────────────────────────────────────────

@router.delete("/account/{auth_id}", response_model=dict)
@limiter.limit("3/hour")
async def delete_account(
    request: Request,
    auth_id: str,
    current_user: Dict = Depends(get_current_user),
):
    from app.core.config import get_settings
    from supabase import create_client

    if current_user["sub"] != auth_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    db = DatabaseService()
    cfg = get_settings()

    try:
        deleted = await db.delete_user_by_auth_id(auth_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Account not found")

        # Best-effort: delete the Supabase auth user as well
        try:
            admin_client = create_client(cfg.SUPABASE_URL, cfg.SUPABASE_SERVICE_KEY)
            admin_client.auth.admin.delete_user(auth_id)
        except Exception as auth_err:
            logger.warning(f"Auth user delete failed for {auth_id}: {auth_err}")

        logger.info(f"Account deleted: {auth_id}")
        return {"success": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Account deletion failed for {auth_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete account")
