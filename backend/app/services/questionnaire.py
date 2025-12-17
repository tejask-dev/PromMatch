"""
Prom Matchmaking Questionnaire System
Designed by ML Engineer + Behavioral Psychologist
Age-appropriate, safe, and effective for high school students
"""

from typing import Dict, List, Optional
from enum import Enum

class QuestionCategory(Enum):
    PERSONALITY = "personality"
    VALUES = "values"
    PROM_EXPECTATIONS = "prom_expectations"
    COMFORT_LEVELS = "comfort_levels"
    INTERESTS = "interests"
    COMMUNICATION = "communication"
    DEAL_BREAKERS = "deal_breakers"
    VIBE = "vibe"

# ============================================
# QUESTIONNAIRE DESIGN
# ============================================

PROM_QUESTIONNAIRE = {
    QuestionCategory.PERSONALITY: [
        {
            "id": "social_energy",
            "question": "How do you recharge your social battery?",
            "type": "multiple_choice",
            "options": [
                {"value": "extrovert", "label": "I love big groups and parties", "weight": 1.0},
                {"value": "ambivert", "label": "Mix of both - depends on the day", "weight": 0.8},
                {"value": "introvert", "label": "Small groups or one-on-one time", "weight": 0.6},
                {"value": "selective", "label": "Only with close friends", "weight": 0.4}
            ],
            "why": "Matches social energy levels - prevents one person feeling overwhelmed while the other feels bored",
            "signal": "Social compatibility and energy matching"
        },
        {
            "id": "humor_style",
            "question": "What makes you laugh the most?",
            "type": "multiple_choice",
            "options": [
                {"value": "sarcastic", "label": "Dry humor and sarcasm", "weight": 1.0},
                {"value": "silly", "label": "Goofy jokes and memes", "weight": 1.0},
                {"value": "witty", "label": "Clever wordplay and puns", "weight": 1.0},
                {"value": "wholesome", "label": "Light-hearted and positive humor", "weight": 1.0}
            ],
            "why": "Shared humor is a strong predictor of relationship satisfaction",
            "signal": "Compatibility in communication style and emotional connection"
        },
        {
            "id": "decision_making",
            "question": "When making plans, you prefer to:",
            "type": "multiple_choice",
            "options": [
                {"value": "planner", "label": "Plan everything in advance", "weight": 1.0},
                {"value": "flexible", "label": "Go with the flow", "weight": 1.0},
                {"value": "collaborative", "label": "Decide together in the moment", "weight": 1.0}
            ],
            "why": "Prevents conflict from mismatched planning styles",
            "signal": "Compatibility in decision-making and spontaneity"
        }
    ],
    
    QuestionCategory.VALUES: [
        {
            "id": "kindness_priority",
            "question": "What's most important to you in a prom date?",
            "type": "multiple_choice",
            "options": [
                {"value": "kindness", "label": "Kindness and respect", "weight": 2.0},  # High weight - core value
                {"value": "fun", "label": "Fun and good vibes", "weight": 1.5},
                {"value": "communication", "label": "Good communication", "weight": 1.8},
                {"value": "shared_interests", "label": "Shared interests", "weight": 1.2}
            ],
            "why": "Identifies core values - kindness is non-negotiable for safety",
            "signal": "Fundamental compatibility in values"
        },
        {
            "id": "respect_boundaries",
            "question": "How important is it that your date respects your boundaries?",
            "type": "slider",
            "min": 1,
            "max": 5,
            "default": 5,
            "why": "Safety question - everyone should value this highly",
            "signal": "Safety awareness and mutual respect"
        },
        {
            "id": "inclusivity",
            "question": "I believe everyone should feel welcome at prom, regardless of:",
            "type": "multiple_choice",
            "options": [
                {"value": "background", "label": "Background or identity", "weight": 1.5},
                {"value": "friend_group", "label": "Friend group or popularity", "weight": 1.3},
                {"value": "style", "label": "Style or interests", "weight": 1.0}
            ],
            "why": "Promotes inclusivity and prevents exclusionary behavior",
            "signal": "Open-mindedness and inclusivity values"
        }
    ],
    
    QuestionCategory.PROM_EXPECTATIONS: [
        {
            "id": "prom_style",
            "question": "What's your ideal prom night?",
            "type": "multiple_choice",
            "options": [
                {"value": "romantic", "label": "Romantic and special", "weight": 1.5},
                {"value": "fun_friends", "label": "Fun with friends", "weight": 1.3},
                {"value": "dancing", "label": "Dancing all night", "weight": 1.2},
                {"value": "chill", "label": "Chill and relaxed", "weight": 1.0},
                {"value": "adventure", "label": "Adventure and spontaneity", "weight": 1.1}
            ],
            "why": "Ensures both people have compatible expectations for the night",
            "signal": "Expectation alignment prevents disappointment"
        },
        {
            "id": "after_prom",
            "question": "After prom, I'd like to:",
            "type": "multiple_choice",
            "options": [
                {"value": "group_activity", "label": "Group activity with friends", "weight": 1.0},
                {"value": "one_on_one", "label": "One-on-one time", "weight": 1.2},
                {"value": "go_home", "label": "Head home or rest", "weight": 1.0},
                {"value": "flexible", "label": "See how the night goes", "weight": 1.1}
            ],
            "why": "Important for safety and comfort - no pressure for specific outcomes",
            "signal": "Comfort with post-prom activities"
        },
        {
            "id": "date_type",
            "question": "I'm looking for a prom date who is:",
            "type": "multiple_choice",
            "options": [
                {"value": "romantic_interest", "label": "A romantic interest", "weight": 1.5},
                {"value": "good_friend", "label": "A good friend", "weight": 1.3},
                {"value": "either", "label": "Either works - I'm open", "weight": 1.0}
            ],
            "why": "Sets clear expectations and prevents misunderstandings",
            "signal": "Intent and expectation alignment"
        }
    ],
    
    QuestionCategory.COMFORT_LEVELS: [
        {
            "id": "crowd_comfort",
            "question": "How comfortable are you in large crowds?",
            "type": "slider",
            "min": 1,
            "max": 5,
            "default": 3,
            "why": "Prom has large crowds - matching comfort levels prevents anxiety",
            "signal": "Social comfort and anxiety management"
        },
        {
            "id": "dancing_comfort",
            "question": "How do you feel about dancing?",
            "type": "multiple_choice",
            "options": [
                {"value": "love_it", "label": "Love it - can't wait!", "weight": 1.0},
                {"value": "enjoy_it", "label": "Enjoy it with friends", "weight": 1.0},
                {"value": "okay", "label": "It's okay, not my favorite", "weight": 0.8},
                {"value": "uncomfortable", "label": "A bit uncomfortable", "weight": 0.6}
            ],
            "why": "Dancing is central to prom - matching comfort prevents awkwardness",
            "signal": "Comfort with physical expression and social dancing"
        },
        {
            "id": "photo_comfort",
            "question": "How do you feel about taking photos?",
            "type": "slider",
            "min": 1,
            "max": 5,
            "default": 3,
            "why": "Photos are a big part of prom - matching comfort prevents pressure",
            "signal": "Comfort with being photographed and social media"
        }
    ],
    
    QuestionCategory.INTERESTS: [
        {
            "id": "music_taste",
            "question": "What music gets you excited?",
            "type": "multiple_choice",
            "options": [
                {"value": "pop", "label": "Pop and Top 40", "weight": 1.0},
                {"value": "hip_hop", "label": "Hip-hop and R&B", "weight": 1.0},
                {"value": "rock", "label": "Rock and Alternative", "weight": 1.0},
                {"value": "country", "label": "Country", "weight": 1.0},
                {"value": "electronic", "label": "Electronic/Dance", "weight": 1.0},
                {"value": "varied", "label": "I like a bit of everything", "weight": 1.0}
            ],
            "why": "Music is central to prom - shared taste improves experience",
            "signal": "Musical compatibility for dancing and enjoyment"
        },
        {
            "id": "weekend_style",
            "question": "On weekends, I typically:",
            "type": "multiple_choice",
            "options": [
                {"value": "social", "label": "Hang out with friends", "weight": 1.0},
                {"value": "activities", "label": "Do activities (sports, clubs, etc.)", "weight": 1.0},
                {"value": "relax", "label": "Relax at home", "weight": 1.0},
                {"value": "mixed", "label": "Mix of all of the above", "weight": 1.0}
            ],
            "why": "Lifestyle compatibility beyond just prom night",
            "signal": "General lifestyle and activity preferences"
        }
    ],
    
    QuestionCategory.COMMUNICATION: [
        {
            "id": "communication_style",
            "question": "When planning something, I prefer to:",
            "type": "multiple_choice",
            "options": [
                {"value": "text", "label": "Text back and forth", "weight": 1.0},
                {"value": "call", "label": "Quick call to figure it out", "weight": 1.0},
                {"value": "in_person", "label": "Talk in person", "weight": 1.0},
                {"value": "flexible", "label": "Whatever works", "weight": 1.0}
            ],
            "why": "Communication style compatibility prevents frustration",
            "signal": "Preferred communication methods"
        },
        {
            "id": "conflict_resolution",
            "question": "If there's a misunderstanding, I prefer to:",
            "type": "multiple_choice",
            "options": [
                {"value": "talk_it_out", "label": "Talk it out directly", "weight": 1.5},
                {"value": "give_space", "label": "Give space then discuss", "weight": 1.3},
                {"value": "move_on", "label": "Move on and not dwell", "weight": 1.0}
            ],
            "why": "Conflict resolution style is crucial for any relationship",
            "signal": "Maturity in handling disagreements"
        }
    ],
    
    QuestionCategory.DEAL_BREAKERS: [
        {
            "id": "smoking",
            "question": "How do you feel about smoking/vaping?",
            "type": "multiple_choice",
            "options": [
                {"value": "deal_breaker", "label": "Deal-breaker for me", "weight": -2.0},  # Negative = deal breaker
                {"value": "uncomfortable", "label": "Makes me uncomfortable", "weight": -1.5},
                {"value": "neutral", "label": "Not my thing but okay", "weight": 0.0},
                {"value": "okay", "label": "It's fine", "weight": 0.0}
            ],
            "why": "Health and lifestyle compatibility - important for safety",
            "signal": "Lifestyle and health values"
        },
        {
            "id": "substance_attitude",
            "question": "My attitude toward substances (alcohol, etc.) is:",
            "type": "multiple_choice",
            "options": [
                {"value": "strictly_no", "label": "Strictly no - deal breaker", "weight": -2.0},
                {"value": "uncomfortable", "label": "Makes me uncomfortable", "weight": -1.5},
                {"value": "neutral", "label": "Not my thing but neutral", "weight": 0.0},
                {"value": "okay", "label": "It's fine for others", "weight": 0.0}
            ],
            "why": "Critical safety question - must match for prom safety",
            "signal": "Substance use attitudes and safety compatibility"
        }
    ],
    
    QuestionCategory.VIBE: [
        {
            "id": "energy_level",
            "question": "My energy level is typically:",
            "type": "slider",
            "min": 1,
            "max": 5,
            "default": 3,
            "why": "Energy level matching prevents one person feeling drained",
            "signal": "General energy and activity level"
        },
        {
            "id": "emotional_tone",
            "question": "I tend to be:",
            "type": "multiple_choice",
            "options": [
                {"value": "optimistic", "label": "Optimistic and positive", "weight": 1.0},
                {"value": "realistic", "label": "Realistic and balanced", "weight": 1.0},
                {"value": "thoughtful", "label": "Thoughtful and reflective", "weight": 1.0},
                {"value": "playful", "label": "Playful and lighthearted", "weight": 1.0}
            ],
            "why": "Emotional tone compatibility creates better connection",
            "signal": "General emotional disposition and outlook"
        }
    ]
}

# ============================================
# QUESTIONNAIRE UTILITIES
# ============================================

def get_all_questions() -> List[Dict]:
    """Get all questions in a flat list"""
    all_questions = []
    for category, questions in PROM_QUESTIONNAIRE.items():
        for q in questions:
            q_copy = q.copy()
            q_copy["category"] = category.value
            all_questions.append(q_copy)
    return all_questions

def get_question_by_id(question_id: str) -> Optional[Dict]:
    """Get a specific question by ID"""
    for questions in PROM_QUESTIONNAIRE.values():
        for q in questions:
            if q["id"] == question_id:
                return q
    return None

def validate_answer(question_id: str, answer: any) -> bool:
    """Validate that an answer is appropriate for the question"""
    question = get_question_by_id(question_id)
    if not question:
        return False
    
    if question["type"] == "multiple_choice":
        valid_values = [opt["value"] for opt in question["options"]]
        return answer in valid_values
    elif question["type"] == "slider":
        return isinstance(answer, (int, float)) and question["min"] <= answer <= question["max"]
    
    return False

