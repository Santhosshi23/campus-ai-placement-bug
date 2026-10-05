const SECTION_CLASS = "panel p-5 sm:p-7 mb-6";

export default function GrowthPlan() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-8">
        <span className="chip border-[var(--color-neon-green)]/40 text-glow-green">NXTWAVE GROWTH CHALLENGE SUBMISSION</span>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono mt-3">Growth Plan & Learning Notes</h1>
        <p className="text-text-dim mt-2">Target: 500 registrations · Budget: ₹2,000 · Duration: 7 days</p>
      </div>

      <section className={SECTION_CLASS}>
        <h2 className="font-mono text-glow-cyan mb-3">1. WHO WE'RE TARGETING</h2>
        <p className="text-sm text-text-dim">
          Final-year engineering students (CSE/IT/ECE/EEE/Mech/AI-ML) within 2-4 months of placement season.
          They're actively building resumes, comparing themselves to peers, and hunting for projects that make
          them stand out in interviews.
        </p>
        <h3 className="font-semibold text-sm mt-4">Why they care</h3>
        <ul className="text-sm text-text-dim list-disc list-inside mt-1 space-y-1">
          <li>Placement prep is top of mind — anything that improves interview odds gets attention</li>
          <li>AI/GenAI is the single most resume-worthy skill gap right now</li>
          <li>They want a real, demo-able project — not just another lecture</li>
          <li>College and friend-group competition is a strong, low-cost motivator</li>
        </ul>
        <h3 className="font-semibold text-sm mt-4">What makes them register</h3>
        <ul className="text-sm text-text-dim list-disc list-inside mt-1 space-y-1">
          <li>A personalised diagnosis that feels "about me", not a generic pitch</li>
          <li>An interactive 60-second game, not a boring form as the first touchpoint</li>
          <li>Visible campus pride / rivalry (CampusAI League)</li>
          <li>Referral rewards (badges) that give social currency for sharing</li>
          <li>Social proof — seeing hundreds of peers already "patched"</li>
        </ul>
      </section>

      <section className={SECTION_CLASS}>
        <h2 className="font-mono text-glow-cyan mb-3">2. PRIORITISED CHANNELS → PATH TO 500</h2>
        <p className="text-sm text-text-dim mb-3">Full breakdown with numbers lives in the live Growth Command Center (<code>/admin</code>, code: growth2026). Summary:</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-dim font-mono text-xs border-b border-[var(--color-border)]">
              <th className="py-2">Channel</th>
              <th className="py-2">Role</th>
              <th className="py-2 text-right">Est. registrations</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["College clubs & committees", "Primary seeding (48h)", "180"],
              ["Student referral loop (in-app)", "Growth multiplier", "170"],
              ["WhatsApp student communities", "Daily drumbeat", "90"],
              ["Email (placement cells)", "Credibility top-up", "40"],
              ["Organic social sharing", "Awareness trickle", "20"],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2">{row[0]}</td>
                <td className="py-2 text-text-dim">{row[1]}</td>
                <td className="py-2 text-right font-mono text-glow-green">{row[2]}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 font-semibold" colSpan={2}>Total (planning estimate)</td>
              <td className="py-2 text-right font-mono font-semibold text-glow-green">500+</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-text-dim mt-3">All figures are planning assumptions for a simulation, not guaranteed outcomes.</p>
      </section>

      <section className={SECTION_CLASS}>
        <h2 className="font-mono text-glow-cyan mb-3">3. AI + LEARNING NOTES</h2>
        <p className="text-sm text-text-dim mb-4">Three working examples of AI-assisted decisions made while building this (customise with your own before final submission).</p>
        {[
          {
            ask: "Design a landing page for the NxtWave AI workshop.",
            suggested: "A standard hero + features + testimonials + signup-form SaaS landing page.",
            changed: "Rejected the plain landing page entirely. Replaced it with a game-first flow: hero → mini-game → diagnosis → registration.",
            why: "The brief explicitly flags that everyone will build a landing page. A generic page doesn't demonstrate growth thinking, engagement design, or differentiate the submission.",
          },
          {
            ask: "List acquisition channels to reach 500 registrations.",
            suggested: "12-15 channels including paid ads, influencer marketing, campus radio, print posters, Instagram ads, SMS blasts, etc.",
            changed: "Cut down to 5 prioritised channels: college clubs, referral loop, WhatsApp communities, email, organic social — each with a clear why/role/expected number.",
            why: "₹2,000 and 7 days can't support 15 channels well. The brief explicitly asks to prioritise instead of listing everything. Depth beats breadth in a constrained simulation.",
          },
          {
            ask: "Suggest rewards for students who refer the most friends.",
            suggested: "Cash prizes, gift vouchers, and other physical/real-world incentives.",
            changed: "Replaced with digital, engagement-based rewards: badges (Bug Hunter → CampusAI Legend), campus milestones, and leaderboard bragging rights.",
            why: "The challenge says not to promise real-world prizes unless explicitly provided. Digital status rewards (badges, rank, campus pride) are free, scalable, and align with how final-year students already compete.",
          },
        ].map((note, i) => (
          <div key={i} className="panel p-4 bg-white/[0.02] mb-3">
            <p className="text-xs font-mono text-text-dim">WHAT I ASKED AI</p>
            <p className="text-sm mb-2">{note.ask}</p>
            <p className="text-xs font-mono text-text-dim">WHAT AI SUGGESTED</p>
            <p className="text-sm mb-2 text-text-dim">{note.suggested}</p>
            <p className="text-xs font-mono text-text-dim">WHAT I CHANGED</p>
            <p className="text-sm mb-2">{note.changed}</p>
            <p className="text-xs font-mono text-text-dim">WHY</p>
            <p className="text-sm text-glow-green">{note.why}</p>
          </div>
        ))}
      </section>

      <section className={SECTION_CLASS}>
        <h2 className="font-mono text-glow-cyan mb-3">4. WHAT CHANGED: FIRST IDEA → FINAL SOLUTION</h2>
        <ol className="text-sm text-text-dim list-decimal list-inside space-y-1.5">
          <li>Initial idea: a normal workshop landing page with a signup form</li>
          <li>Then: an interactive "placement bug" mini-game to hook attention first</li>
          <li>Then: a personalised AI-readiness diagnosis after the game</li>
          <li>Then: a referral system so registered students bring friends</li>
          <li>Then: a campus-vs-campus competition layer (CampusAI League)</li>
          <li>Final: CampusAI — Placement Bug + Campus League + live Growth Command Center</li>
        </ol>
      </section>

      <section className={SECTION_CLASS}>
        <h2 className="font-mono text-glow-cyan mb-3">5. IF I HAD ANOTHER 24 HOURS</h2>
        <ul className="text-sm text-text-dim list-disc list-inside space-y-1">
          <li>Real WhatsApp Business API automation for referral nudges</li>
          <li>A college-ambassador dashboard with its own mini leaderboard</li>
          <li>More mini-game variants so repeat visitors see fresh bugs</li>
          <li>A/B testing on hero copy and CTA placement</li>
          <li>Personalised AI project recommendations based on diagnosis profile</li>
          <li>Referral fraud detection (device/IP heuristics) beyond self-referral blocking</li>
          <li>Deeper analytics: cohort retention, time-to-convert, channel LTV</li>
        </ul>
      </section>
    </div>
  );
}
