from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class UserPhoto(BaseModel):
    id: str
    url: str
    order_index: int
    is_primary: bool = False

class PhotoUpload(BaseModel):
    url: str
    order_index: Optional[int] = None

class UserProfileBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    bio: str = Field(..., max_length=500)
    gender: Literal["male", "female", "non-binary", "other"]
    looking_for: List[str] = Field(default=["male", "female", "non-binary", "other"])
    grade: Literal["junior", "senior"]
    school: Optional[str] = None
    hobbies: List[str]
    socials: Dict[str, str]
    profile_pic_url: Optional[str] = None
    photos: Optional[List[UserPhoto]] = []
    personality: str = Field(..., min_length=30)
    question_answers: Dict[str, Any] = Field(default_factory=dict)

class UserProfileCreate(UserProfileBase):
    user_id: str

class UserProfile(UserProfileBase):
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class SwipeAction(BaseModel):
    target_user_id: str
    action: str = Field(..., pattern="^(yes|no|super)$")

class Match(BaseModel):
    match_id: str
    users: List[str]
    created_at: datetime
    is_super_match: bool = False
    compatibility_score: Optional[float] = None
    other_user: Optional[UserProfile] = None

class Recommendation(BaseModel):
    user_id: str
    profile: UserProfile
    similarity_score: float
    compatibility_percentage: float

class ProfileEmbedding(UserProfileBase):
    user_id: str
