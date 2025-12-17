"""
Compatibility Scoring Engine
Weighted similarity-based matching algorithm
Designed for high school prom matchmaking
"""

from typing import Dict, List, Tuple, Optional
import math
from app.services.questionnaire import PROM_QUESTIONNAIRE, QuestionCategory, get_question_by_id, validate_answer

# ============================================
# CATEGORY WEIGHTS
# ============================================
# These weights determine how important each category is
# Higher weight = more important for matching

CATEGORY_WEIGHTS = {
    QuestionCategory.VALUES: 2.0,           # Most important - core values
    QuestionCategory.DEAL_BREAKERS: -3.0,    # Deal-breakers override everything
    QuestionCategory.PROM_EXPECTATIONS: 1.8,  # Very important - night expectations
    QuestionCategory.COMFORT_LEVELS: 1.5,    # Important - prevents anxiety
    QuestionCategory.COMMUNICATION: 1.3,     # Important - prevents conflict
    QuestionCategory.PERSONALITY: 1.2,        # Important - general compatibility
    QuestionCategory.VIBE: 1.0,               # Nice to have
    QuestionCategory.INTERESTS: 0.8           # Nice to have - less critical
}

# ============================================
# COMPATIBILITY ENGINE
# ============================================

class CompatibilityEngine:
    """
    Production-grade compatibility scoring engine.
    
    Algorithm:
    1. Calculate category-level similarity scores
    2. Apply category weights
    3. Handle deal-breakers (hard rejections)
    4. Normalize to 0-100 scale
    5. Calculate confidence score
    """
    
    def __init__(self):
        self.category_weights = CATEGORY_WEIGHTS
    
    def calculate_compatibility(
        self, 
        user1_answers: Dict[str, any], 
        user2_answers: Dict[str, any]
    ) -> Dict[str, any]:
        """
        Calculate compatibility score between two users.
        
        Returns:
        {
            "overall_score": float (0-100),
            "confidence": float (0-1),
            "category_scores": Dict,
            "deal_breakers": List[str],
            "strengths": List[str],
            "explanation": str
        }
        """
        # Step 1: Check for deal-breakers first
        deal_breakers = self._check_deal_breakers(user1_answers, user2_answers)
        if deal_breakers:
            return {
                "overall_score": 0.0,
                "confidence": 1.0,
                "category_scores": {},
                "deal_breakers": deal_breakers,
                "strengths": [],
                "explanation": f"Incompatible due to: {', '.join(deal_breakers)}"
            }
        
        # Step 2: Calculate category-level scores
        category_scores = {}
        weighted_sum = 0.0
        total_weight = 0.0
        
        for category in QuestionCategory:
            if category not in self.category_weights:
                continue
                
            category_score = self._calculate_category_score(
                category, 
                user1_answers, 
                user2_answers
            )
            
            if category_score is not None:
                weight = abs(self.category_weights[category])
                category_scores[category.value] = category_score
                weighted_sum += category_score * weight
                total_weight += weight
        
        # Step 3: Normalize to 0-100 scale
        if total_weight > 0:
            normalized_score = (weighted_sum / total_weight) * 100
        else:
            normalized_score = 0.0
        
        # Step 4: Calculate confidence (based on answer completeness)
        confidence = self._calculate_confidence(user1_answers, user2_answers)
        
        # Step 5: Identify strengths
        strengths = self._identify_strengths(category_scores)
        
        # Step 6: Generate explanation
        explanation = self._generate_explanation(
            normalized_score, 
            category_scores, 
            strengths
        )
        
        return {
            "overall_score": round(normalized_score, 1),
            "confidence": round(confidence, 2),
            "category_scores": {k: round(v, 1) for k, v in category_scores.items()},
            "deal_breakers": [],
            "strengths": strengths,
            "explanation": explanation
        }
    
    def _check_deal_breakers(
        self, 
        user1_answers: Dict, 
        user2_answers: Dict
    ) -> List[str]:
        """Check for hard deal-breakers that make matching impossible"""
        deal_breakers = []
        
        # Check smoking/vaping deal-breaker
        if "smoking" in user1_answers and "smoking" in user2_answers:
            u1_val = user1_answers["smoking"]
            u2_val = user2_answers["smoking"]
            
            # If one says it's a deal-breaker and the other does it
            if (u1_val == "deal_breaker" and u2_val not in ["deal_breaker", "uncomfortable"]) or \
               (u2_val == "deal_breaker" and u1_val not in ["deal_breaker", "uncomfortable"]):
                deal_breakers.append("smoking/vaping preferences")
        
        # Check substance attitude deal-breaker
        if "substance_attitude" in user1_answers and "substance_attitude" in user2_answers:
            u1_val = user1_answers["substance_attitude"]
            u2_val = user2_answers["substance_attitude"]
            
            if (u1_val == "strictly_no" and u2_val not in ["strictly_no", "uncomfortable"]) or \
               (u2_val == "strictly_no" and u1_val not in ["strictly_no", "uncomfortable"]):
                deal_breakers.append("substance attitudes")
        
        return deal_breakers
    
    def _calculate_category_score(
        self, 
        category: QuestionCategory, 
        user1_answers: Dict, 
        user2_answers: Dict
    ) -> Optional[float]:
        """Calculate similarity score for a specific category"""
        questions = PROM_QUESTIONNAIRE.get(category, [])
        if not questions:
            return None
        
        total_similarity = 0.0
        answered_count = 0
        
        for question in questions:
            q_id = question["id"]
            
            if q_id not in user1_answers or q_id not in user2_answers:
                continue  # Skip unanswered questions
            
            u1_answer = user1_answers[q_id]
            u2_answer = user2_answers[q_id]
            
            # Calculate similarity for this question
            similarity = self._calculate_question_similarity(question, u1_answer, u2_answer)
            
            if similarity is not None:
                # Apply question weight if it exists
                weight = question.get("weight", 1.0)
                total_similarity += similarity * weight
                answered_count += weight
        
        if answered_count == 0:
            return None
        
        # Normalize by total weight
        return total_similarity / answered_count if answered_count > 0 else 0.0
    
    def _calculate_question_similarity(
        self, 
        question: Dict, 
        answer1: any, 
        answer2: any
    ) -> Optional[float]:
        """Calculate similarity between two answers for a question"""
        if question["type"] == "multiple_choice":
            # Exact match = 1.0, different = 0.0 (can be enhanced with similarity matrix)
            if answer1 == answer2:
                return 1.0
            else:
                # For some questions, partial matches are possible
                # For now, exact match only
                return 0.0
        
        elif question["type"] == "slider":
            # Calculate distance on slider scale
            # Closer = higher similarity
            max_diff = question["max"] - question["min"]
            diff = abs(answer1 - answer2)
            similarity = 1.0 - (diff / max_diff)
            return max(0.0, similarity)
        
        return None
    
    def _calculate_confidence(
        self, 
        user1_answers: Dict, 
        user2_answers: Dict
    ) -> float:
        """Calculate confidence based on answer completeness"""
        all_question_ids = set()
        for questions in PROM_QUESTIONNAIRE.values():
            for q in questions:
                all_question_ids.add(q["id"])
        
        u1_answered = set(user1_answers.keys())
        u2_answered = set(user2_answers.keys())
        
        # Confidence = % of questions both users answered
        both_answered = len(u1_answered.intersection(u2_answered))
        total_questions = len(all_question_ids)
        
        if total_questions == 0:
            return 0.0
        
        return both_answered / total_questions
    
    def _identify_strengths(self, category_scores: Dict[str, float]) -> List[str]:
        """Identify top compatibility strengths"""
        # Sort categories by score
        sorted_categories = sorted(
            category_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        strengths = []
        strength_messages = {
            "values": "You share similar core values",
            "prom_expectations": "You have compatible prom expectations",
            "comfort_levels": "You have similar comfort levels",
            "communication": "You communicate well together",
            "personality": "Your personalities complement each other",
            "vibe": "You have great chemistry",
            "interests": "You share common interests"
        }
        
        # Top 3 strengths
        for category, score in sorted_categories[:3]:
            if score >= 0.7:  # Only highlight strong matches
                msg = strength_messages.get(category, f"Strong {category} match")
                strengths.append(msg)
        
        return strengths
    
    def _generate_explanation(
        self, 
        score: float, 
        category_scores: Dict[str, float], 
        strengths: List[str]
    ) -> str:
        """Generate human-readable explanation of the match"""
        if score >= 85:
            base = "🌟 Excellent Match! "
        elif score >= 70:
            base = "💕 Great Match! "
        elif score >= 55:
            base = "✨ Good Match! "
        elif score >= 40:
            base = "👍 Decent Match! "
        else:
            base = "🤝 Potential Match! "
        
        if strengths:
            base += "You both " + strengths[0].lower() + "."
            if len(strengths) > 1:
                base += f" Plus, {strengths[1].lower()}."
        else:
            base += "You have some compatibility across different areas."
        
        return base

# ============================================
# HYBRID AI ENHANCEMENT
# ============================================

class AIEnhancementLayer:
    """
    AI layer that enhances matching without replacing the core algorithm.
    Uses NLP for open-ended answers and pattern detection.
    """
    
    def __init__(self, embeddings_service):
        self.embeddings = embeddings_service
    
    async def enhance_with_nlp(
        self, 
        user1_personality: str, 
        user2_personality: str
    ) -> float:
        """
        Use NLP embeddings to find semantic similarity in personality descriptions.
        Returns a boost factor (0.9 - 1.1) to apply to the base score.
        """
        try:
            # Get embeddings for personality text
            emb1 = await self.embeddings.get_embedding(user1_personality)
            emb2 = await self.embeddings.get_embedding(user2_personality)
            
            # Calculate cosine similarity
            similarity = self.embeddings.cosine_similarity(emb1, emb2)
            
            # Convert to boost factor (0.9 to 1.1 range)
            # High similarity (0.8+) = 1.1x boost
            # Low similarity (0.3-) = 0.9x reduction
            boost = 0.9 + (similarity * 0.2)
            
            return max(0.9, min(1.1, boost))
        except Exception:
            # If AI fails, return neutral (no boost/reduction)
            return 1.0
    
    def detect_inconsistencies(self, answers: Dict[str, any]) -> List[str]:
        """
        Detect potentially inconsistent answers that might indicate gaming.
        Returns list of warnings.
        """
        warnings = []
        
        # Example: If someone says they're an introvert but loves big parties
        if answers.get("social_energy") == "introvert" and \
           answers.get("crowd_comfort", 0) >= 4:
            warnings.append("Social energy and crowd comfort seem inconsistent")
        
        # Example: High energy but prefers chill prom
        if answers.get("energy_level", 0) >= 4 and \
           answers.get("prom_style") == "chill":
            warnings.append("Energy level and prom style preferences differ")
        
        return warnings
    
    def generate_match_explanation(
        self, 
        base_score: float, 
        category_scores: Dict, 
        user1_name: str, 
        user2_name: str
    ) -> str:
        """
        Generate a personalized explanation of why two people matched.
        This could use an LLM in production, but for now uses templates.
        """
        top_category = max(category_scores.items(), key=lambda x: x[1])[0] if category_scores else None
        
        explanations = {
            "values": f"{user1_name} and {user2_name} share similar core values, which is the foundation of a great prom experience.",
            "prom_expectations": f"Both {user1_name} and {user2_name} have compatible expectations for prom night, so you're on the same page!",
            "comfort_levels": f"{user1_name} and {user2_name} have similar comfort levels, which means you'll both feel at ease together.",
            "communication": f"You both communicate in compatible ways, which will make planning and the night itself smooth and fun!",
            "personality": f"Your personalities complement each other well - you'll bring out the best in each other!",
            "vibe": f"You have great chemistry together - the vibes are right!",
            "interests": f"You share common interests, which gives you plenty to talk about and enjoy together!"
        }
        
        if top_category and top_category in explanations:
            return explanations[top_category]
        
        return f"You have {base_score:.0f}% compatibility! You share some great qualities that make you a promising match for prom."

