import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Status = "checking" | "success" | "error";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Verifying your email...");

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
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token, id })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");

        // redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
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

        {/* Status icon */}
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
