from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session, select, func

from app.database import get_session
from app.models import User, College, Referral, Event

router = APIRouter(tags=["referral"])


class ReferralClick(BaseModel):
    referral_code: str
    session_id: Optional[str] = None


@router.get("/referral/{code}")
def resolve_referral(code: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.referral_code == code.upper())).first()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid or expired referral code")
    college = session.get(College, user.college_id)
    return {
        "valid": True,
        "referrer_name": user.name,
        "college": college.name if college else None,
        "referral_code": user.referral_code,
    }


@router.post("/referral")
def track_referral_click(payload: ReferralClick, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.referral_code == payload.referral_code.upper())).first()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    session.add(Referral(referrer_id=user.id, referral_code=user.referral_code, status="clicked"))
    session.add(Event(type="referral_click", session_id=payload.session_id, source="referral",
                       meta={"referral_code": payload.referral_code}))
    session.commit()
    return {"ok": True}


@router.get("/referral-stats/{code}")
def referral_stats(code: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.referral_code == code.upper())).first()
    if not user:
        raise HTTPException(status_code=404, detail="Referral code not found")
    total_clicks = session.exec(select(func.count(Referral.id)).where(Referral.referrer_id == user.id)).one()
    successful = session.exec(
        select(func.count(Referral.id)).where(Referral.referrer_id == user.id, Referral.status == "registered")
    ).one()
    return {
        "referral_code": code,
        "total_clicks": total_clicks,
        "successful_registrations": successful,
        "conversion_rate": round(successful / total_clicks * 100, 1) if total_clicks else 0,
    }
