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
}

const TOKEN_KEY = "access";

export default function Login() {
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
          role: "student"
        })
      })) as LoginResponse;

      if (out.success && out.token && out.user) {
        if (out.user.role !== "student") {
          setErr("This login page is for students only.");
          return;
        }

        localStorage.setItem(TOKEN_KEY, out.token);
        localStorage.setItem("role", out.user.role);
        localStorage.setItem("fullName", out.user.fullName);
        localStorage.setItem("email", out.user.email);
        localStorage.setItem("currentUser", JSON.stringify(out.user));

        nav("/student/dashboard");
      } else {
        setErr(out.message ?? "Invalid credentials. Try again.");
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

  const handleGoRegister = () => {
    nav("/register");
  };

  const handleGoAdminLogin = () => {
    nav("/admin/login");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/assets/LOGIN-PAGE.png')"
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="rounded-lg flex justify-center">
            <img
              src="/assets/LOGO.jpg"
              alt="Logo"
              className="w-1/4 h-1/4 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CAREER PATH</h1>
          <p className="text-gray-600">Career Path Recommender System</p>
          <p className="text-gray-500 text-sm mt-2">Student Login</p>
        </div>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Enter your CAREER PATH student account credentials to continue.
        </p>

        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm mb-2">
            Don&apos;t have an account yet?
          </p>
          <button
            type="button"
            onClick={handleGoRegister}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Create an account
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleGoAdminLogin}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 underline"
          >
            Admin login
          </button>
        </div>
      </div>
    </div>
  );
}
