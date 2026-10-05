import os
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func

from app.database import get_session
from app.models import User, College, UserBadge, Badge, ProjectInterest, Project, Referral
from app.services.badges import next_badge_for

router = APIRouter(tags=["users"])
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")



@router.get("/user/{user_id}")
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    college = session.get(College, user.college_id)

    # Personal rank: order all users by successful_referrals desc, then ai_score desc
    all_users = session.exec(select(User).order_by(User.successful_referrals.desc(), User.ai_score.desc())).all()
    personal_rank = next((i + 1 for i, u in enumerate(all_users) if u.id == user_id), None)

    college_rank = None
    if college:
        colleges_sorted = session.exec(select(College).order_by(College.points.desc())).all()
        college_rank = next((i + 1 for i, c in enumerate(colleges_sorted) if c.id == college.id), None)

    badges = session.exec(
        select(Badge, UserBadge.unlocked_at).join(UserBadge, UserBadge.badge_id == Badge.id).where(UserBadge.user_id == user_id)
    ).all()
    unlocked_codes = {b.code for b, _ in badges}

    from app.services.badges import BADGE_DEFINITIONS
    all_badges = [
        {**bd, "unlocked": bd["code"] in unlocked_codes}
        for bd in BADGE_DEFINITIONS
    ]

    nb = next_badge_for(user.successful_referrals)

    interests = session.exec(
        select(Project).join(ProjectInterest, ProjectInterest.project_id == Project.id).where(ProjectInterest.user_id == user_id)
    ).all()

    conversion = round((user.successful_referrals / user.referral_count * 100), 1) if user.referral_count else 0.0

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "college": college.name if college else None,
        "college_id": user.college_id,
        "branch": user.branch,
        "graduation_year": user.graduation_year,
        "profile_type": user.profile_type,
        "ai_score": user.ai_score,
        "diagnosis": user.diagnosis,
        "referral_code": user.referral_code,
        "referral_link": f"{FRONTEND_URL}/?ref={user.referral_code}",
        "referral_count": user.referral_count,
        "successful_referrals": user.successful_referrals,
        "referral_conversion_pct": conversion,
        "personal_rank": personal_rank,
        "college_rank": college_rank,
        "badges": all_badges,
        "next_badge": nb,
        "project_interests": [{"id": p.id, "title": p.title} for p in interests],
        "created_at": user.created_at.isoformat(),
    }


@router.get("/user/{user_id}/squad")
def get_squad(user_id: int, session: Session = Depends(get_session)):
    """The friends this student has personally brought into CampusAI — shown back to them
    as social proof to encourage inviting even more people."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    recruits = session.exec(
        select(User)
        .join(Referral, Referral.referred_user_id == User.id)
        .where(Referral.referrer_id == user_id, Referral.status == "registered")
        .order_by(User.created_at.desc())
    ).all()

    return {
        "squad_size": len(recruits),
        "members": [
            {"name": r.name, "branch": r.branch, "profile_type": r.profile_type, "joined_at": r.created_at.isoformat()}
            for r in recruits
        ],
    }
