"""Pydantic request/response schemas."""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, field_validator


# ---------------- GAME ----------------
class GameAnswer(BaseModel):
    question_id: str
    category: str
    is_correct: bool
    time_taken: int = 0


class GameResultCreate(BaseModel):
    answers: List[GameAnswer]
    total_time: int
    session_id: Optional[str] = None


class GameResultOut(BaseModel):
    game_result_id: int
    score: int
    ai_score: int
    profile_type: str
    diagnosis: Dict[str, Any]


# ---------------- REGISTRATION ----------------
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    college_name: str
    branch: str
    graduation_year: int
    whatsapp: Optional[str] = None
    referral_code: Optional[str] = None
    game_result_id: Optional[int] = None
    source: Optional[str] = "direct"
    session_id: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v

    @field_validator("college_name")
    @classmethod
    def college_not_empty(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("College name is required")
        return v

    @field_validator("branch")
    @classmethod
    def branch_not_empty(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Branch is required")
        return v

    @field_validator("graduation_year")
    @classmethod
    def year_reasonable(cls, v):
        if v < 2024 or v > 2030:
            raise ValueError("Graduation year must be between 2024 and 2030")
        return v


class RegisterResponse(BaseModel):
    user_id: int
    name: str
    college: str
    profile_type: str
    ai_score: int
    referral_code: str
    referral_link: str
    college_milestone_unlocked: Optional[str] = None


# ---------------- PROJECT ----------------
class ProjectInterestRequest(BaseModel):
    user_id: Optional[int] = None
    session_id: Optional[str] = None


# ---------------- EVENT ----------------
class EventCreate(BaseModel):
    type: str
    session_id: Optional[str] = None
    user_id: Optional[int] = None
    source: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
