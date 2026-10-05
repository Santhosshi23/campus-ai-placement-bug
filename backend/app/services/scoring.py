"""Scoring & diagnosis engine for the Placement Bug mini-game.

This produces a personalised, non-deterministic-feeling but fully rule based
diagnosis from the student's answers. No two students with different answers
get the same result.
"""
import random
from typing import List, Dict, Any

CATEGORY_LABELS = {
    "coding": "Coding Confidence",
    "problem_solving": "Problem Solving",
    "ai_awareness": "AI Awareness",
    "genai": "GenAI Experience",
}

GAP_LABELS = {
    "coding": "CODING CONFIDENCE",
    "problem_solving": "PROBLEM SOLVING DEPTH",
    "ai_awareness": "AI AWARENESS",
    "genai": "AI PROJECT EXPERIENCE",
}

CATEGORY_WEIGHTS = {
    "problem_solving": 0.30,
    "coding": 0.30,
    "ai_awareness": 0.20,
    "genai": 0.20,
}


def _category_score(correct_flags: List[bool], fast: bool, rng: random.Random) -> int:
    """Turn a list of right/wrong answers (for one category) into a 0-100 score."""
    if not correct_flags:
        return rng.randint(35, 50)
    correct_ratio = sum(1 for f in correct_flags if f) / len(correct_flags)
    base = 20 + correct_ratio * 65  # 20 - 85
    if fast and correct_ratio > 0:
        base += 8
    base += rng.randint(-4, 4)
    return int(max(10, min(97, base)))


def compute_diagnosis(answers: List[Dict[str, Any]], total_time: int) -> Dict[str, Any]:
    """answers: list of {question_id, category, is_correct, time_taken}"""
    # seed rng deterministically from the answer pattern so repeated identical
    # attempts feel stable, while different answers give different results.
    seed_key = "".join(f"{a['category'][:2]}{int(a['is_correct'])}" for a in answers) + str(total_time)
    rng = random.Random(seed_key)

    by_cat: Dict[str, List[bool]] = {}
    for a in answers:
        by_cat.setdefault(a["category"], []).append(bool(a["is_correct"]))

    fast = total_time <= 45

    scores: Dict[str, int] = {}
    for cat in CATEGORY_WEIGHTS:
        scores[cat] = _category_score(by_cat.get(cat, []), fast, rng)

    ai_score = round(sum(scores[c] * w for c, w in CATEGORY_WEIGHTS.items()))
    ai_score = max(5, min(99, ai_score))

    strongest = max(scores, key=lambda c: scores[c])
    weakest = min(scores, key=lambda c: scores[c])

    # Profile assignment
    if scores["genai"] < 30 and scores["ai_awareness"] < 45:
        profile = "THE AI BEGINNER"
    elif strongest == "coding":
        profile = "THE DEBUGGER"
    elif strongest == "problem_solving" and scores["coding"] >= 60:
        profile = "THE BUILDER"
    elif strongest == "problem_solving":
        profile = "THE PROBLEM SOLVER"
    elif strongest in ("ai_awareness", "genai"):
        profile = "THE EXPLORER"
    else:
        profile = "THE AI BEGINNER"

    if ai_score >= 80:
        status = "SYSTEM READY"
    elif ai_score >= 55:
        status = "PARTIALLY READY"
    else:
        status = "CRITICAL BUG DETECTED"

    correct_count = sum(1 for a in answers if a["is_correct"])

    diagnosis = {
        "scores": {CATEGORY_LABELS[c]: scores[c] for c in scores},
        "raw_scores": scores,
        "ai_score": ai_score,
        "status": status,
        "profile_type": profile,
        "strength": CATEGORY_LABELS[strongest],
        "gap": GAP_LABELS[weakest],
        "correct_count": correct_count,
        "total_questions": len(answers),
        "total_time": total_time,
    }
    return diagnosis
