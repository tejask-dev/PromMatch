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
    For now, we'll use a simplified approach - in production, verify with Supabase.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Remove "Bearer " prefix if present
    token = authorization.replace("Bearer ", "").strip()
    
    if not token:
        raise HTTPException(status_code=401, detail="Invalid authorization token")
    
    # For now, we'll accept the auth_id directly as a token
    # In production, you should verify the JWT with Supabase
    # This is a simplified version for development
    
    try:
        # Try to decode as JWT (if it's a real token)
        # In production, verify with Supabase's JWT secret
        decoded = jwt.decode(
            token,
            settings.SUPABASE_SERVICE_KEY,  # In production, use the JWT secret
            algorithms=["HS256"],
            options={"verify_signature": False}  # Simplified for now
        )
        return decoded
    except JWTError:
        # If it's not a JWT, treat it as auth_id directly (for development)
        # In production, always require proper JWT
        return {"sub": token, "email": None}

def get_auth_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract auth_id from Authorization header (simplified)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    return authorization.replace("Bearer ", "").strip()

