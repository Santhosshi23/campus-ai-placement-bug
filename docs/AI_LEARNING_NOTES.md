# AI + Learning Notes

These are working notes from building CampusAI for the NxtWave Growth Challenge. They are presented as
customisable examples — swap in your own specific prompts/transcripts before final submission if you used a
different sequence of AI conversations while building.

---

### Example 1 — Rejecting the obvious landing page

**What I asked AI:** "Design a landing page for the NxtWave 'Build Your First AI Project in 60 Minutes'
workshop that gets students to register."

**What AI suggested:** A conventional SaaS-style landing page — hero banner, 3 feature bullets, testimonials,
countdown timer, signup form.

**What I changed:** Rejected the plain landing page entirely. Replaced it with a game-first flow: hero
("Placement System Error") → 60-second mini-game → personalised AI diagnosis → registration → referral →
campus competition.

**Why:** The brief explicitly warns that "everyone might build a landing page." A generic page doesn't
demonstrate engagement design, growth-loop thinking, or differentiate the submission from dozens of others
solving the same brief the same way.

---

### Example 2 — Cutting the channel list down

**What I asked AI:** "List all the acquisition channels I could use to get 500 student registrations in 7
days."

**What AI suggested:** 12-15 channels — paid Instagram/Google ads, influencer shoutouts, campus radio,
printed posters, SMS blasts, flyers, QR codes on noticeboards, etc.

**What I changed:** Cut this down to 5 prioritised channels — college clubs, the in-app referral loop,
WhatsApp communities, placement-cell email, and organic social sharing — each with an explicit why / role /
expected-registration number.

**Why:** ₹2,000 and 7 days cannot meaningfully support 15 channels, and several of AI's suggestions (paid
ads, SMS blasts) assume budget/infrastructure this simulation doesn't have. The brief explicitly asks to
prioritise rather than list everything — depth on fewer channels beats breadth.

---

### Example 3 — Replacing real-world prizes with digital status

**What I asked AI:** "Suggest referral rewards to motivate students to invite friends."

**What AI suggested:** Cash prizes, Amazon vouchers, and a "top-3 colleges win goodies" style real-world
incentive structure.

**What I changed:** Replaced all of this with digital, engagement-based rewards: a 5-tier badge ladder (Bug
Hunter → AI Debugger → AI Builder → Campus Champion → CampusAI Legend), campus-level milestones ("Level 2 —
AI Campus" at 100 registrations), and public leaderboard rank.

**Why:** The challenge explicitly says not to promise real-world prizes unless they're provided by NxtWave.
Digital status rewards are free, scale to any number of participants, and align with how final-year students
already compete for rank/reputation with friends and rival colleges — so they don't weaken the mechanic.

---

### What changed between the first idea and the final solution
1. Initial idea → a normal workshop landing page with a signup form
2. → an interactive "placement bug" mini-game to hook attention first
3. → a personalised AI-readiness diagnosis shown after the game
4. → a referral system so every registrant can bring friends
5. → a campus-vs-campus competition layer (the CampusAI League)
6. → **Final:** CampusAI — Placement Bug + Campus League + a live Growth Command Center

### If I had another 24 hours
- Real WhatsApp Business API automation for referral nudges (currently uses the standard `wa.me` share link)
- A dedicated college-ambassador dashboard with its own mini leaderboard
- More mini-game question sets so repeat visitors see fresh bugs each time
- A/B testing on hero copy, CTA placement and diagnosis wording
- Personalised AI-project recommendations driven by the diagnosis profile
- Referral fraud detection beyond same-email self-referral blocking (device/IP heuristics, rate limiting)
- Deeper analytics: cohort retention, time-to-convert, channel-level LTV
