"""Referral code generation helpers."""
import random
import re
import string
from sqlmodel import Session, select

from app.models import User


def college_short_code(college_name: str) -> str:
    name = re.sub(r"[^A-Za-z ]", "", college_name).strip().upper()
    if not name:
        return "CAI"
    words = name.split()
    if len(words) == 1:
        return words[0][:8]
    # Acronym for multi-word colleges, e.g. "VIT Chennai" -> VITC, "Sri Sivasubramaniya Nadar" -> SSN
    acronym = "".join(w[0] for w in words if w)
    if len(acronym) >= 3:
        return acronym[:6]
    return (words[0][:4] + acronym)[:8]


def generate_referral_code(session: Session, name: str, college_name: str) -> str:
    short_college = college_short_code(college_name)
    first_name = re.sub(r"[^A-Za-z]", "", name.split(" ")[0]).upper() or "PLAYER"
    for _ in range(25):
        suffix = str(random.randint(10, 99))
        code = f"{short_college}-{first_name}-{suffix}"
        existing = session.exec(select(User).where(User.referral_code == code)).first()
        if not existing:
            return code
    # extreme fallback
    rand = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{short_college}-{rand}"
