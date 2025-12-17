"""
Enterprise Matching Service
Combines Hugging Face embeddings with Supabase pgvector search
+ Advanced compatibility scoring engine
"""
from typing import List, Dict, Any, Optional
from app.services.database import DatabaseService
from app.services.embeddings import EmbeddingsService
from app.services.compatibility_engine import CompatibilityEngine, AIEnhancementLayer
import logging

logger = logging.getLogger(__name__)

class MatchingService:
    def __init__(self):
        self.db = DatabaseService()
        self.embeddings = EmbeddingsService()
        self.compatibility = CompatibilityEngine()
        self.ai_enhancement = AIEnhancementLayer(self.embeddings)
    
    async def generate_and_store_embedding(self, auth_id: str, profile_data: Dict[str, Any]) -> bool:
        """
        Generate embedding from profile data and store in database.
        This is called when a user creates or updates their profile.
        """
        try:
            # Construct rich semantic text for embedding
            text = self._build_embedding_text(profile_data)
            
            # Get embedding from Hugging Face
            embedding = await self.embeddings.get_embedding(text)
            
            if not embedding:
                logger.error(f"Failed to generate embedding for user {auth_id}")
                return False
            
            # Store in database
            success = await self.db.update_user_embedding_by_auth_id(auth_id, embedding)
            
            if success:
                logger.info(f"✅ Embedding stored for user {auth_id} (dim: {len(embedding)})")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Embedding generation failed for {auth_id}: {e}")
            return False
    
    def _build_embedding_text(self, profile_data: Dict[str, Any]) -> str:
        """Build rich semantic text from profile data for embedding"""
        parts = []
        
        # Identity
        if profile_data.get("name"):
            parts.append(f"My name is {profile_data['name']}.")
        
        if profile_data.get("grade"):
            parts.append(f"I am a {profile_data['grade']} in high school.")
        
        # Bio
        if profile_data.get("bio"):
            parts.append(f"About me: {profile_data['bio']}")
        
        # Hobbies (weighted higher by repetition)
        hobbies = profile_data.get("hobbies", [])
        if hobbies:
            parts.append(f"My hobbies and interests include: {', '.join(hobbies)}.")
            parts.append(f"I love {', '.join(hobbies[:3])}.")  # Repeat top 3
        
        # Personality
        if profile_data.get("personality"):
            parts.append(f"My personality: {profile_data['personality']}")
        
        # Question answers (very important for matching)
        qa = profile_data.get("question_answers", {})
        if qa:
            for question, answer in qa.items():
                parts.append(f"Q: {question} A: {answer}")
        
        return " ".join(parts)
    
    async def get_recommendations(self, auth_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get profile recommendations using HYBRID approach:
        1. pgvector similarity search (fast, semantic)
        2. Compatibility engine scoring (questionnaire-based)
        3. AI enhancement (NLP boost)
        """
        try:
            # Step 1: Get initial matches from vector search
            vector_matches = await self.db.find_matches_by_auth_id(auth_id, limit * 2)  # Get more for filtering
            
            if not vector_matches:
                return []
            
            # Step 2: Get current user's data
            current_user = await self.db.get_user_by_auth_id(auth_id)
            if not current_user:
                return []
            
            current_answers = current_user.get("question_answers", {}) or {}
            
            # Step 3: Calculate compatibility scores for each match
            scored_recommendations = []
            
            for match in vector_matches:
                target_answers = match.get("question_answers", {}) or {}
                
                # Calculate compatibility score
                compatibility_result = self.compatibility.calculate_compatibility(
                    current_answers,
                    target_answers
                )
                
                # Skip if deal-breakers found
                if compatibility_result["deal_breakers"]:
                    continue
                
                # Apply AI enhancement (NLP boost from personality)
                ai_boost = 1.0
                if current_user.get("personality") and match.get("personality"):
                    try:
                        ai_boost = await self.ai_enhancement.enhance_with_nlp(
                            current_user["personality"],
                            match["personality"]
                        )
                    except Exception as e:
                        logger.warning(f"AI enhancement failed: {e}")
                
                # Final score = compatibility score * AI boost
                final_score = compatibility_result["overall_score"] * ai_boost
                final_score = min(100.0, max(0.0, final_score))  # Clamp to 0-100
                
                scored_recommendations.append({
                    "user_id": match["user_id"],
                    "profile": {
                        "name": match["name"],
                        "bio": match["bio"],
                        "gender": match["gender"],
                        "grade": match["grade"],
                        "hobbies": match["hobbies"] or [],
                        "personality": match["personality"],
                        "question_answers": match["question_answers"] or {},
                        "socials": match["socials"] or {},
                        "profile_pic_url": match["profile_pic_url"]
                    },
                    "similarity_score": match["similarity"],
                    "compatibility_percentage": round(final_score, 1),
                    "compatibility_details": {
                        "score": compatibility_result["overall_score"],
                        "confidence": compatibility_result["confidence"],
                        "category_scores": compatibility_result["category_scores"],
                        "strengths": compatibility_result["strengths"],
                        "explanation": compatibility_result["explanation"],
                        "ai_boost": round(ai_boost, 2)
                    }
                })
            
            # Step 4: Sort by final compatibility score and return top N
            scored_recommendations.sort(
                key=lambda x: x["compatibility_percentage"], 
                reverse=True
            )
            
            recommendations = scored_recommendations[:limit]
            
            logger.info(f"Found {len(recommendations)} scored recommendations for {auth_id}")
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Recommendation fetch failed for {auth_id}: {e}")
            return []
    
    async def process_swipe(self, user_auth_id: str, target_user_id: str, action: str) -> Dict[str, Any]:
        """
        Process a swipe action and check for matches.
        Returns match info if a mutual match is created, including compatibility score.
        """
        try:
            # Get user's internal ID
            user = await self.db.get_user_by_auth_id(user_auth_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user["id"]
            
            # Record the swipe
            await self.db.record_swipe(user_id, target_user_id, action)
            
            result = {
                "swipe_recorded": True,
                "match_created": False,
                "match_id": None,
                "is_super_match": False,
                "compatibility_score": None
            }
            
            # Check for mutual match (only if yes or super)
            if action in ["yes", "super"]:
                # Check if target already swiped on us
                target_action = await self.db.check_mutual_swipe(user_id, target_user_id)
                
                if target_action in ["yes", "super"]:
                    # It's a match! Calculate compatibility
                    target_user = await self.db.get_user_by_id(target_user_id)
                    
                    if target_user:
                        # Calculate compatibility score for the match
                        user_answers = user.get("question_answers", {}) or {}
                        target_answers = target_user.get("question_answers", {}) or {}
                        
                        compatibility_result = self.compatibility.calculate_compatibility(
                            user_answers,
                            target_answers
                        )
                        
                        # Apply AI enhancement
                        ai_boost = 1.0
                        if user.get("personality") and target_user.get("personality"):
                            try:
                                ai_boost = await self.ai_enhancement.enhance_with_nlp(
                                    user["personality"],
                                    target_user["personality"]
                                )
                            except:
                                pass
                        
                        final_score = compatibility_result["overall_score"] * ai_boost
                        final_score = min(100.0, max(0.0, final_score))
                        
                        # It's a match!
                        is_super = action == "super" or target_action == "super"
                        match = await self.db.create_match(
                            user_id, 
                            target_user_id, 
                            is_super,
                            compatibility_score=round(final_score, 1)
                        )
                        
                        if match:
                            result["match_created"] = True
                            result["match_id"] = match["id"]
                            result["is_super_match"] = is_super
                            result["compatibility_score"] = round(final_score, 1)
                            result["compatibility_details"] = {
                                "explanation": compatibility_result["explanation"],
                                "strengths": compatibility_result["strengths"],
                                "category_scores": compatibility_result["category_scores"]
                            }
                            logger.info(f"🎉 Match created! {user_id} <-> {target_user_id} (Score: {final_score:.1f}%)")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Swipe processing failed: {e}")
            raise