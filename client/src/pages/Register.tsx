import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Register() {
  const nav = useNavigate();

  const [role, setRole] = useState<"student" | "admin">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const out = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, role })
      });

      if (out.success) {
        setSuccess("Registration successful! You may now log in.");
        setTimeout(() => nav("/login"), 1500);
      } else {
        setErr(out.message || "Failed to register. Try again.");
      }
    } catch (error) {
      console.error(error);
      setErr("Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white rounded-full p-4 mb-4">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">CARPATH</h1>
          <p className="text-gray-600">Career Path Recommender System</p>
          <p className="text-gray-500 text-sm mt-2">
            Create your CARPATH account
          </p>
        </div>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Register as
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "student" | "admin")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="student">Student</option>
              <option value="admin">Admin / Counselor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Juan Dela Cruz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => nav("/login")}
            className="text-blue-600 font-medium hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
