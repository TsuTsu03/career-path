// client/src/components/AuthCard.tsx
// The centered card used by the sign-in, sign-up and password pages.
import type { ReactNode } from "react";

export default function AuthCard({
  subtitle,
  children
}: {
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/assets/LOGIN-PAGE.png')" }}
    >
      <main className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="rounded-lg flex justify-center">
            <img
              src="/assets/LOGO.jpg"
              alt="CAREER PATH logo"
              className="w-1/4 h-1/4 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CAREER PATH</h1>
          <p className="text-gray-600">Career Path Recommender System</p>
          <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

export function Notice({
  kind,
  children
}: {
  kind: "error" | "success" | "info";
  children: ReactNode;
}) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-blue-50 border-blue-200 text-blue-700"
  };
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles[kind]}`}
    >
      {children}
    </div>
  );
}
