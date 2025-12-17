from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class UserProfileBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    bio: str = Field(..., max_length=500)
    gender: Literal["male", "female", "non-binary", "other"]
    looking_for: List[str] = Field(default=["male", "female", "non-binary", "other"])
    grade: Literal["freshman", "sophomore", "junior", "senior"]
    hobbies: List[str]
    socials: Dict[str, str]
    profile_pic_url: Optional[str] = None
    personality: str = Field(..., min_length=50)
    question_answers: Dict[str, str]

class UserProfileCreate(UserProfileBase):
    user_id: str

class UserProfile(UserProfileBase):
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class SwipeAction(BaseModel):
    user_id: str
    target_user_id: str
    action: str = Field(..., pattern="^(yes|no|super)$") # Added 'super' like

class Match(BaseModel):
    match_id: str
    users: List[str]
    created_at: datetime
    is_super_match: bool = False
    other_user: Optional[UserProfile] = None

class Recommendation(BaseModel):
    user_id: str
    profile: UserProfile
    similarity_score: float
    compatibility_percentage: int

class ProfileEmbedding(UserProfileBase): # Inherit to ensure all fields are present
    user_id: str
