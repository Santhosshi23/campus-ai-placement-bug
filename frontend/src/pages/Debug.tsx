import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTIONS, GAME_TIME_LIMIT_SECONDS, type GameQuestion } from "../data/questions";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import type { GameResultResponse } from "../types";
import { ErrorState, LoadingState } from "../components/ui/StateViews";

interface AnswerRecord {
  question_id: string;
  category: GameQuestion["category"];
  is_correct: boolean;
  time_taken: number;
}

export default function Debug() {
  const navigate = useNavigate();
  const { sessionId, setGameResult, logEvent } = useApp();

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questionStartRef = useRef<number>(Date.now());
  const answersRef = useRef<AnswerRecord[]>([]);
  const finishedRef = useRef(false);

  const question = QUESTIONS[index];

  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, timeLeft]);

  const start = () => {
    setStarted(true);
    questionStartRef.current = Date.now();
    logEvent("game_started");
  };

  const selectOption = (optionId: string) => {
    if (selected) return;
    setSelected(optionId);
    const elapsed = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
    const record: AnswerRecord = {
      question_id: question.id,
      category: question.category,
      is_correct: optionId === question.correctOptionId,
      time_taken: elapsed,
    };
    answersRef.current = [...answersRef.current, record];
    setAnswers(answersRef.current);

    setTimeout(() => {
      if (index + 1 >= QUESTIONS.length) {
        finishGame();
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
        questionStartRef.current = Date.now();
      }
    }, 850);
  };

  const finishGame = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setSubmitting(true);
    const totalTime = GAME_TIME_LIMIT_SECONDS - timeLeft || 1;
    api
      .post<GameResultResponse>("/game-result", {
        answers: answersRef.current.length ? answersRef.current : [
          { question_id: "timeout", category: "problem_solving", is_correct: false, time_taken: 0 },
        ],
        total_time: Math.max(5, totalTime),
        session_id: sessionId,
      })
      .then((res) => {
        setGameResult(res);
        logEvent("game_completed", { score: res.score });
        navigate("/diagnosis");
      })
      .catch((e) => {
        setSubmitError(e.message || "Could not score your run. Please try again.");
        setSubmitting(false);
      });
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="text-5xl mb-4">🐞</div>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono">PLACEMENT BUG CHALLENGE</h1>
        <p className="text-text-dim mt-3">
          5 bugs. {GAME_TIME_LIMIT_SECONDS} seconds. Debug code, judgment calls & AI scenarios to reveal your
          Placement System Diagnosis.
        </p>
        <ul className="text-left text-sm text-text-dim mt-6 space-y-2 max-w-sm mx-auto">
          <li>✔ No sign-up required to play</li>
          <li>✔ Takes about a minute</li>
          <li>✔ Your result is 100% personalised</li>
        </ul>
        <button className="btn-primary text-base mt-8" onClick={start} autoFocus>
          ▶ RUN DIAGNOSTIC
        </button>
      </div>
    );
  }

  if (submitError) {
    return <ErrorState message={submitError} onRetry={finishGame} />;
  }

  if (submitting) {
    return <LoadingState label="Compiling your diagnosis..." />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-5 font-mono text-sm">
        <span className="text-glow-green">
          BUG {index + 1} / {QUESTIONS.length}
        </span>
        <span className={`chip ${timeLeft <= 10 ? "border-[var(--color-neon-red)] text-[var(--color-neon-red)]" : ""}`} aria-live="polite">
          ⏱ {timeLeft}s
        </span>
      </div>

      <div className="progress-track mb-7">
        <div
          className="progress-fill"
          style={{ width: `${((index + (selected ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="panel p-5 sm:p-7"
        >
          <span className="chip mb-4">{question.category.replace("_", " ").toUpperCase()}</span>
          <h2 className="font-semibold text-lg">{question.prompt}</h2>

          {question.code && (
            <pre className="terminal mt-4 p-4 overflow-x-auto text-xs sm:text-sm">
              <code>{question.code}</code>
            </pre>
          )}

          <div className="mt-5 grid gap-2.5" role="group" aria-label="Answer options">
            {question.options.map((opt) => {
              const isSelected = selected === opt.id;
              const isCorrect = opt.id === question.correctOptionId;
              let stateClass = "border-[var(--color-border)] hover:border-[var(--color-neon-cyan)] hover:bg-white/5";
              if (selected) {
                if (isSelected && isCorrect) stateClass = "border-[var(--color-neon-green)] bg-[var(--color-neon-green)]/10";
                else if (isSelected && !isCorrect) stateClass = "border-[var(--color-neon-red)] bg-[var(--color-neon-red)]/10";
                else if (isCorrect) stateClass = "border-[var(--color-neon-green)]/60";
                else stateClass = "border-[var(--color-border)] opacity-60";
              }
              return (
                <button
                  key={opt.id}
                  disabled={!!selected}
                  onClick={() => selectOption(opt.id)}
                  className={`text-left px-4 py-3 rounded-lg border text-sm sm:text-base transition-colors disabled:cursor-default ${stateClass}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {selected && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-text-dim">
              {question.explain}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
      <p className="text-center text-xs text-text-dim mt-6">{answers.length} answered so far</p>
    </div>
  );
}
