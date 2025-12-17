"""
Enterprise-grade Supabase Database Service
Handles all database operations with proper error handling and connection pooling
"""
from supabase import create_client, Client
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class DatabaseService:
    """Singleton Supabase client with connection management"""
    _instance: Optional['DatabaseService'] = None
    _client: Optional[Client] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Supabase client with service role key for backend operations"""
        try:
            self._client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY  # Service key bypasses RLS
            )
            logger.info("✅ Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"❌ Supabase initialization failed: {e}")
            raise
    
    @property
    def client(self) -> Client:
        return self._client
    
    # ==========================================
    # USER OPERATIONS
    # ==========================================
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
    async def create_user(self, auth_id: str, email: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user profile"""
        data = {
            "auth_id": auth_id,
            "email": email,
            **profile_data
        }
        
        result = self._client.table("users").insert(data).execute()
        
        if result.data:
            logger.info(f"User created: {auth_id}")
            return result.data[0]
        raise Exception("Failed to create user")
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
    async def update_user(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile by internal UUID"""
        result = self._client.table("users").update(profile_data).eq("id", user_id).execute()
        
        if result.data:
            logger.info(f"User updated: {user_id}")
            return result.data[0]
        raise Exception(f"Failed to update user: {user_id}")
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=5))
    async def update_user_by_auth_id(self, auth_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile by auth_id (from Supabase Auth)"""
        result = self._client.table("users").update(profile_data).eq("auth_id", auth_id).execute()
        
        if result.data:
            logger.info(f"User updated by auth_id: {auth_id}")
            return result.data[0]
        raise Exception(f"Failed to update user by auth_id: {auth_id}")
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by internal UUID"""
        try:
            result = self._client.table("users").select("*").eq("id", user_id).single().execute()
            return result.data
        except Exception:
            return None
    
    async def get_user_by_auth_id(self, auth_id: str) -> Optional[Dict[str, Any]]:
        """Get user by Supabase Auth ID"""
        result = self._client.table("users").select("*").eq("auth_id", auth_id).execute()
        return result.data[0] if result.data else None
    
    async def user_exists(self, auth_id: str) -> bool:
        """Check if user profile exists"""
        result = self._client.table("users").select("id").eq("auth_id", auth_id).execute()
        return len(result.data) > 0
    
    async def delete_user_by_auth_id(self, auth_id: str) -> bool:
        """
        Delete user account completely.
        This will cascade delete:
        - All swipes (user_id and target_user_id)
        - All matches (user1_id and user2_id)
        - User profile
        """
        try:
            # Delete user by auth_id (cascade will handle swipes and matches)
            result = self._client.table("users").delete().eq("auth_id", auth_id).execute()
            
            # Check if deletion was successful
            # Supabase delete returns empty data array on success
            deleted = result.data is not None
            
            if deleted:
                logger.info(f"✅ User account deleted: {auth_id}")
                return True
            else:
                logger.warning(f"User deletion returned no data: {auth_id}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to delete user {auth_id}: {e}")
            raise
    
    # ==========================================
    # EMBEDDING OPERATIONS
    # ==========================================
    
    async def update_user_embedding(self, user_id: str, embedding: List[float]) -> bool:
        """Update user's embedding vector"""
        # pgvector expects array format - Supabase Python client handles this automatically
        result = self._client.table("users").update({
            "embedding": embedding  # Pass as list, Supabase handles conversion
        }).eq("id", user_id).execute()
        
        return len(result.data) > 0
    
    async def update_user_embedding_by_auth_id(self, auth_id: str, embedding: List[float]) -> bool:
        """Update user's embedding vector by auth_id"""
        # pgvector expects array format
        result = self._client.table("users").update({
            "embedding": embedding  # Pass as list, Supabase handles conversion
        }).eq("auth_id", auth_id).execute()
        
        return len(result.data) > 0
    
    # ==========================================
    # MATCHING OPERATIONS (The MAGIC!)
    # ==========================================
    
    async def find_matches(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Use pgvector similarity search to find compatible matches.
        This is where Supabase shines - vector search at DB level!
        """
        result = self._client.rpc("find_matches", {
            "p_user_id": user_id,
            "p_limit": limit
        }).execute()
        
        return result.data or []
    
    async def find_matches_by_auth_id(self, auth_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Find matches using auth_id (frontend-friendly)"""
        # First get the user's internal ID
        user = await self.get_user_by_auth_id(auth_id)
        if not user:
            return []
        
        return await self.find_matches(user["id"], limit)
    
    # ==========================================
    # SWIPE OPERATIONS
    # ==========================================
    
    async def record_swipe(self, user_id: str, target_user_id: str, action: str) -> Dict[str, Any]:
        """Record a swipe action"""
        result = self._client.table("swipes").upsert({
            "user_id": user_id,
            "target_user_id": target_user_id,
            "action": action
        }).execute()
        
        return result.data[0] if result.data else None
    
    async def record_swipe_by_auth_ids(self, user_auth_id: str, target_auth_id: str, action: str) -> Dict[str, Any]:
        """Record swipe using auth IDs"""
        user = await self.get_user_by_auth_id(user_auth_id)
        target = await self.get_user_by_auth_id(target_auth_id)
        
        if not user or not target:
            raise Exception("User not found")
        
        return await self.record_swipe(user["id"], target["id"], action)
    
    async def get_swipe(self, user_id: str, target_user_id: str) -> Optional[str]:
        """Get swipe action between two users"""
        result = self._client.table("swipes").select("action").eq("user_id", user_id).eq("target_user_id", target_user_id).execute()
        
        return result.data[0]["action"] if result.data else None
    
    async def check_mutual_swipe(self, user_id: str, target_user_id: str) -> Optional[str]:
        """Check if target user has swiped on current user"""
        return await self.get_swipe(target_user_id, user_id)
    
    # ==========================================
    # MATCH OPERATIONS
    # ==========================================
    
    async def create_match(
        self, 
        user1_id: str, 
        user2_id: str, 
        is_super_match: bool = False,
        compatibility_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """Create a match between two users with optional compatibility score"""
        # Ensure consistent ordering (smaller UUID first)
        id1, id2 = sorted([user1_id, user2_id])
        
        match_data = {
            "user1_id": id1,
            "user2_id": id2,
            "is_super_match": is_super_match
        }
        
        if compatibility_score is not None:
            match_data["compatibility_score"] = round(compatibility_score, 2)
        
        result = self._client.table("matches").upsert(match_data).execute()
        
        logger.info(f"Match created: {id1} <-> {id2} (super: {is_super_match}, score: {compatibility_score})")
        return result.data[0] if result.data else None
    
    async def get_user_matches(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all matches for a user with full profile data"""
        # Query matches where user is either user1 or user2
        result1 = self._client.table("matches").select("*").eq("user1_id", user_id).execute()
        result2 = self._client.table("matches").select("*").eq("user2_id", user_id).execute()
        
        matches = []
        
        # Process matches where user is user1
        for match in result1.data or []:
            other_user_id = match["user2_id"]
            other_user = await self.get_user_by_id(other_user_id)
            if other_user:
                # Remove embedding from response
                other_user.pop("embedding", None)
                matches.append({
                    "match_id": match["id"],
                    "is_super_match": match.get("is_super_match", False),
                    "created_at": match["created_at"],
                    "other_user": other_user
                })
        
        # Process matches where user is user2
        for match in result2.data or []:
            other_user_id = match["user1_id"]
            other_user = await self.get_user_by_id(other_user_id)
            if other_user:
                # Remove embedding from response
                other_user.pop("embedding", None)
                matches.append({
                    "match_id": match["id"],
                    "is_super_match": match.get("is_super_match", False),
                    "created_at": match["created_at"],
                    "other_user": other_user
                })
        
        return matches
    
    async def get_user_matches_by_auth_id(self, auth_id: str) -> List[Dict[str, Any]]:
        """Get matches using auth_id"""
        user = await self.get_user_by_auth_id(auth_id)
        if not user:
            return []
        return await self.get_user_matches(user["id"])
