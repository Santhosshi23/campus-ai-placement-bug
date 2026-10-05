"""SQLModel data models for CampusAI: The Placement Bug."""
from datetime import datetime
from pydantic import NaiveDatetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, JSON, Column


# ---------------------------------------------------------------------------
# COLLEGE
# ---------------------------------------------------------------------------
class College(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    short_code: str = Field(index=True)  # e.g. AMRITA, VIT, SRM
    target: int = Field(default=200)  # configurable per-college milestone target
    registration_count: int = Field(default=0)
    points: int = Field(default=0)
    level: int = Field(default=0)  # 0 = not activated, 1..4 per milestone
    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# USER
# ---------------------------------------------------------------------------
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    college_id: int = Field(foreign_key="college.id")
    branch: str
    graduation_year: int
    whatsapp: Optional[str] = None

    ai_score: int = Field(default=0)
    profile_type: str = Field(default="THE EXPLORER")
    diagnosis: dict = Field(default_factory=dict, sa_column=Column(JSON))

    referral_code: str = Field(index=True, unique=True)
    referred_by: Optional[str] = Field(default=None)  # referral code used at signup
    referral_count: int = Field(default=0)
    successful_referrals: int = Field(default=0)

    source: str = Field(default="direct")  # mini_game | referral | whatsapp | college_clubs | direct | other
    game_result_id: Optional[int] = Field(default=None, foreign_key="gameresult.id")

    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# REFERRAL
# ---------------------------------------------------------------------------
class Referral(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    referrer_id: int = Field(foreign_key="user.id")
    referred_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    referral_code: str
    status: str = Field(default="clicked")  # clicked | registered
    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# PROJECT + INTEREST
# ---------------------------------------------------------------------------
class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    category: str
    description: str
    difficulty: str  # Easy | Medium | Hard
    skills: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    interest_count: int = Field(default=0)


class ProjectInterest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    project_id: int = Field(foreign_key="project.id")
    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# GAME RESULT
# ---------------------------------------------------------------------------
class GameResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    score: int = Field(default=0)
    time_taken: int = Field(default=0)  # seconds
    answers: list = Field(default_factory=list, sa_column=Column(JSON))
    diagnosis: dict = Field(default_factory=dict, sa_column=Column(JSON))
    profile_type: str = Field(default="THE EXPLORER")
    ai_score: int = Field(default=0)
    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# BADGE + USER_BADGE
# ---------------------------------------------------------------------------
class Badge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)
    name: str
    emoji: str
    description: str
    requirement: int  # referral count required


class UserBadge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    badge_id: int = Field(foreign_key="badge.id")
    unlocked_at: NaiveDatetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# EVENT (funnel / acquisition tracking)
# ---------------------------------------------------------------------------
class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str = Field(index=True)  # visitor | game_started | game_completed | registration_started
    # | registration_completed | referral_click | referral_success
    session_id: Optional[str] = None
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    source: Optional[str] = None
    meta: dict = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)
