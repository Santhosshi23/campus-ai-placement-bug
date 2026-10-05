from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.models import Event
from app.schemas import EventCreate

router = APIRouter(tags=["events"])


@router.post("/event")
def log_event(payload: EventCreate, session: Session = Depends(get_session)):
    event = Event(
        type=payload.type,
        session_id=payload.session_id,
        user_id=payload.user_id,
        source=payload.source,
        meta=payload.meta or {},
    )
    session.add(event)
    session.commit()
    return {"ok": True}
