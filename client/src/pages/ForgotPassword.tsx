import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../lib/api";
import AuthCard, { Notice } from "../components/AuthCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const out = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      setSent(out.message);
    } catch (error) {
      setErr(errorMessage(error, "Could not send the reset email."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Forgot Password">
      {sent ? (
        <>
          <Notice kind="success">{sent}</Notice>
          <p className="text-sm text-gray-600 mb-6">
            The link works for 1 hour. Check your spam folder if you do not see
            it in a few minutes.
          </p>
        </>
      ) : (
        <>
          <p className="text-gray-600 text-sm mb-6">
            Enter the email you use for CAREER PATH. We will send you a link to
            choose a new password.
          </p>
          {err && <Notice kind="error">{err}</Notice>}
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
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </>
      )}

      <div className="mt-6 flex justify-between text-sm">
        <Link to="/login" className="text-blue-600 hover:text-blue-700">
          Student login
        </Link>
        <Link to="/admin/login" className="text-gray-600 hover:text-gray-800">
          Admin login
        </Link>
      </div>
    </AuthCard>
  );
}
