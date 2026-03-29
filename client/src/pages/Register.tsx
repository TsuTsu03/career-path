import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type RegisterResponse = {
  success: boolean;
  message?: string;
  emailSent?: boolean;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
};

const getPasswordStrength = (password: string) => {
  const hasLowerOrUpper = /[A-Za-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!password) {
    return { label: "", color: "bg-gray-200", width: "w-0" };
  }

  if (isLongEnough && hasLowerOrUpper && hasUpper && hasNumber && hasSpecial) {
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  }

  const checksPassed = [
    hasLowerOrUpper,
    hasUpper,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  if (password.length >= 7 && checksPassed >= 2) {
    return { label: "Medium", color: "bg-yellow-500", width: "w-2/3" };
  }

  return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
};

export default function Register() {
  const nav = useNavigate();
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWeakPasswordError, setShowWeakPasswordError] = useState(false);

  const strength = getPasswordStrength(password);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setShowWeakPasswordError(false);

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    const passwordStrength = getPasswordStrength(password);

    if (passwordStrength.label === "Weak") {
      setErr("Password is too weak.");
      setShowWeakPasswordError(true);
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const out = (await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email: email.trim().toLowerCase(),
          password,
          role: "student"
        })
      })) as RegisterResponse;

      if (out.success) {
        setSuccess(
          out.emailSent
            ? "Registration successful! Please check your email and verify your account before logging in."
            : "Registration successful, but the verification email could not be sent."
        );

        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowWeakPasswordError(false);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">CAREER PATH</h1>
          <p className="text-gray-600">Career Path Recommender System</p>
          <p className="text-gray-500 text-sm mt-2">
            Create your student account
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
              ref={passwordRef}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (showWeakPasswordError) {
                  setShowWeakPasswordError(false);
                  if (err === "Password is too weak.") {
                    setErr("");
                  }
                }
              }}
              required
              className={`w-full px-4 py-3 border rounded-lg outline-none text-sm focus:ring-2 focus:border-transparent ${
                showWeakPasswordError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />

            <div className="mt-2">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} ${strength.width} transition-all duration-200`}
                />
              </div>
              {strength.label && (
                <p className="mt-1 text-xs text-gray-600">
                  Password strength:{" "}
                  <span className="font-semibold">{strength.label}</span>
                </p>
              )}
            </div>

            <ul className="mt-2 space-y-1 text-xs">
              <li
                className={
                  password.length >= 8 ? "text-green-600" : "text-gray-500"
                }
              >
                • At least 8 characters
              </li>
              <li
                className={
                  /[A-Za-z]/.test(password) ? "text-green-600" : "text-gray-500"
                }
              >
                • Contains letters (A–Z, a–z)
              </li>
              <li
                className={
                  /[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"
                }
              >
                • At least 1 capital letter (A–Z)
              </li>
              <li
                className={
                  /[0-9]/.test(password) ? "text-green-600" : "text-gray-500"
                }
              >
                • At least 1 number
              </li>
              <li
                className={
                  /[^A-Za-z0-9]/.test(password)
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                • At least 1 special character (e.g. !@#$%)
              </li>
            </ul>

            {showWeakPasswordError && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                Password is too weak.
              </p>
            )}
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
