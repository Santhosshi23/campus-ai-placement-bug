from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database import get_session
from app.models import GameResult, Event
from app.schemas import GameResultCreate, GameResultOut
from app.services.scoring import compute_diagnosis

router = APIRouter(tags=["game"])


@router.post("/game-result", response_model=GameResultOut)
def submit_game_result(payload: GameResultCreate, session: Session = Depends(get_session)):
    if not payload.answers:
        raise HTTPException(status_code=400, detail="At least one answer is required")
    if len(payload.answers) > 10:
        raise HTTPException(status_code=400, detail="Too many answers submitted")

    answers = [a.model_dump() for a in payload.answers]
    diagnosis = compute_diagnosis(answers, payload.total_time)
    score = diagnosis["correct_count"] * 25

    result = GameResult(
        score=score,
        time_taken=payload.total_time,
        answers=answers,
        diagnosis=diagnosis,
        profile_type=diagnosis["profile_type"],
        ai_score=diagnosis["ai_score"],
    )
    session.add(result)
    session.commit()
    session.refresh(result)

    session.add(Event(type="game_completed", session_id=payload.session_id, meta={"score": score}))
    session.commit()

    return GameResultOut(
        game_result_id=result.id,
        score=score,
        ai_score=diagnosis["ai_score"],
        profile_type=diagnosis["profile_type"],
        diagnosis=diagnosis,
    )
