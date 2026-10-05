"""Seed CampusAI with realistic, clearly-labelled DEMO data.

Run standalone with:  python -m seed.seed_data
(executed automatically on first API startup if the DB is empty)
"""
import random
from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.database import engine, init_db
from app.models import (
    College, User, Referral, Project, ProjectInterest, GameResult, Event, Badge, UserBadge,
)
from app.services.referral import generate_referral_code
from app.services.badges import ensure_badges_seeded, sync_user_badges, BADGE_DEFINITIONS
from app.services.milestones import level_for_count
from app.services.scoring import compute_diagnosis

random.seed(42)

COLLEGES = [
    {"name": "VIT Chennai", "short": "VITC", "target": 250, "count": 140},
    {"name": "Amrita Vishwa Vidyapeetham", "short": "AMRITA", "target": 160, "count": 126},
    {"name": "SRM Institute of Science and Technology", "short": "SRM", "target": 120, "count": 34},
    {"name": "College of Engineering, Guindy (CEG)", "short": "CEG", "target": 80, "count": 18},
    {"name": "SSN College of Engineering", "short": "SSN", "target": 60, "count": 7},
    {"name": "Other Engineering Colleges", "short": "OTHER", "target": 40, "count": 2},
]

FIRST_NAMES = [
    "Santhosshi", "Arjun", "Priya", "Karthik", "Divya", "Rahul", "Sneha", "Vignesh", "Meera", "Aditya",
    "Keerthi", "Sanjay", "Lakshmi", "Harish", "Pooja", "Naveen", "Ananya", "Vikram", "Deepika", "Suresh",
    "Nithya", "Gokul", "Swathi", "Praveen", "Anjali", "Mohan", "Kavya", "Dinesh", "Rithika", "Ashwin",
    "Varsha", "Bala", "Shruthi", "Manoj", "Ishwarya", "Kiran", "Nandhini", "Vivek", "Tanvi", "Yogesh",
    "Pavithra", "Siddharth", "Aishwarya", "Ramesh", "Divyashree", "Hari", "Monisha", "Akash", "Gayathri", "Sathish",
]
LAST_NAMES = [
    "Kumar", "Raj", "Sharma", "Iyer", "Nair", "Reddy", "Krishnan", "Menon", "Pillai", "Varma",
    "Rao", "Shetty", "Subramanian", "Balaji", "Narayan", "Gopal", "Mani", "Prasad", "Venkat", "Ganesh",
]
BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "AI & ML", "AI & DS"]

QUESTION_CATEGORIES = ["coding", "problem_solving", "ai_awareness", "genai", "problem_solving"]

PROJECTS = [
    {
        "title": "AI Interview Coach",
        "category": "Career",
        "description": "Practice technical and HR interviews with an AI coach that gives instant feedback.",
        "difficulty": "Medium",
        "skills": ["Python", "LLM", "Prompt Engineering", "APIs"],
        "interest_count": 347,
    },
    {
        "title": "AI Study Buddy",
        "category": "Education",
        "description": "A personalised study assistant that creates quizzes and summaries from your notes.",
        "difficulty": "Easy",
        "skills": ["Python", "LLM", "RAG", "Prompt Engineering"],
        "interest_count": 214,
    },
    {
        "title": "AI Expense Coach",
        "category": "Finance",
        "description": "Tracks spends from SMS/UPI and nudges students toward better money habits.",
        "difficulty": "Medium",
        "skills": ["Python", "NLP", "Data Analysis", "APIs"],
        "interest_count": 158,
    },
    {
        "title": "AI Symptom Checker",
        "category": "Healthcare",
        "description": "A conversational assistant that triages common symptoms and suggests next steps.",
        "difficulty": "Hard",
        "skills": ["Python", "LLM", "Healthcare APIs", "Safety Guardrails"],
        "interest_count": 131,
    },
    {
        "title": "AI Meeting Notes Summarizer",
        "category": "Productivity",
        "description": "Turns long lecture/meeting recordings into clean action-item summaries.",
        "difficulty": "Easy",
        "skills": ["Python", "Speech-to-Text", "LLM", "Prompt Engineering"],
        "interest_count": 189,
    },
    {
        "title": "AI Accessibility Reader",
        "category": "Social Impact",
        "description": "Reads out and describes screens/images for visually impaired students in real time.",
        "difficulty": "Hard",
        "skills": ["Python", "Computer Vision", "Text-to-Speech", "LLM"],
        "interest_count": 97,
    },
    {
        "title": "AI Campus Assistant",
        "category": "Campus Life",
        "description": "Answers hostel/mess/timetable questions instantly via WhatsApp bot.",
        "difficulty": "Easy",
        "skills": ["Python", "WhatsApp API", "LLM", "Automation"],
        "interest_count": 176,
    },
    {
        "title": "AI Code Review Companion",
        "category": "Developer Tools",
        "description": "Reviews pull requests and explains bugs in plain English before your mentor sees them.",
        "difficulty": "Medium",
        "skills": ["Python", "Git", "LLM", "Static Analysis"],
        "interest_count": 223,
    },
]

SOURCE_WEIGHTS = [
    ("mini_game", 0.42),
    ("referral", 0.26),
    ("whatsapp", 0.16),
    ("college_clubs", 0.11),
    ("direct", 0.05),
]


def weighted_source():
    r = random.random()
    acc = 0
    for src, w in SOURCE_WEIGHTS:
        acc += w
        if r <= acc:
            return src
    return "direct"


def random_answers():
    answers = []
    for i, cat in enumerate(QUESTION_CATEGORIES):
        correct = random.random() < random.choice([0.3, 0.5, 0.6, 0.75, 0.85])
        answers.append({
            "question_id": f"q{i+1}",
            "category": cat,
            "is_correct": correct,
            "time_taken": random.randint(5, 20),
        })
    return answers


def random_email(name: str, idx: int) -> str:
    handle = name.lower().replace(" ", ".")
    domains = ["student.edu.in", "college.ac.in", "campus.edu.in"]
    return f"{handle}{idx}@{random.choice(domains)}"


def run_seed(session: Session):
    print("[seed] Seeding CampusAI demo data ...")
    ensure_badges_seeded(session)

    college_objs = {}
    for c in COLLEGES:
        college = College(
            name=c["name"], short_code=c["short"], target=c["target"],
            registration_count=0, points=0, level=0,
        )
        session.add(college)
        session.commit()
        session.refresh(college)
        college_objs[c["name"]] = college

    projects = []
    for p in PROJECTS:
        proj = Project(**p)
        session.add(proj)
        projects.append(proj)
    session.commit()
    for p in projects:
        session.refresh(p)

    now = datetime.utcnow()
    all_users = []
    email_counter = 1

    for c in COLLEGES:
        college = college_objs[c["name"]]
        n = c["count"]
        college_users = []
        for i in range(n):
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            email = random_email(name, email_counter)
            email_counter += 1
            branch = random.choice(BRANCHES)
            grad_year = 2026

            answers = random_answers()
            total_time = sum(a["time_taken"] for a in answers)
            diagnosis = compute_diagnosis(answers, total_time)

            days_ago = random.uniform(0, 6.9)
            created_at = now - timedelta(days=days_ago, hours=random.uniform(0, 23))

            source = weighted_source()
            referrer = None
            if source == "referral" and college_users:
                referrer = random.choice(college_users)

            referral_code = generate_referral_code(session, name, c["name"])
            user = User(
                name=name, email=email, college_id=college.id, branch=branch,
                graduation_year=grad_year, whatsapp=None,
                ai_score=diagnosis["ai_score"], profile_type=diagnosis["profile_type"],
                diagnosis=diagnosis, referral_code=referral_code,
                referred_by=referrer.referral_code if referrer else None,
                source=source if not referrer else "referral",
                created_at=created_at,
            )
            session.add(user)
            session.commit()
            session.refresh(user)

            game_result = GameResult(
                user_id=user.id, score=diagnosis["correct_count"] * 25, time_taken=total_time,
                answers=answers, diagnosis=diagnosis, profile_type=diagnosis["profile_type"],
                ai_score=diagnosis["ai_score"], created_at=created_at,
            )
            session.add(game_result)

            if referrer:
                session.add(Referral(
                    referrer_id=referrer.id, referred_user_id=user.id, referral_code=referrer.referral_code,
                    status="registered", created_at=created_at,
                ))
                referrer.referral_count += 1
                referrer.successful_referrals += 1
                session.add(referrer)

            session.add(Event(type="registration_completed", user_id=user.id, source=user.source, created_at=created_at))
            college_users.append(user)
            all_users.append(user)

        session.commit()
        college.registration_count = len(college_users)
        college.level = level_for_count(college.registration_count)
        session.add(college)
        session.commit()

    # extra click/visitor/funnel noise events for realistic funnel shape
    for _ in range(int(len(all_users) * 1.8)):
        session.add(Event(type="visitor", created_at=now - timedelta(hours=random.uniform(0, 160))))
    for _ in range(int(len(all_users) * 1.3)):
        session.add(Event(type="game_started", created_at=now - timedelta(hours=random.uniform(0, 160))))
    for _ in range(int(len(all_users) * 1.1)):
        session.add(Event(type="registration_started", created_at=now - timedelta(hours=random.uniform(0, 160))))
    for _ in range(45):
        session.add(GameResult(
            user_id=None, score=random.choice([0, 25, 50, 75]), time_taken=random.randint(20, 60),
            answers=random_answers(), diagnosis={}, profile_type="THE EXPLORER", ai_score=random.randint(20, 60),
            created_at=now - timedelta(hours=random.uniform(0, 160)),
        ))
    for _ in range(int(len(all_users) * 0.4)):
        session.add(Referral(
            referrer_id=random.choice(all_users).id, referral_code="CLICK-ONLY", status="clicked",
            created_at=now - timedelta(hours=random.uniform(0, 160)),
        ))
    session.commit()

    # college points = registrations*10 + 5 per successful referral originating from that college
    for c in COLLEGES:
        college = college_objs[c["name"]]
        referral_bonus = session.exec(
            select(Referral).join(User, Referral.referrer_id == User.id).where(
                User.college_id == college.id, Referral.status == "registered"
            )
        ).all()
        college.points = college.registration_count * 10 + len(referral_bonus) * 5
        session.add(college)
    session.commit()

    # badges based on successful_referrals
    for u in all_users:
        if u.successful_referrals > 0:
            sync_user_badges(session, u)

    # project interests
    for u in all_users:
        if random.random() < 0.65:
            picks = random.sample(projects, k=random.choice([1, 1, 2]))
            for p in picks:
                existing = session.exec(
                    select(ProjectInterest).where(ProjectInterest.user_id == u.id, ProjectInterest.project_id == p.id)
                ).first()
                if not existing:
                    session.add(ProjectInterest(user_id=u.id, project_id=p.id))
    session.commit()

    print(f"[seed] Done. {len(all_users)} demo students across {len(COLLEGES)} colleges.")


if __name__ == "__main__":
    init_db()
    with Session(engine) as session:
        existing = session.exec(select(College)).first()
        if existing:
            print("[seed] Database already has data. Skipping. Delete campus_ai.db to reseed.")
        else:
            run_seed(session)
