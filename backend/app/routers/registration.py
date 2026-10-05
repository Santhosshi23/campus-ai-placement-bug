import os
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import User, College, Referral, GameResult, Event
from app.schemas import RegisterRequest, RegisterResponse
from app.services.referral import generate_referral_code, college_short_code
from app.services.badges import sync_user_badges
from app.services.milestones import milestone_crossed, level_for_count

router = APIRouter(tags=["registration"])

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


def get_or_create_college(session: Session, name: str) -> College:
    name = name.strip()
    existing = session.exec(select(College).where(College.name.ilike(name))).first()
    if existing:
        return existing
    college = College(name=name, short_code=college_short_code(name), target=200)
    session.add(college)
    session.commit()
    session.refresh(college)
    return college


@router.post("/register", response_model=RegisterResponse)
def register(payload: RegisterRequest, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="This email has already registered for the workshop.")

    college = get_or_create_college(session, payload.college_name)

    diagnosis = {}
    ai_score = 35
    profile_type = "THE EXPLORER"
    if payload.game_result_id:
        gr = session.get(GameResult, payload.game_result_id)
        if gr:
            diagnosis = gr.diagnosis
            ai_score = gr.ai_score
            profile_type = gr.profile_type

    referrer = None
    source = payload.source or "direct"
    if payload.referral_code:
        referrer = session.exec(select(User).where(User.referral_code == payload.referral_code.upper())).first()
        if referrer and referrer.email == payload.email.lower():
            referrer = None  # cannot refer yourself
        if referrer:
            source = "referral"

    referral_code = generate_referral_code(session, payload.name, college.name)

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        college_id=college.id,
        branch=payload.branch.strip(),
        graduation_year=payload.graduation_year,
        whatsapp=payload.whatsapp,
        ai_score=ai_score,
        profile_type=profile_type,
        diagnosis=diagnosis,
        referral_code=referral_code,
        referred_by=referrer.referral_code if referrer else None,
        source=source,
        game_result_id=payload.game_result_id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    if payload.game_result_id:
        gr = session.get(GameResult, payload.game_result_id)
        if gr:
            gr.user_id = user.id
            session.add(gr)

    old_count = college.registration_count
    college.registration_count += 1
    college.points += 10
    new_level = level_for_count(college.registration_count)
    college.level = new_level
    session.add(college)

    milestone = milestone_crossed(old_count, college.registration_count)

    if referrer:
        ref_row = Referral(
            referrer_id=referrer.id,
            referred_user_id=user.id,
            referral_code=referrer.referral_code,
            status="registered",
        )
        session.add(ref_row)
        referrer.referral_count += 1
        referrer.successful_referrals += 1
        session.add(referrer)
        session.commit()
        session.refresh(referrer)
        sync_user_badges(session, referrer)

        ref_college = session.get(College, referrer.college_id)
        if ref_college:
            ref_college.points += 5
            session.add(ref_college)

    session.add(Event(type="registration_completed", user_id=user.id, source=source,
                       meta={"college": college.name, "referred": bool(referrer)}))
    session.commit()
    session.refresh(user)
    session.refresh(college)

    return RegisterResponse(
        user_id=user.id,
        name=user.name,
        college=college.name,
        profile_type=user.profile_type,
        ai_score=user.ai_score,
        referral_code=user.referral_code,
        referral_link=f"{FRONTEND_URL}/?ref={user.referral_code}",
        college_milestone_unlocked=milestone["name"] if milestone else None,
    )
