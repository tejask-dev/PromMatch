"""
Questionnaire API Endpoints
"""
import html
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from typing import Dict, Any
from app.services.questionnaire import get_all_questions, validate_answer
from app.services.database import DatabaseService
from app.services.matching import MatchingService
from app.api.dependencies import get_current_user
from app.core.limiter import limiter

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])
db = DatabaseService()


async def _regenerate_embedding(auth_id: str, updated_user: Dict[str, Any]):
    try:
        matching = MatchingService()
        await matching.generate_and_store_embedding(auth_id, updated_user)
    except Exception:
        pass


@router.get("/questions")
@limiter.limit("30/minute")
async def get_questions(request: Request):
    try:
        questions = get_all_questions()
        return {"success": True, "questions": questions, "total_questions": len(questions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch questions")


@router.post("/submit")
@limiter.limit("5/minute")
async def submit_answers(
    request: Request,
    answers: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
):
    auth_id = current_user["sub"]

    # Validate answer count
    if len(answers) > 100:
        raise HTTPException(status_code=422, detail="Too many answers submitted")

    # Sanitize and validate each answer
    sanitized: Dict[str, Any] = {}
    invalid: list = []
    for question_id, answer in answers.items():
        clean_key = html.escape(str(question_id).strip())[:200]
        if not validate_answer(question_id, answer):
            invalid.append(question_id)
            continue
        # Sanitize string answers
        if isinstance(answer, str):
            sanitized[clean_key] = html.escape(answer.strip())[:1000]
        else:
            sanitized[clean_key] = answer  # Numeric/bool slider values

    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid answers for questions: {', '.join(str(i) for i in invalid[:10])}"
        )

    try:
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")

        existing_answers = user.get("question_answers") or {}
        merged_answers = {**existing_answers, **sanitized}

        updated_user = await db.update_user_by_auth_id(auth_id, {"question_answers": merged_answers})

        if updated_user:
            merged_profile = {**user, "question_answers": merged_answers}
            background_tasks.add_task(_regenerate_embedding, auth_id, merged_profile)

        return {"success": True, "answers_count": len(sanitized)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save answers")


@router.get("/my-answers")
@limiter.limit("30/minute")
async def get_my_answers(
    request: Request,
    current_user: Dict = Depends(get_current_user),
):
    auth_id = current_user["sub"]
    try:
        user = await db.get_user_by_auth_id(auth_id)
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")

        answers = user.get("question_answers", {}) or {}
        return {"success": True, "answers": answers, "answers_count": len(answers)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch answers")
