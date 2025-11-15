import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// UI dashboards

function RoleBasedDashboard() {
  const nav = useNavigate();

  const role = localStorage.getItem("role") as "student" | "admin" | null;
  const fullName = localStorage.getItem("fullName") || "User";
  const email = localStorage.getItem("email") || "";
  const id = localStorage.getItem("userId") || ""; // optional, depende sa login mo

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    nav("/login", { replace: true });
  };

  if (role === "admin") {
    return (
      <AdminDashboard
        user={{ id, name: fullName, role: "admin", email }}
        onLogout={handleLogout}
      />
    );
  }

  if (role === "student") {
    return (
      <StudentDashboard
        user={{ id, name: fullName, role: "student", email }}
        onLogout={handleLogout}
      />
    );
  }

  // Walang role / invalid role → balik sa login
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
