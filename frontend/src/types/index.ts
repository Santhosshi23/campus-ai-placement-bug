export interface Diagnosis {
  scores: Record<string, number>;
  raw_scores: Record<string, number>;
  ai_score: number;
  status: string;
  profile_type: string;
  strength: string;
  gap: string;
  correct_count: number;
  total_questions: number;
  total_time: number;
}

export interface GameResultResponse {
  game_result_id: number;
  score: number;
  ai_score: number;
  profile_type: string;
  diagnosis: Diagnosis;
}

export interface RegisterResponse {
  user_id: number;
  name: string;
  college: string;
  profile_type: string;
  ai_score: number;
  referral_code: string;
  referral_link: string;
  college_milestone_unlocked: string | null;
}

export interface LeaderboardCollege {
  rank: number;
  id: number;
  name: string;
  short_code: string;
  registrations: number;
  points: number;
  level: number;
  target: number;
  progress_pct: number;
  next_milestone: string;
  next_milestone_gap: number;
  trend: "up" | "down" | "flat";
}

export interface CollegeDetail {
  id: number;
  name: string;
  short_code: string;
  registrations: number;
  target: number;
  points: number;
  level: number;
  rank: number;
  progress_pct: number;
  bugs_remaining: number;
  next_milestone: string | null;
  next_milestone_gap: number;
  milestones: { level: number; threshold: number; name: string; reward: string }[];
  top_referrers: { name: string; referrals: number; profile: string }[];
  boss_battle_unlocked: boolean;
}

export interface Badge {
  code: string;
  name: string;
  emoji: string;
  description: string;
  requirement: number;
  unlocked?: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  college: string;
  college_id: number;
  branch: string;
  graduation_year: number;
  profile_type: string;
  ai_score: number;
  diagnosis: Diagnosis;
  referral_code: string;
  referral_link: string;
  referral_count: number;
  successful_referrals: number;
  referral_conversion_pct: number;
  personal_rank: number;
  college_rank: number;
  badges: Badge[];
  next_badge: { name: string; emoji: string; remaining: number } | null;
  project_interests: { id: number; title: string }[];
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  skills: string[];
  interest_count: number;
}

export interface AnalyticsData {
  target: number;
  current: number;
  remaining: number;
  progress_pct: number;
  total_colleges: number;
  conversion_rate: number;
  game_completion_rate: number;
  referral_rate_per_link: number;
  top_college: string;
  top_referrer: string;
  acquisition_sources: { source: string; registrations: number; percentage: number }[];
  top_colleges: { rank: number; name: string; registrations: number; points: number; level: number }[];
  referral_performance: {
    total_referral_links: number;
    total_clicks: number;
    successful_registrations: number;
    conversion_rate: number;
    top_referrers: { name: string; college_id: number; referrals: number }[];
  };
  funnel: { step: string; count: number; pct_of_top: number }[];
  daily_growth: { day: string; registrations: number }[];
  project_interest_total: number;
  label: string;
}

export interface GrowthInsight {
  title: string;
  text: string;
  tag: string;
}

export interface CampaignChannel {
  channel: string;
  why: string;
  role: string;
  action: string;
  expected_registrations: number;
}

export interface CampaignPlan {
  target: number;
  budget_inr: number;
  duration_days: number;
  channels: CampaignChannel[];
  budget_allocation: { item: string; amount_inr: number }[];
  timeline: { day: number; title: string; detail: string }[];
  assumption_note: string;
}
