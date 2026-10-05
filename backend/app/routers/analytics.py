from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from app.database import get_session
from app.models import User, College, Referral, GameResult, Event, ProjectInterest
from app.services.insights import generate_insights

router = APIRouter(tags=["analytics"])

TARGET_REGISTRATIONS = 500


@router.get("/analytics")
def analytics(session: Session = Depends(get_session)):
    total_users = session.exec(select(func.count(User.id))).one()
    total_colleges = session.exec(select(func.count(College.id))).one()

    # ---- acquisition sources ----
    rows = session.exec(select(User.source, func.count(User.id)).group_by(User.source)).all()
    source_counts = {r[0]: r[1] for r in rows}
    sources = []
    for src in ["mini_game", "referral", "whatsapp", "college_clubs", "direct", "other"]:
        count = source_counts.get(src, 0)
        pct = round(count / total_users * 100, 1) if total_users else 0
        sources.append({"source": src, "registrations": count, "percentage": pct})

    # ---- top colleges ----
    colleges = session.exec(select(College).order_by(College.points.desc()).limit(10)).all()
    top_colleges = [
        {
            "rank": i + 1,
            "name": c.name,
            "registrations": c.registration_count,
            "points": c.points,
            "level": c.level,
        }
        for i, c in enumerate(colleges)
    ]

    # ---- referral performance ----
    total_links = session.exec(select(func.count(func.distinct(User.referral_code)))).one()
    total_clicks = session.exec(select(func.count(Referral.id))).one()
    successful = session.exec(select(func.count(Referral.id)).where(Referral.status == "registered")).one()
    top_referrers = session.exec(
        select(User).where(User.successful_referrals > 0).order_by(User.successful_referrals.desc()).limit(5)
    ).all()

    # ---- funnel ----
    def count_event(t):
        return session.exec(select(func.count(Event.id)).where(Event.type == t)).one()

    visitors = max(count_event("visitor"), total_users)  # visitors should be >= registrations
    game_started = max(count_event("game_started"), session.exec(select(func.count(GameResult.id))).one())
    game_completed = session.exec(select(func.count(GameResult.id))).one()
    reg_started = max(count_event("registration_started"), total_users)
    reg_completed = total_users
    referral_clicks = max(count_event("referral_click"), total_clicks)
    referral_success = successful

    funnel_steps = [
        {"step": "Visitors", "count": visitors},
        {"step": "Game Started", "count": game_started},
        {"step": "Game Completed", "count": game_completed},
        {"step": "Registration Started", "count": reg_started},
        {"step": "Registration Completed", "count": reg_completed},
        {"step": "Referral Link Shared", "count": referral_clicks},
        {"step": "Successful Referral", "count": referral_success},
    ]
    base = funnel_steps[0]["count"] or 1
    for f in funnel_steps:
        f["pct_of_top"] = round(f["count"] / base * 100, 1)

    # ---- growth over last 7 days ----
    today = datetime.utcnow().date()
    daily = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day)
        day_end = day_start + timedelta(days=1)
        count = session.exec(
            select(func.count(User.id)).where(User.created_at >= day_start, User.created_at < day_end)
        ).one()
        daily.append({"day": day.strftime("%a %d"), "registrations": count})

    game_completion_rate = round(game_completed / game_started * 100, 1) if game_started else 0
    conversion_rate = round(reg_completed / visitors * 100, 1) if visitors else 0
    referral_rate = round(successful / total_links, 2) if total_links else 0

    project_interest_total = session.exec(select(func.count(ProjectInterest.id))).one()

    return {
        "target": TARGET_REGISTRATIONS,
        "current": total_users,
        "remaining": max(0, TARGET_REGISTRATIONS - total_users),
        "progress_pct": round(min(100, total_users / TARGET_REGISTRATIONS * 100), 1),
        "total_colleges": total_colleges,
        "conversion_rate": conversion_rate,
        "game_completion_rate": game_completion_rate,
        "referral_rate_per_link": referral_rate,
        "top_college": top_colleges[0]["name"] if top_colleges else None,
        "top_referrer": top_referrers[0].name if top_referrers else None,
        "acquisition_sources": sources,
        "top_colleges": top_colleges,
        "referral_performance": {
            "total_referral_links": total_links,
            "total_clicks": total_clicks,
            "successful_registrations": successful,
            "conversion_rate": round(successful / total_clicks * 100, 1) if total_clicks else 0,
            "top_referrers": [
                {"name": u.name, "college_id": u.college_id, "referrals": u.successful_referrals}
                for u in top_referrers
            ],
        },
        "funnel": funnel_steps,
        "daily_growth": daily,
        "project_interest_total": project_interest_total,
        "label": "Simulated campaign data (demo)",
    }


@router.get("/growth-insights")
def growth_insights(session: Session = Depends(get_session)):
    return {"insights": generate_insights(session), "label": "Demo analytics — rule based, not real-world findings"}


@router.get("/campaign-plan")
def campaign_plan():
    """Static planning content (channels, budget, timeline) used by the Growth Command Center.
    All numbers are clearly labelled as planning assumptions for a 7-day / Rs.2000 simulation."""
    return {
        "target": 500,
        "budget_inr": 2000,
        "duration_days": 7,
        "channels": [
            {
                "channel": "College Clubs & Core Committees",
                "why": "Final-year reps + coding/placement clubs already have trusted WhatsApp/Telegram "
                       "broadcast lists reaching 100-300 students per college instantly.",
                "role": "Primary seeding engine — first 48 hours",
                "action": "Share the CampusAI game link with 10-15 club leads across 8-10 colleges, "
                          "ask them to post in their official groups with campus-pride framing.",
                "expected_registrations": 180,
            },
            {
                "channel": "Student Referral Loop (in-app)",
                "why": "Every registered student gets a referral code + one-tap WhatsApp share message. "
                       "Peer invites convert far better than cold outreach and compound exponentially.",
                "role": "Growth multiplier — days 2-7",
                "action": "Push badge/leaderboard notifications so students are nudged to invite 2-3 "
                          "friends to protect their college's rank.",
                "expected_registrations": 170,
            },
            {
                "channel": "WhatsApp Student Communities",
                "why": "Final-year students live in WhatsApp — placement groups, branch groups, hostel "
                       "groups. Low friction, high trust, zero cost.",
                "role": "Daily drumbeat distribution",
                "action": "Daily 1-line updates ('VIT just crossed 120 patches — is your college next?') "
                          "posted by ambassadors in 20+ groups.",
                "expected_registrations": 90,
            },
            {
                "channel": "Email (college placement cells / mailing lists)",
                "why": "Placement cells already email final-years about resume/skill opportunities; "
                       "piggybacking adds credibility at zero cost.",
                "role": "Credibility + reach top-up",
                "action": "One templated email to 5-6 placement cell contacts with the landing link and "
                          "workshop one-pager.",
                "expected_registrations": 40,
            },
            {
                "channel": "Organic Social Sharing (LinkedIn/Instagram stories)",
                "why": "Students share achievements (AI score, badges) for social currency/resume signalling.",
                "role": "Awareness + secondary trickle of traffic",
                "action": "Shareable 'AI Diagnosis' result card students post to their story/LinkedIn.",
                "expected_registrations": 20,
            },
        ],
        "budget_allocation": [
            {"item": "Creative & distribution support (posters, reels, shareable result cards)", "amount_inr": 900},
            {"item": "Campus/community activation (small thank-you shoutouts, ambassador incentive stickers)", "amount_inr": 700},
            {"item": "Contingency / last-mile push (day 6-7 boosting)", "amount_inr": 400},
        ],
        "timeline": [
            {"day": 1, "title": "Launch + Campus Outreach", "detail": "Ship CampusAI live. Seed 10 college club leads. First wave of game plays."},
            {"day": 2, "title": "Referral Activation", "detail": "Push referral codes hard; introduce Bug Hunter badge; WhatsApp share prompts."},
            {"day": 3, "title": "Campus Competition Push", "detail": "Publicize live leaderboard; rival colleges called out directly in groups."},
            {"day": 4, "title": "Project Discovery Campaign", "detail": "Promote 'What would you build with AI?' cards to re-engage non-converters."},
            {"day": 5, "title": "Leaderboard / FOMO Push", "detail": "'X registrations to next milestone' nudges; highlight top referrers."},
            {"day": 6, "title": "Final Referral Push", "detail": "Badge deadline framing — last chance to unlock AI Builder / Campus Champion."},
            {"day": 7, "title": "Last-Call Registration", "detail": "Countdown messaging, final college standings, workshop reminder."},
        ],
        "assumption_note": "All channel/budget figures are planning assumptions for this simulation, not guaranteed outcomes.",
    }
