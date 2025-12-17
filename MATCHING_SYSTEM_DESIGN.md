# 🎯 Prom Matchmaking System - Complete Design Document

## Executive Summary

This document describes a **production-grade, ethical, and safe** matching system for high school prom dates. The system uses a **hybrid approach** combining:

1. **Questionnaire-based compatibility scoring** (primary)
2. **AI-powered semantic similarity** (enhancement)
3. **Safety-first design** (non-negotiable)

---

## 📋 Table of Contents

1. [Questionnaire Design](#questionnaire-design)
2. [Compatibility Algorithm](#compatibility-algorithm)
3. [AI Enhancement Layer](#ai-enhancement-layer)
4. [Safety & Ethics](#safety--ethics)
5. [Implementation Details](#implementation-details)
6. [Match Result UX](#match-result-ux)
7. [API Design](#api-design)
8. [Database Schema](#database-schema)

---

## 1. Questionnaire Design

### Philosophy

The questionnaire is designed to capture **true compatibility** while being:
- ✅ Age-appropriate and school-safe
- ✅ Fun and engaging
- ✅ Hard to "game" intentionally
- ✅ Balanced across multiple dimensions

### Question Categories

#### 1.1 Personality & Social Energy
**Why**: Prevents one person feeling overwhelmed while the other feels bored.

**Questions**:
- Social energy recharge style (extrovert/ambivert/introvert/selective)
- Humor style (sarcastic/silly/witty/wholesome)
- Decision-making style (planner/flexible/collaborative)

**Weight**: 1.2x (Important for general compatibility)

---

#### 1.2 Values & Respect
**Why**: Core values are non-negotiable for safety and compatibility.

**Questions**:
- Most important trait in a prom date (kindness/fun/communication/shared interests)
- Importance of boundary respect (slider 1-5)
- Inclusivity beliefs (background/friend group/style)

**Weight**: 2.0x (MOST IMPORTANT - Core values)

---

#### 1.3 Prom Expectations
**Why**: Ensures both people have compatible expectations for the night.

**Questions**:
- Ideal prom night style (romantic/fun with friends/dancing/chill/adventure)
- After-prom preferences (group/one-on-one/go home/flexible)
- Date type sought (romantic interest/good friend/either)

**Weight**: 1.8x (Very important - prevents disappointment)

---

#### 1.4 Comfort Levels
**Why**: Prom has large crowds and dancing - matching comfort prevents anxiety.

**Questions**:
- Crowd comfort (slider 1-5)
- Dancing comfort (love it/enjoy it/okay/uncomfortable)
- Photo comfort (slider 1-5)

**Weight**: 1.5x (Important for preventing anxiety)

---

#### 1.5 Interests & Lifestyle
**Why**: Shared interests improve experience, but less critical than values.

**Questions**:
- Music taste (pop/hip-hop/rock/country/electronic/varied)
- Weekend style (social/activities/relax/mixed)

**Weight**: 0.8x (Nice to have)

---

#### 1.6 Communication Style
**Why**: Communication compatibility prevents frustration and conflict.

**Questions**:
- Preferred communication method (text/call/in-person/flexible)
- Conflict resolution style (talk it out/give space/move on)

**Weight**: 1.3x (Important for preventing conflict)

---

#### 1.7 Deal-Breakers
**Why**: Hard incompatibilities that make matching impossible.

**Questions**:
- Smoking/vaping attitude (deal-breaker/uncomfortable/neutral/okay)
- Substance attitude (strictly no/uncomfortable/neutral/okay)

**Weight**: -3.0x (NEGATIVE - Overrides everything if mismatch)

---

#### 1.8 Vibe / Emotional Tone
**Why**: General emotional compatibility creates better connection.

**Questions**:
- Energy level (slider 1-5)
- Emotional tone (optimistic/realistic/thoughtful/playful)

**Weight**: 1.0x (Nice to have)

---

## 2. Compatibility Algorithm

### 2.1 Algorithm Overview

The compatibility algorithm uses **weighted similarity scoring**:

```
Final Score = Σ(Category_Score × Category_Weight) / Σ(Category_Weight)
```

### 2.2 Scoring Process

1. **Deal-Breaker Check** (First)
   - If any deal-breaker mismatch found → Score = 0, Match = Rejected
   - Examples: One person says "strictly no" to substances, other is okay with it

2. **Category-Level Scoring**
   - For each category, calculate similarity between answers
   - Multiple choice: Exact match = 1.0, Different = 0.0
   - Slider: Distance-based similarity (closer = higher)

3. **Weighted Aggregation**
   - Multiply each category score by its weight
   - Sum all weighted scores
   - Divide by sum of weights

4. **Normalization**
   - Scale to 0-100 percentage
   - Apply AI boost (0.9x - 1.1x multiplier)

5. **Confidence Calculation**
   - Based on answer completeness
   - Confidence = (Questions both answered) / (Total questions)

### 2.3 Pseudocode

```python
def calculate_compatibility(user1_answers, user2_answers):
    # Step 1: Check deal-breakers
    deal_breakers = check_deal_breakers(user1_answers, user2_answers)
    if deal_breakers:
        return {"score": 0, "deal_breakers": deal_breakers}
    
    # Step 2: Calculate category scores
    category_scores = {}
    for category in CATEGORIES:
        score = calculate_category_similarity(category, user1_answers, user2_answers)
        category_scores[category] = score
    
    # Step 3: Weighted aggregation
    weighted_sum = 0
    total_weight = 0
    for category, score in category_scores.items():
        weight = CATEGORY_WEIGHTS[category]
        weighted_sum += score * weight
        total_weight += weight
    
    # Step 4: Normalize
    base_score = (weighted_sum / total_weight) * 100
    
    # Step 5: AI boost (from personality embeddings)
    ai_boost = calculate_ai_boost(user1_personality, user2_personality)
    final_score = base_score * ai_boost
    
    return {
        "score": clamp(final_score, 0, 100),
        "category_scores": category_scores,
        "confidence": calculate_confidence(user1_answers, user2_answers)
    }
```

### 2.4 Handling Missing Answers

- Questions with missing answers are **skipped** in that category
- Category score is calculated only from answered questions
- Confidence score reflects completeness
- Minimum 50% answer completeness required for matching

---

## 3. AI Enhancement Layer

### 3.1 Purpose

AI enhances matching **without replacing** the core algorithm:

- ✅ **NLP on personality text**: Semantic similarity boost
- ✅ **Pattern detection**: Inconsistency detection
- ✅ **Match explanations**: Generate "why you matched" text

### 3.2 NLP Enhancement

**How it works**:
1. Generate embeddings for both users' personality descriptions
2. Calculate cosine similarity
3. Convert to boost factor (0.9x - 1.1x)
4. Apply to base compatibility score

**Formula**:
```
similarity = cosine_similarity(embedding1, embedding2)
boost = 0.9 + (similarity × 0.2)  # Maps [0, 1] to [0.9, 1.1]
final_score = base_score × boost
```

**Why this works**:
- Captures semantic meaning in personality text
- Complements questionnaire (which is structured)
- Adds nuance without overruling hard filters

### 3.3 Inconsistency Detection

Detects potentially "gamed" answers:
- Introvert who loves big crowds
- High energy but prefers chill prom
- Flags for manual review (future feature)

### 3.4 Match Explanations

Generates human-readable explanations:
- "You both share similar core values"
- "You have compatible prom expectations"
- "Your personalities complement each other"

---

## 4. Safety & Ethics

### 4.1 Safety Features

✅ **Deal-Breaker System**
- Hard filters for substance attitudes
- Prevents matching incompatible lifestyles

✅ **Consent Flow**
- Both users must swipe "yes" to match
- No automatic matching
- Clear opt-in required

✅ **Block/Report Logic**
- Users can block others
- Report inappropriate behavior
- Admin review system (future)

✅ **Privacy Protections**
- No public ranking
- Matches are private
- Profile visibility controlled

### 4.2 Bias Mitigation

✅ **No Appearance Scoring**
- Profile pictures are for identification only
- No "attractiveness" metrics
- Focus on compatibility, not looks

✅ **Inclusivity Questions**
- Explicit questions about welcoming all backgrounds
- Prevents exclusionary matching
- Promotes diversity

✅ **Grade Compatibility**
- Seniors can match with Juniors/Seniors
- Juniors with Sophomores/Juniors/Seniors
- Prevents age gaps

### 4.3 Ethical Considerations

✅ **No Rejection Language**
- Low matches are "potential matches"
- No "incompatible" messaging
- Positive, encouraging tone

✅ **One Match at a Time**
- Users see one recommendation at a time
- Prevents comparison shopping
- Encourages thoughtful decisions

✅ **Limited Matches**
- Maximum matches per user (configurable)
- Prevents "collecting" matches
- Encourages quality over quantity

---

## 5. Implementation Details

### 5.1 Data Model

**User Profile**:
```json
{
  "id": "uuid",
  "auth_id": "supabase_auth_id",
  "email": "user@example.com",
  "name": "John Doe",
  "bio": "About me...",
  "gender": "male",
  "grade": "senior",
  "looking_for": ["female", "non-binary"],
  "hobbies": ["music", "sports"],
  "personality": "I'm outgoing and love...",
  "question_answers": {
    "social_energy": "extrovert",
    "humor_style": "silly",
    "prom_style": "romantic",
    ...
  },
  "embedding": [0.123, 0.456, ...],  // 384-dim vector
  "profile_pic_url": "https://..."
}
```

**Match**:
```json
{
  "id": "uuid",
  "user1_id": "uuid",
  "user2_id": "uuid",
  "is_super_match": false,
  "compatibility_score": 87.5,
  "created_at": "2025-12-15T..."
}
```

### 5.2 API Endpoints

**Questionnaire**:
- `GET /questionnaire/questions` - Get all questions
- `POST /questionnaire/submit` - Submit answers
- `GET /questionnaire/my-answers` - Get my answers

**Matching**:
- `GET /recommendations/{auth_id}` - Get matches (includes compatibility scores)
- `POST /swipe` - Record swipe action
- `GET /matches/{auth_id}` - Get my matches

### 5.3 Matching Flow

1. User completes questionnaire → Answers stored in `question_answers`
2. User profile updated → Embedding regenerated with answers
3. User requests recommendations → System:
   - Gets vector matches from pgvector
   - Calculates compatibility scores for each
   - Applies AI boost
   - Sorts by final score
   - Returns top N
4. User swipes → System records action
5. Mutual match → System creates match with compatibility score

---

## 6. Match Result UX

### 6.1 Match Display

**Components**:
1. **Compatibility Score** (0-100%)
   - Large, prominent display
   - Color-coded (green = high, yellow = medium, blue = low)

2. **Explanation**
   - "🌟 Excellent Match! You both share similar core values."
   - Generated from compatibility engine

3. **Strengths**
   - Top 3 compatibility strengths
   - "You share similar core values"
   - "You have compatible prom expectations"
   - "Your personalities complement each other"

4. **Category Breakdown** (Optional, expandable)
   - Values: 95%
   - Prom Expectations: 88%
   - Comfort Levels: 82%
   - ...

5. **Profile Preview**
   - Name, bio, hobbies
   - Profile picture
   - Grade, gender

### 6.2 Tone Guidelines

✅ **DO**:
- "🌟 Excellent Match!"
- "💕 Great Match!"
- "✨ Good Match!"
- "👍 Decent Match!"
- "🤝 Potential Match!"

❌ **DON'T**:
- "Poor Match"
- "Incompatible"
- "Not a good fit"
- Any negative language

### 6.3 Match Notification

When a mutual match occurs:
```
🎉 It's a Match!

You and [Name] both swiped yes!

Compatibility: 87%

Why you matched:
- You share similar core values
- You have compatible prom expectations
- Your personalities complement each other

[View Profile] [Start Chat]
```

---

## 7. Scalability Considerations

### 7.1 Performance

✅ **Vector Search at DB Level**
- pgvector with IVFFlat index
- Fast similarity search (milliseconds)
- Scales to millions of users

✅ **Caching**
- Question answers cached in user profile
- Compatibility scores cached in matches
- Reduces computation on repeated requests

✅ **Async Processing**
- Embedding generation is async
- Doesn't block user requests
- Background jobs for heavy computation

### 7.2 Matching Frequency

- **Real-time**: When user requests recommendations
- **On-demand**: Not pre-computed (too expensive)
- **Cached**: Compatibility scores stored in matches

### 7.3 Future Optimizations

- Pre-compute top matches for active users (daily job)
- Use Redis for caching compatibility scores
- Batch embedding generation for new users

---

## 8. Testing & Validation

### 8.1 Test Cases

1. **Deal-Breaker Test**
   - User A: "strictly no" to substances
   - User B: "okay" with substances
   - Expected: Score = 0, Match rejected

2. **High Compatibility Test**
   - Users with identical answers
   - Expected: Score ≈ 100%

3. **Partial Compatibility Test**
   - Users with some matching, some different
   - Expected: Score between 40-80%

4. **Missing Answers Test**
   - Users with incomplete questionnaires
   - Expected: Lower confidence, still calculable

### 8.2 Validation Metrics

- **Accuracy**: Manual review of top matches
- **Safety**: Zero matches with deal-breakers
- **User Satisfaction**: Post-prom survey
- **Bias**: Demographic analysis of matches

---

## 9. Future Enhancements

### 9.1 Advanced Features

- **Clustering**: Group users by personality types
- **Learning**: Improve weights based on successful matches
- **Feedback Loop**: Users rate match quality post-prom
- **Recommendation Explanations**: "You matched because..."

### 9.2 Safety Enhancements

- **Report System**: Flag inappropriate behavior
- **Admin Dashboard**: Review reports and matches
- **Block List**: Prevent matching with blocked users
- **Age Verification**: Ensure all users are high school students

---

## 10. Conclusion

This matching system is designed to be:

✅ **Accurate**: Multi-dimensional compatibility scoring
✅ **Safe**: Deal-breakers and consent flows
✅ **Ethical**: No appearance scoring, bias mitigation
✅ **Scalable**: Database-level vector search
✅ **Transparent**: Clear explanations for matches
✅ **Fun**: Engaging questionnaire and positive UX

The hybrid approach (questionnaire + AI) ensures both **structured compatibility** and **semantic nuance**, making it production-ready for high school prom matchmaking.

---

## Appendix: Question Weights Reference

| Category | Weight | Reason |
|----------|--------|--------|
| Values | 2.0x | Most important - core compatibility |
| Deal-Breakers | -3.0x | Hard rejection if mismatch |
| Prom Expectations | 1.8x | Very important - night alignment |
| Comfort Levels | 1.5x | Important - prevents anxiety |
| Communication | 1.3x | Important - prevents conflict |
| Personality | 1.2x | Important - general compatibility |
| Vibe | 1.0x | Nice to have |
| Interests | 0.8x | Nice to have - less critical |

---

**Document Version**: 1.0  
**Last Updated**: December 15, 2025  
**Author**: Senior ML Engineer + Behavioral Psychologist Team

