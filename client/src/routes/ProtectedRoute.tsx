import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../lib/session";

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  if (getToken()) return <>{children}</>;

  return (
    <Navigate to={pathname.startsWith("/admin") ? "/admin/login" : "/login"} replace />
  );
}
