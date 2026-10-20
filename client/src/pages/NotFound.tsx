import { Link } from "react-router-dom";
import { getSessionUser } from "../lib/session";

export default function NotFound() {
  const session = getSessionUser();
  const home = session
    ? session.role === "admin"
      ? "/admin/dashboard"
      : "/student/dashboard"
    : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <main className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-5xl font-bold text-blue-600 mb-2">404</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you opened does not exist or has moved.
        </p>
        <Link
          to={home}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          {session ? "Back to dashboard" : "Go to login"}
        </Link>
      </main>
    </div>
  );
}
