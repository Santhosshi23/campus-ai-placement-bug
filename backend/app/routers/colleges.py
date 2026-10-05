from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select, func

from app.database import get_session
from app.models import College, User, Referral
from app.services.milestones import next_milestone, MILESTONES

router = APIRouter(tags=["colleges"])


class BossBattleAttempt(BaseModel):
    correct: bool
    user_id: int | None = None


def _trend_for(session: Session, college_id: int) -> str:
    now = datetime.utcnow()
    last_24h = session.exec(
        select(func.count(User.id)).where(User.college_id == college_id, User.created_at >= now - timedelta(hours=24))
    ).one()
    prev_24h = session.exec(
        select(func.count(User.id)).where(
            User.college_id == college_id,
            User.created_at >= now - timedelta(hours=48),
            User.created_at < now - timedelta(hours=24),
        )
    ).one()
    if last_24h > prev_24h:
        return "up"
    if last_24h < prev_24h:
        return "down"
    return "flat"


@router.get("/leaderboard")
def leaderboard(session: Session = Depends(get_session)):
    colleges = session.exec(select(College).order_by(College.points.desc())).all()
    out = []
    for i, c in enumerate(colleges):
        nm = next_milestone(c.registration_count)
        out.append({
            "rank": i + 1,
            "id": c.id,
            "name": c.name,
            "short_code": c.short_code,
            "registrations": c.registration_count,
            "points": c.points,
            "level": c.level,
            "target": c.target,
            "progress_pct": round(min(100, c.registration_count / c.target * 100), 1) if c.target else 0,
            "next_milestone": nm["name"] if nm else "All milestones unlocked",
            "next_milestone_gap": (nm["threshold"] - c.registration_count) if nm else 0,
            "trend": _trend_for(session, c.id),
        })
    return {"colleges": out, "label": "Demo data — simulated campaign"}


@router.get("/colleges")
def list_colleges(session: Session = Depends(get_session)):
    colleges = session.exec(select(College).order_by(College.registration_count.desc())).all()
    return {"colleges": [c.model_dump() for c in colleges]}


@router.get("/college/{college_id}")
def college_detail(college_id: int, session: Session = Depends(get_session)):
    college = session.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    nm = next_milestone(college.registration_count)
    top_referrers = session.exec(
        select(User).where(User.college_id == college_id).order_by(User.successful_referrals.desc()).limit(5)
    ).all()

    rank_row = session.exec(select(College).order_by(College.points.desc())).all()
    rank = next((i + 1 for i, c in enumerate(rank_row) if c.id == college_id), None)

    return {
        "id": college.id,
        "name": college.name,
        "short_code": college.short_code,
        "registrations": college.registration_count,
        "target": college.target,
        "points": college.points,
        "level": college.level,
        "rank": rank,
        "progress_pct": round(min(100, college.registration_count / college.target * 100), 1) if college.target else 0,
        "bugs_remaining": max(0, college.target - college.registration_count),
        "next_milestone": nm["name"] if nm else None,
        "next_milestone_gap": (nm["threshold"] - college.registration_count) if nm else 0,
        "milestones": MILESTONES,
        "top_referrers": [
            {"name": u.name, "referrals": u.successful_referrals, "profile": u.profile_type} for u in top_referrers
        ],
        "boss_battle_unlocked": college.level >= 3,
    }


@router.post("/college/{college_id}/boss-battle")
def attempt_boss_battle(college_id: int, payload: BossBattleAttempt, session: Session = Depends(get_session)):
    college = session.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    if college.level < 3:
        raise HTTPException(status_code=403, detail="Boss Battle unlocks at Level 3 (150 students).")
    gained = 15 if payload.correct else 5
    college.points += gained
    session.add(college)
    session.commit()
    session.refresh(college)
    return {"points_gained": gained, "total_points": college.points}
