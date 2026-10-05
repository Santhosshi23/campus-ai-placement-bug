"""College level / milestone logic."""

MILESTONES = [
    {"level": 1, "threshold": 50, "name": "LEVEL 1 — CAMPUS ACTIVATED", "reward": "Secret AI Mission Unlocked"},
    {"level": 2, "threshold": 100, "name": "LEVEL 2 — AI CAMPUS", "reward": "Exclusive AI Project Pack Unlocked"},
    {"level": 3, "threshold": 150, "name": "LEVEL 3 — AI POWERHOUSE", "reward": "Campus Boss Battle Unlocked"},
    {"level": 4, "threshold": 200, "name": "LEVEL 4 — CAMPUS LEGEND", "reward": "CampusAI Legend Hall of Fame"},
]


def level_for_count(count: int) -> int:
    level = 0
    for m in MILESTONES:
        if count >= m["threshold"]:
            level = m["level"]
    return level


def next_milestone(count: int):
    for m in MILESTONES:
        if count < m["threshold"]:
            return m
    return None


def milestone_crossed(old_count: int, new_count: int):
    """Return milestone dict if crossing old_count -> new_count unlocks a new level."""
    for m in MILESTONES:
        if old_count < m["threshold"] <= new_count:
            return m
    return None
