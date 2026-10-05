export interface GameOption {
  id: string;
  label: string;
}

export interface GameQuestion {
  id: string;
  category: "coding" | "problem_solving" | "ai_awareness" | "genai";
  kind: "code" | "scenario";
  prompt: string;
  code?: string;
  options: GameOption[];
  correctOptionId: string;
  explain: string;
}

export const QUESTIONS: GameQuestion[] = [
  {
    id: "q1",
    category: "coding",
    kind: "code",
    prompt: "BUG_01 — This function should sum ALL scores in the list. It doesn't. Find the bug.",
    code: `def total_marks(scores):
    total = 0
    for i in range(1, len(scores)):
        total += scores[i]
    return total`,
    options: [
      { id: "a", label: "range(1, len(scores)) should start from 0" },
      { id: "b", label: "total should be initialised to 1" },
      { id: "c", label: "len(scores) should be len(scores) + 1" },
      { id: "d", label: "There is no bug here" },
    ],
    correctOptionId: "a",
    explain: "range(1, len(scores)) skips index 0 — the loop should start at range(0, len(scores)).",
  },
  {
    id: "q2",
    category: "problem_solving",
    kind: "scenario",
    prompt: "BUG_02 — Your team's API response times are wildly inconsistent under load. What's the best first move?",
    options: [
      { id: "a", label: "Rewrite the entire service in a different language" },
      { id: "b", label: "Profile and measure where time is actually being spent" },
      { id: "c", label: "Add more servers and hope it fixes itself" },
      { id: "d", label: "Ignore it — it only happens sometimes" },
    ],
    correctOptionId: "b",
    explain: "Always measure before you optimize — profiling tells you where the real bottleneck is.",
  },
  {
    id: "q3",
    category: "ai_awareness",
    kind: "scenario",
    prompt: "BUG_03 — An LLM confidently invents facts that aren't in the 50-page PDF you gave it. What's the most reliable fix?",
    options: [
      { id: "a", label: "Just ask it nicely to 'not hallucinate'" },
      { id: "b", label: "Switch to the biggest model available" },
      { id: "c", label: "Use RAG — retrieve the relevant chunks and ground the answer in them" },
      { id: "d", label: "Lower the font size of the prompt" },
    ],
    correctOptionId: "c",
    explain: "Retrieval-Augmented Generation grounds responses in real source text, cutting hallucination.",
  },
  {
    id: "q4",
    category: "genai",
    kind: "scenario",
    prompt: "BUG_04 — You need to pull skills & experience from 500 resumes into a clean spreadsheet. Best GenAI approach?",
    options: [
      { id: "a", label: "Read all 500 resumes manually" },
      { id: "b", label: "Prompt an LLM to return structured JSON per a fixed schema, then validate it" },
      { id: "c", label: "Use Find & Replace in a word processor" },
      { id: "d", label: "Ask every candidate to retype their resume into a form" },
    ],
    correctOptionId: "b",
    explain: "Structured-output prompting (JSON schema) is the standard way to turn messy text into clean data at scale.",
  },
  {
    id: "q5",
    category: "problem_solving",
    kind: "scenario",
    prompt: "BUG_05 — Mid technical interview, you blank on a question. What should you do?",
    options: [
      { id: "a", label: "Stay silent until the interviewer moves on" },
      { id: "b", label: "Think out loud, explain your approach, ask a clarifying question" },
      { id: "c", label: "Guess an answer with zero explanation" },
      { id: "d", label: "Immediately say 'I don't know' and ask to skip" },
    ],
    correctOptionId: "b",
    explain: "Interviewers evaluate your thought process — narrating your reasoning matters more than a perfect answer.",
  },
];

export const GAME_TIME_LIMIT_SECONDS = 60;
