import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api, ApiError } from "../api/client";
import { useApp } from "../context/AppContext";
import type { RegisterResponse } from "../types";

interface FormState {
  name: string;
  email: string;
  college_name: string;
  branch: string;
  graduation_year: string;
  whatsapp: string;
}

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "AI & ML", "AI & DS", "Other"];
const YEARS = ["2026", "2027", "2028", "2025"];

export default function Register() {
  const navigate = useNavigate();
  const { gameResult, referralCode, sessionId, setRegistration, setCurrentUserId, logEvent } = useApp();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    college_name: "",
    branch: "",
    graduation_year: "2026",
    whatsapp: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    logEvent("registration_started");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) next.email = "Enter a valid email address.";
    if (form.college_name.trim().length < 2) next.college_name = "College name is required.";
    if (!form.branch) next.branch = "Select your branch.";
    if (!form.graduation_year) next.graduation_year = "Select your graduation year.";
    if (form.whatsapp && !/^[0-9+\-\s]{8,15}$/.test(form.whatsapp)) next.whatsapp = "Enter a valid phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const source = referralCode ? "referral" : gameResult ? "mini_game" : "direct";
      const res = await api.post<RegisterResponse>("/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        college_name: form.college_name.trim(),
        branch: form.branch,
        graduation_year: Number(form.graduation_year),
        whatsapp: form.whatsapp || undefined,
        referral_code: referralCode || undefined,
        game_result_id: gameResult?.game_result_id,
        source,
        session_id: sessionId,
      });
      setRegistration(res);
      setCurrentUserId(res.user_id);
      logEvent("registration_completed", { source });
      navigate("/success");
    } catch (err) {
      if (err instanceof ApiError) setApiError(err.message);
      else setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="panel p-5 sm:p-6 mb-6">
          <span className="chip border-[var(--color-neon-green)]/40 text-glow-green mb-3">FREE ONLINE WORKSHOP</span>
          <h1 className="text-xl sm:text-2xl font-bold font-mono mt-2">Build Your First AI Project in 60 Minutes</h1>
          <p className="text-text-dim mt-2 text-sm">
            A live, beginner-friendly session on building and shipping a real AI project — no prior AI
            experience required. Hosted by NxtWave.
          </p>
          {referralCode && (
            <div className="mt-4 chip border-[var(--color-neon-cyan)]/40 text-glow-cyan">
              🔗 Invited via referral code {referralCode}
            </div>
          )}
        </div>

        <form className="panel p-5 sm:p-7 space-y-4" onSubmit={onSubmit} noValidate>
          <h2 className="font-mono text-sm text-text-dim">REGISTRATION_FORM.exe</h2>

          {apiError && (
            <div role="alert" className="text-sm text-[var(--color-neon-red)] bg-[var(--color-neon-red)]/10 border border-[var(--color-neon-red)]/30 rounded-lg px-3 py-2">
              {apiError}
            </div>
          )}

          <Field label="Full Name" error={errors.name} htmlFor="name">
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Santhosshi R"
              autoComplete="name"
            />
          </Field>

          <Field label="College Email" error={errors.email} htmlFor="email">
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@college.edu"
              autoComplete="email"
            />
          </Field>

          <Field label="College Name" error={errors.college_name} htmlFor="college">
            <input
              id="college"
              className="input"
              value={form.college_name}
              onChange={(e) => update("college_name", e.target.value)}
              placeholder="e.g. Amrita Vishwa Vidyapeetham"
              autoComplete="organization"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Branch / Department" error={errors.branch} htmlFor="branch">
              <select id="branch" className="input" value={form.branch} onChange={(e) => update("branch", e.target.value)}>
                <option value="">Select branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Graduation Year" error={errors.graduation_year} htmlFor="year">
              <select id="year" className="input" value={form.graduation_year} onChange={(e) => update("graduation_year", e.target.value)}>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="WhatsApp Number (optional)" error={errors.whatsapp} htmlFor="whatsapp">
            <input
              id="whatsapp"
              className="input"
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="+91 9XXXXXXXXX"
              autoComplete="tel"
            />
          </Field>

          <button type="submit" disabled={submitting} className="btn-primary w-full text-base mt-2">
            {submitting ? "Installing patch..." : "🔧 PATCH MY SYSTEM"}
          </button>
          <p className="text-xs text-text-dim text-center">
            By registering you join the CampusAI League (demo). No spam — one email, one workshop invite.
          </p>
        </form>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-mono text-text-dim mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-neon-red)] mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
