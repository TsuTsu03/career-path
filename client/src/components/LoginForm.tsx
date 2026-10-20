// client/src/components/LoginForm.tsx
// Shared sign-in form for the student and admin login pages.
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, ApiError, errorMessage } from "../lib/api";
import { saveSession, type Role, type SessionUser } from "../lib/session";
import PasswordInput from "./PasswordInput";
import AuthCard, { Notice } from "./AuthCard";

interface LoginResponse {
  success: boolean;
  token: string;
  user: SessionUser;
  message?: string;
}

const COPY: Record<
  Role,
  { subtitle: string; wrongRole: string; home: string; accent: string }
> = {
  student: {
    subtitle: "Student Login",
    wrongRole: "This login page is for students only.",
    home: "/student/dashboard",
    accent: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
  },
  admin: {
    subtitle: "Admin Login",
    wrongRole: "This login page is for admins only.",
    home: "/admin/dashboard",
    accent: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
  }
};

export default function LoginForm({ role }: { role: Role }) {
  const nav = useNavigate();
  const location = useLocation();
  const copy = COPY[role];
  const sessionExpired = Boolean(
    (location.state as { sessionExpired?: boolean } | null)?.sessionExpired
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle"
  );
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    setNeedsVerification(false);
    setResendState("idle");
    setLoading(true);

    try {
      const out = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role
        })
      });

      if (out.success && out.token && out.user) {
        if (out.user.role !== role) {
          setErr(copy.wrongRole);
          return;
        }
        saveSession(out.token, out.user);
        nav(copy.home);
      } else {
        setErr(out.message ?? "Invalid credentials. Try again.");
      }
    } catch (error: unknown) {
      if (
        error instanceof ApiError &&
        typeof error.data === "object" &&
        error.data !== null &&
        (error.data as { needsVerification?: boolean }).needsVerification
      ) {
        setNeedsVerification(true);
      }
      setErr(errorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendState("sending");
    try {
      const out = await api<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      setResendMessage(out.message);
      setResendState("sent");
    } catch (error) {
      setResendMessage(errorMessage(error, "Could not send the email."));
      setResendState("idle");
    }
  };

  return (
    <AuthCard subtitle={copy.subtitle}>
      {sessionExpired && !err && (
        <Notice kind="info">Your session ended. Please sign in again.</Notice>
      )}

      {err && (
        <Notice kind="error">
          <p>{err}</p>
          {needsVerification && resendState !== "sent" && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending"}
              className="mt-2 font-medium underline disabled:opacity-60"
            >
              {resendState === "sending"
                ? "Sending…"
                : "Resend verification email"}
            </button>
          )}
        </Notice>
      )}

      {resendMessage && resendState === "sent" && (
        <Notice kind="success">{resendMessage}</Notice>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              role === "admin" ? "admin@school.edu" : "your.email@example.com"
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${copy.accent}`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {role === "student" ? (
        <>
          <p className="text-center text-gray-600 mt-6 text-sm">
            Enter your CAREER PATH student account credentials to continue.
          </p>
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Don&apos;t have an account yet?
            </p>
            <button
              type="button"
              onClick={() => nav("/register")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Create an account
            </button>
          </div>
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => nav("/admin/login")}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 underline"
            >
              Admin login
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => nav("/login")}
            className="text-sm font-medium text-gray-600 hover:text-gray-800 underline"
          >
            Back to student login
          </button>
        </div>
      )}
    </AuthCard>
  );
}
