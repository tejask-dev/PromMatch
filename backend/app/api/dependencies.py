"""
API Dependencies
Authentication and common dependencies
"""
from fastapi import Depends, HTTPException, Header
from typing import Dict, Optional
from jose import jwt, JWTError
from app.core.config import get_settings

settings = get_settings()

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict:
    """
    Verify Supabase JWT token and extract user info.
    If SUPABASE_JWT_SECRET is set, performs full signature verification.
    Otherwise falls back to decoded-only mode for development.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    token = authorization.replace("Bearer ", "").strip()

    if not token:
        raise HTTPException(status_code=401, detail="Invalid authorization token")

    try:
        if settings.SUPABASE_JWT_SECRET:
            # Production: verify signature with actual Supabase JWT secret
            decoded = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        else:
            # Development fallback: decode without signature verification
            decoded = jwt.decode(
                token,
                "",
                algorithms=["HS256"],
                options={"verify_signature": False}
            )

        if not decoded.get("sub"):
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")

        return decoded

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")
