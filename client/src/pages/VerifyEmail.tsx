import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, ApiError, errorMessage } from "../lib/api";

type Status = "checking" | "success" | "error";

type VerifyResponse = {
  success: boolean;
  message?: string;
};

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Verifying your email...");
  const [resendEmail, setResendEmail] = useState("");
  const [resendNote, setResendNote] = useState("");
  const [resending, setResending] = useState(false);

  const handleResend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResending(true);
    try {
      const out = await api<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() })
      });
      setResendNote(out.message);
    } catch (err) {
      setResendNote(errorMessage(err, "Could not send the email."));
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    if (!token || !id) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const data = await api<VerifyResponse>("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token, id })
        });

        if (!data.success) {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        if (err instanceof ApiError) {
          setStatus("error");
          setMessage(err.message || "Verification failed.");
        } else {
          setStatus("error");
          setMessage("Something went wrong while verifying your email.");
        }
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  const isChecking = status === "checking";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>

        <div className="flex justify-center mb-4">
          {isChecking && (
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {isSuccess && (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
          )}
          {isError && (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-2xl">!</span>
            </div>
          )}
        </div>

        <p
          className={`text-sm ${
            isSuccess
              ? "text-green-700"
              : isError
                ? "text-red-700"
                : "text-gray-700"
          }`}
        >
          {message}
        </p>

        {isError && (
          <form onSubmit={handleResend} className="mt-6 text-left space-y-3">
            <label htmlFor="resend-email" className="block text-sm text-gray-700">
              Need a new link? Enter your email:
            </label>
            <input
              id="resend-email"
              type="email"
              required
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={resending}
              className="w-full px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
            {resendNote && (
              <p className="text-sm text-gray-700" role="status">
                {resendNote}
              </p>
            )}
          </form>
        )}

        {isError && (
          <button
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
