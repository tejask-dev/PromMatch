"""
Questionnaire API Endpoints
Get questions and submit answers
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict, Any
from app.services.questionnaire import get_all_questions, validate_answer
from app.services.database import DatabaseService
from app.services.matching import MatchingService
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])
db = DatabaseService()

async def _regenerate_embedding(auth_id: str, updated_user: Dict[str, Any]):
    """Background task to regenerate embedding after questionnaire submission"""
    try:
        matching = MatchingService()
        await matching.generate_and_store_embedding(auth_id, updated_user)
    except Exception:
        pass  # Don't crash background task

@router.get("/questions")
async def get_questions():
    """
    Get all questionnaire questions grouped by category.
    Used by frontend to display the questionnaire.
    """
    try:
        questions = get_all_questions()
        return {
            "success": True,
            "questions": questions,
            "total_questions": len(questions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch questions: {str(e)}")

@router.post("/submit")
async def submit_answers(
    answers: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user)
):
    """
    Submit questionnaire answers for the current user.

    Body: {
        "question_id": "answer_value",
        ...
    }
    """
    try:
        auth_id = current_user["sub"]

        # Validate all answers
        invalid_answers = []
        for question_id, answer in answers.items():
            if not validate_answer(question_id, answer):
                invalid_answers.append(question_id)

        if invalid_answers:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid answers for questions: {', '.join(invalid_answers)}"
            )

        # Get current user profile
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Update user with questionnaire answers
        updated_user = await db.update_user_by_auth_id(auth_id, {
            "question_answers": answers
        })

        # Regenerate embedding in background with new answers
        if updated_user:
            merged_profile = {**user, "question_answers": answers}
            background_tasks.add_task(_regenerate_embedding, auth_id, merged_profile)

        return {
            "success": True,
            "message": "Questionnaire answers saved successfully",
            "answers_count": len(answers)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save answers: {str(e)}")

@router.get("/my-answers")
async def get_my_answers(current_user: Dict = Depends(get_current_user)):
    """
    Get the current user's questionnaire answers.
    """
    try:
        auth_id = current_user["sub"]
        user = await db.get_user_by_auth_id(auth_id)

        if not user:
            raise HTTPException(status_code=404, detail="User profile not found")

        answers = user.get("question_answers", {}) or {}

        return {
            "success": True,
            "answers": answers,
            "answers_count": len(answers)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch answers: {str(e)}")
