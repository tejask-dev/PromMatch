"""
API Dependencies — Authentication
"""
from fastapi import Depends, HTTPException, Header
from typing import Dict, Optional
from jose import jwt, JWTError
from app.core.config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict:
    """
    Verify Supabase JWT and return the decoded payload.

    - When SUPABASE_JWT_SECRET is set (production): full HS256 signature + expiry verification.
    - When not set (local dev only): signature check is skipped with a loud warning.
      This path must never be reached in production.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header required")

    token = authorization[len("Bearer "):].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Bearer token is empty")

    try:
        if settings.SUPABASE_JWT_SECRET:
            decoded = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},  # Supabase JWTs don't use 'aud' claim
            )
        else:
            # ⚠️  Dev-only fallback — logs a warning every time it is used
            logger.warning(
                "JWT signature verification is DISABLED (SUPABASE_JWT_SECRET not set). "
                "This is only acceptable in local development."
            )
            decoded = jwt.decode(
                token,
                "",
                algorithms=["HS256"],
                options={"verify_signature": False, "verify_exp": True},
            )

        if not decoded.get("sub"):
            raise HTTPException(status_code=401, detail="Invalid token")

        return decoded

    except JWTError:
        # Do NOT forward the raw JWTError message — it can leak token structure details
        raise HTTPException(status_code=401, detail="Invalid or expired token")
