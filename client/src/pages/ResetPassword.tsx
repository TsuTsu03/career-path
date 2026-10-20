import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../lib/api";
import AuthCard, { Notice } from "../components/AuthCard";
import PasswordInput from "../components/PasswordInput";

function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 8) problems.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) problems.push("an uppercase letter");
  if (!/[0-9]/.test(password)) problems.push("a number");
  if (!/[^A-Za-z0-9]/.test(password)) problems.push("a special character");
  return problems;
}

export default function ResetPassword() {
  const nav = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const token = params.get("token") ?? "";
  const id = params.get("id") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<"student" | "admin" | null>(null);
  const [loading, setLoading] = useState(false);

  const problems = passwordProblems(password);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");

    if (problems.length) {
      setErr(`Password needs ${problems.join(", ")}.`);
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const out = await api<{ role: "student" | "admin" }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({ token, id, password, confirmPassword })
        }
      );
      setDone(out.role);
    } catch (error) {
      setErr(errorMessage(error, "Could not update the password."));
    } finally {
      setLoading(false);
    }
  };

  if (!token || !id) {
    return (
      <AuthCard subtitle="Choose a Password">
        <Notice kind="error">This link is incomplete or has expired.</Notice>
        <Link
          to="/forgot-password"
          className="block text-center text-blue-600 hover:text-blue-700"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard subtitle="Choose a Password">
        <Notice kind="success">Your password is set. You can now sign in.</Notice>
        <button
          type="button"
          onClick={() => nav(done === "admin" ? "/admin/login" : "/login")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Go to login
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard subtitle="Choose a Password">
      {err && (
        <Notice kind="error">
          {err}
          {/expired|invalid/i.test(err) && (
            <>
              {" "}
              <Link to="/forgot-password" className="underline font-medium">
                Request a new link
              </Link>
            </>
          )}
        </Notice>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-gray-700 mb-2">
            New password
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
          {password && problems.length > 0 && (
            <p className="mt-2 text-xs text-gray-600">
              Still needs: {problems.join(", ")}.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
            Confirm new password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          {loading ? "Saving..." : "Save password"}
        </button>
      </form>
    </AuthCard>
  );
}
