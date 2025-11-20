import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// Shared / student pages
import StudentAssessmentResult from "./pages/StudentAssessmentResult";
import VerifyEmail from "./pages/VerifyEmail";

// ======================
// Role-based dashboard
// ======================
function RoleBasedDashboard() {
  const nav = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role") as "student" | "admin" | null;
  const fullName = localStorage.getItem("fullName") || "User";
  const email = localStorage.getItem("email") || "";
  const id = localStorage.getItem("userId") || "";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    nav("/login", { replace: true });
  };

  const path = location.pathname;

  // ---------- STUDENT VIEW MAP ----------
  let initialStudentView:
    | "dashboard"
    | "profile"
    | "assessment"
    | "recommendations"
    | "queries"
    | "settings"
    | "announcements" = "dashboard";

  if (path.startsWith("/student/profile")) {
    initialStudentView = "profile";
  } else if (path.startsWith("/student/assessment")) {
    initialStudentView = "assessment";
  } else if (path.startsWith("/student/tracks")) {
    initialStudentView = "recommendations";
  } else if (path.startsWith("/student/queries")) {
    initialStudentView = "queries";
  } else if (path.startsWith("/account-settings")) {
    initialStudentView = "settings";
  } else if (path.startsWith("/announcements")) {
    initialStudentView = "announcements";
  } else if (path.startsWith("/student/dashboard") || path === "/dashboard") {
    initialStudentView = "dashboard";
  }

  // ---------- ADMIN VIEW MAP ----------
  let initialAdminView:
    | "dashboard"
    | "students"
    | "tracks"
    | "queries"
    | "announcements"
    | "settings" = "dashboard";

  if (path.startsWith("/admin/students")) {
    initialAdminView = "students";
  } else if (path.startsWith("/admin/career-tracks")) {
    initialAdminView = "tracks";
  } else if (path.startsWith("/admin/queries")) {
    initialAdminView = "queries";
  } else if (path.startsWith("/admin/announcements")) {
    initialAdminView = "announcements";
  } else if (path.startsWith("/account-settings")) {
    initialAdminView = "settings";
  } else if (path.startsWith("/admin/dashboard") || path === "/dashboard") {
    initialAdminView = "dashboard";
  }

  if (role === "admin") {
    return (
      <AdminDashboard
        user={{ id, name: fullName, role: "admin", email }}
        onLogout={handleLogout}
        initialView={initialAdminView}
      />
    );
  }

  if (role === "student") {
    return (
      <StudentDashboard
        user={{ id, name: fullName, role: "student", email }}
        onLogout={handleLogout}
        initialView={initialStudentView}
      />
    );
  }

  // Walang valid role → balik login
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Generic dashboard (decides admin vs student) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      {/* ======================
          Student routes
         ====================== */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/assessment"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/assessment/result"
        element={
          <ProtectedRoute>
            <StudentAssessmentResult />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/queries"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/tracks"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account-settings"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      {/* ======================
          Admin routes
         ====================== */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/career-tracks"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/queries"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
