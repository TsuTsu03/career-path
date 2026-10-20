import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import {
  SESSION_EXPIRED_EVENT,
  clearSession,
  getSessionUser
} from "./lib/session";
import {
  ADMIN_VIEW_PATHS,
  STUDENT_VIEW_PATHS,
  type AdminView,
  type StudentView
} from "./lib/routes";

// Pages load on demand so the login screen does not download the dashboards.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminSetupPassword = lazy(() => import("./pages/AdminSetupPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentAssessmentResult = lazy(
  () => import("./pages/StudentAssessmentResult")
);

function viewFromPath<V extends string>(
  paths: Record<V, string>,
  pathname: string,
  fallback: V
): V {
  const match = (Object.entries(paths) as [V, string][]).find(([, path]) =>
    pathname.startsWith(path)
  );
  return match ? match[0] : fallback;
}

// ======================
// Role-based dashboard: the URL decides which page is shown, so the browser
// Back and Forward buttons move between pages.
// ======================
function RoleBasedDashboard() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const session = getSessionUser();

  const handleLogout = () => {
    const wasAdmin = session?.role === "admin";
    clearSession();
    nav(wasAdmin ? "/admin/login" : "/login", { replace: true });
  };

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const user = {
    id: session.id,
    name: session.fullName,
    role: session.role,
    email: session.email
  };

  if (session.role === "admin") {
    // A student-only URL sends an admin to their own dashboard.
    if (pathname.startsWith("/student/")) {
      return <Navigate to={ADMIN_VIEW_PATHS.dashboard} replace />;
    }
    const view = viewFromPath<AdminView>(ADMIN_VIEW_PATHS, pathname, "dashboard");
    return <AdminDashboard user={user} onLogout={handleLogout} view={view} />;
  }

  if (pathname.startsWith("/admin/")) {
    return <Navigate to={STUDENT_VIEW_PATHS.dashboard} replace />;
  }
  const view = viewFromPath<StudentView>(
    STUDENT_VIEW_PATHS,
    pathname,
    "dashboard"
  );
  return <StudentDashboard user={user} onLogout={handleLogout} view={view} />;
}

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600" role="status">
        Loading…
      </p>
    </div>
  );
}

const DASHBOARD_PATHS = [
  "/dashboard",
  ...Object.values(STUDENT_VIEW_PATHS),
  ...Object.values(ADMIN_VIEW_PATHS)
].filter((path, idx, all) => all.indexOf(path) === idx);

export default function App() {
  const nav = useNavigate();

  // api() signals an expired or rejected token; send the user to sign in.
  useEffect(() => {
    const onExpired = (event: Event) => {
      const role = (event as CustomEvent<{ role?: string }>).detail?.role;
      nav(role === "admin" ? "/admin/login" : "/login", {
        replace: true,
        state: { sessionExpired: true }
      });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [nav]);

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/setup-password" element={<AdminSetupPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/student/assessment/result"
          element={
            <ProtectedRoute>
              <StudentAssessmentResult />
            </ProtectedRoute>
          }
        />

        {/* Student and admin portal pages */}
        {DASHBOARD_PATHS.map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
