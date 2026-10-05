"""Rule based 'AI Growth Insights' generated purely from demo/simulated data."""
from typing import List
from sqlmodel import Session, select, func
from app.models import User, College, Referral, GameResult, UserBadge, Badge


def generate_insights(session: Session) -> List[dict]:
    insights = []

    total_users = session.exec(select(func.count(User.id))).one()
    referred_users = session.exec(select(func.count(User.id)).where(User.referred_by.is_not(None))).one()
    direct_users = total_users - referred_users

    # 1. Referral vs direct conversion comparison (simulated, rule based on funnel ratio)
    if total_users:
        referral_share = referred_users / total_users * 100
        insights.append({
            "title": "Referral users convert better",
            "text": f"Referred students make up {referral_share:.0f}% of all registrations and tend to "
                    f"finish signup faster than direct visitors — referral users convert roughly 24% "
                    f"better than cold/direct traffic in this simulation.",
            "tag": "Demo analytics",
        })

    # 2. College closest to milestone
    from app.services.milestones import next_milestone
    colleges = session.exec(select(College)).all()
    closest = None
    closest_gap = None
    for c in colleges:
        nm = next_milestone(c.registration_count)
        if nm:
            gap = nm["threshold"] - c.registration_count
            if closest_gap is None or gap < closest_gap:
                closest_gap = gap
                closest = (c, nm)
    if closest:
        c, nm = closest
        insights.append({
            "title": f"{c.name} is close to its next milestone",
            "text": f"{c.name} is just {closest_gap} registrations away from unlocking "
                    f"\"{nm['name']}\". A small referral push could unlock it within 24 hours.",
            "tag": "Demo analytics",
        })

    # 3. Game completion correlation
    game_completed = session.exec(select(func.count(func.distinct(GameResult.user_id))).where(GameResult.user_id.is_not(None))).one()
    if total_users:
        pct = (game_completed / total_users * 100) if total_users else 0
        insights.append({
            "title": "The mini-game drives higher-intent signups",
            "text": f"{pct:.0f}% of registered students played the Placement Bug challenge before "
                    f"signing up. Students who complete the mini-game register at a noticeably higher "
                    f"rate than those who land directly on a form.",
            "tag": "Demo analytics",
        })

    # 4. Badge correlation with referral activity
    debugger_badge = session.exec(select(Badge).where(Badge.code == "ai_debugger")).first()
    if debugger_badge:
        holders = session.exec(select(func.count(UserBadge.id)).where(UserBadge.badge_id == debugger_badge.id)).one()
        if holders:
            insights.append({
                "title": "Badge unlocks fuel more sharing",
                "text": f"{holders} students have unlocked the 'AI Debugger' badge (3+ referrals). "
                        f"Referral activity is strongest among students who have already unlocked a badge "
                        f"— gamified milestones keep the sharing loop alive.",
                "tag": "Demo analytics",
            })

    # 5. Top college momentum
    top_college = session.exec(select(College).order_by(College.points.desc())).first()
    if top_college:
        insights.append({
            "title": f"{top_college.name} is leading the CampusAI League",
            "text": f"{top_college.name} currently leads with {top_college.points} points from "
                    f"{top_college.registration_count} patched students — highlighting it in leaderboard "
                    f"pushes can create FOMO for rival campuses.",
            "tag": "Demo analytics",
        })

    # 6. Referral conversion rate
    total_referrals = session.exec(select(func.count(Referral.id))).one()
    successful_referrals = session.exec(select(func.count(Referral.id)).where(Referral.status == "registered")).one()
    if total_referrals:
        conv = successful_referrals / total_referrals * 100
        insights.append({
            "title": "Referral link conversion",
            "text": f"Of {total_referrals} referral link clicks in this simulation, {successful_referrals} "
                    f"converted into completed registrations ({conv:.0f}% conversion) — comfortably the "
                    f"most efficient acquisition channel in the plan.",
            "tag": "Demo analytics",
        })

    return insights
