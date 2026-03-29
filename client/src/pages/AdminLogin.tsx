import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";

interface LoginUser {
  role: "student" | "admin";
  fullName: string;
  email: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: LoginUser;
  message?: string;
  needsPasswordSetup?: boolean;
}

const TOKEN_KEY = "access";

export default function AdminLogin() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const out = (await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: "admin"
        })
      })) as LoginResponse;

      if (out.success && out.token && out.user) {
        if (out.user.role !== "admin") {
          setErr("This login page is for admins only.");
          return;
        }

        localStorage.setItem(TOKEN_KEY, out.token);
        localStorage.setItem("role", out.user.role);
        localStorage.setItem("fullName", out.user.fullName);
        localStorage.setItem("email", out.user.email);
        localStorage.setItem("currentUser", JSON.stringify(out.user));

        nav("/dashboard");
      } else {
        setErr(out.message ?? "Invalid admin credentials. Try again.");
      }
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof ApiError) {
        setErr(error.data?.message || error.message);
      } else if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoStudentLogin = () => {
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div
        style={{
          backgroundImage: "url('/assets/LOGIN-PAGE.png')"
        }}
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 opacity-15"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/60 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center rounded-lg">
            <img
              src="/assets/LOGO.jpg"
              alt="Logo"
              className="h-20 w-20 object-contain"
            />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
            Admin Portal
          </p>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            CAREER PATH
          </h1>
          <p className="text-sm text-slate-600">
            Administrator / Counselor Access
          </p>
        </div>

        {err && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.edu"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600">
          This page is restricted to authorized administrators and counselors
          only.
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleGoStudentLogin}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            Back to student login
          </button>
        </div>
      </div>
    </div>
  );
}
