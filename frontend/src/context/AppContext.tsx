import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { GameResultResponse, RegisterResponse } from "../types";

function getOrCreateSessionId(): string {
  const key = "campusai_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

interface AppContextValue {
  sessionId: string;
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  gameResult: GameResultResponse | null;
  setGameResult: (r: GameResultResponse | null) => void;
  registration: RegisterResponse | null;
  setRegistration: (r: RegisterResponse | null) => void;
  currentUserId: number | null;
  setCurrentUserId: (id: number | null) => void;
  soundOn: boolean;
  toggleSound: () => void;
  logEvent: (type: string, meta?: Record<string, unknown>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState(getOrCreateSessionId);
  const [referralCode, setReferralCodeState] = useState<string | null>(() =>
    localStorage.getItem("campusai_ref")
  );
  const [gameResult, setGameResultState] = useState<GameResultResponse | null>(() => {
    const raw = sessionStorage.getItem("campusai_game_result");
    return raw ? JSON.parse(raw) : null;
  });
  const [registration, setRegistrationState] = useState<RegisterResponse | null>(() => {
    const raw = sessionStorage.getItem("campusai_registration");
    return raw ? JSON.parse(raw) : null;
  });
  const [currentUserId, setCurrentUserIdState] = useState<number | null>(() => {
    const raw = localStorage.getItem("campusai_user_id");
    return raw ? Number(raw) : null;
  });
  const [soundOn, setSoundOn] = useState<boolean>(() => localStorage.getItem("campusai_sound") === "1");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      const code = ref.toUpperCase();
      localStorage.setItem("campusai_ref", code);
      setReferralCodeState(code);
      api.post("/referral", { referral_code: code, session_id: sessionId }).catch(() => {});
      api.post("/event", { type: "referral_click", session_id: sessionId, source: "referral", meta: { referral_code: code } }).catch(() => {});
    }
    api.post("/event", { type: "visitor", session_id: sessionId }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setReferralCode = (code: string | null) => {
    setReferralCodeState(code);
    if (code) localStorage.setItem("campusai_ref", code);
    else localStorage.removeItem("campusai_ref");
  };

  const setGameResult = (r: GameResultResponse | null) => {
    setGameResultState(r);
    if (r) sessionStorage.setItem("campusai_game_result", JSON.stringify(r));
    else sessionStorage.removeItem("campusai_game_result");
  };

  const setRegistration = (r: RegisterResponse | null) => {
    setRegistrationState(r);
    if (r) sessionStorage.setItem("campusai_registration", JSON.stringify(r));
    else sessionStorage.removeItem("campusai_registration");
  };

  const setCurrentUserId = (id: number | null) => {
    setCurrentUserIdState(id);
    if (id) localStorage.setItem("campusai_user_id", String(id));
    else localStorage.removeItem("campusai_user_id");
  };

  const toggleSound = () => {
    setSoundOn((s) => {
      localStorage.setItem("campusai_sound", !s ? "1" : "0");
      return !s;
    });
  };

  const logEvent = (type: string, meta?: Record<string, unknown>) => {
    api.post("/event", { type, session_id: sessionId, user_id: currentUserId, meta }).catch(() => {});
  };

  const value = useMemo(
    () => ({
      sessionId,
      referralCode,
      setReferralCode,
      gameResult,
      setGameResult,
      registration,
      setRegistration,
      currentUserId,
      setCurrentUserId,
      soundOn,
      toggleSound,
      logEvent,
    }),
    [sessionId, referralCode, gameResult, registration, currentUserId, soundOn]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
