"""Badge unlock logic."""
from sqlmodel import Session, select
from app.models import Badge, UserBadge, User

BADGE_DEFINITIONS = [
    {"code": "bug_hunter", "name": "Bug Hunter", "emoji": "🐞", "description": "Referred your first friend.", "requirement": 1},
    {"code": "ai_debugger", "name": "AI Debugger", "emoji": "🔧", "description": "3 successful referrals.", "requirement": 3},
    {"code": "ai_builder", "name": "AI Builder", "emoji": "🤖", "description": "5 successful referrals.", "requirement": 5},
    {"code": "campus_champion", "name": "Campus Champion", "emoji": "🏆", "description": "10 successful referrals.", "requirement": 10},
    {"code": "campusai_legend", "name": "CampusAI Legend", "emoji": "🔥", "description": "25 successful referrals.", "requirement": 25},
]


def ensure_badges_seeded(session: Session):
    for b in BADGE_DEFINITIONS:
        existing = session.exec(select(Badge).where(Badge.code == b["code"])).first()
        if not existing:
            session.add(Badge(**b))
    session.commit()


def next_badge_for(referral_count: int):
    for b in BADGE_DEFINITIONS:
        if referral_count < b["requirement"]:
            return {"name": b["name"], "emoji": b["emoji"], "remaining": b["requirement"] - referral_count}
    return None


def sync_user_badges(session: Session, user: User):
    """Unlock any badge the user now qualifies for. Returns list of newly unlocked badges."""
    newly_unlocked = []
    badges = session.exec(select(Badge)).all()
    owned_ids = {ub.badge_id for ub in session.exec(select(UserBadge).where(UserBadge.user_id == user.id)).all()}
    for badge in badges:
        if badge.id in owned_ids:
            continue
        if user.successful_referrals >= badge.requirement:
            session.add(UserBadge(user_id=user.id, badge_id=badge.id))
            newly_unlocked.append(badge)
    if newly_unlocked:
        session.commit()
    return newly_unlocked
