from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import Badge

router = APIRouter(tags=["badges"])


@router.get("/badges")
def list_badges(session: Session = Depends(get_session)):
    badges = session.exec(select(Badge).order_by(Badge.requirement)).all()
    return {"badges": [b.model_dump() for b in badges]}
