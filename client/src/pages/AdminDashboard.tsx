import { useState } from "react";
import AdminStudentManagement from "./AdminStudentManagement";
import AdminCareerTracks from "./AdminCareerTracks";
import AdminQueryManagement from "./AdminQueryManagement";
import AdminAnnouncements from "./AdminAnnouncements";
import AccountSettings from "./AccountSettings";

interface AdminDashboardProps {
  user: {
    id: string;
    name: string;
    role: "student" | "admin";
    email: string;
  };
  onLogout: () => void;
}

type AdminView =
  | "dashboard"
  | "students"
  | "tracks"
  | "queries"
  | "announcements"
  | "settings";

export default function AdminDashboard({
  user,
  onLogout
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "students":
        return <AdminStudentManagement />;
      case "tracks":
        return <AdminCareerTracks />;
      case "queries":
        return <AdminQueryManagement />;
      case "announcements":
        return <AdminAnnouncements />;
      case "settings":
        return <AccountSettings user={user} />;
      default:
        return (
          <AdminDashboardHome
            onNavigate={(view: AdminView) => setActiveView(view)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600 text-white rounded-lg p-2">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-gray-900">CARPATH</h1>
                <p className="text-gray-600">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen shadow-sm">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === "dashboard"
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView("students")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === "students"
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Student Records</span>
            </button>

            <button
              onClick={() => setActiveView("tracks")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === "tracks"
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Career Tracks</span>
            </button>

            <button
              onClick={() => setActiveView("queries")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === "queries"
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>Student Queries</span>
            </button>

            <button
              onClick={() => setActiveView("announcements")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === "announcements"
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
              <span>Announcements</span>
            </button>

            <button
              onClick={() => setActiveView("settings")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === "settings"
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  );
}

interface AdminDashboardHomeProps {
  onNavigate: (view: AdminView) => void;
}

function AdminDashboardHome({ onNavigate }: AdminDashboardHomeProps) {
  const stats = [
    {
      label: "Total Students",
      value: "542",
      icon: "👥",
      color: "blue" as const
    },
    {
      label: "Pending Queries",
      value: "12",
      icon: "💬",
      color: "yellow" as const
    },
    { label: "Active Tracks", value: "4", icon: "📚", color: "green" as const },
    {
      label: "Assessments Completed",
      value: "387",
      icon: "✅",
      color: "purple" as const
    }
  ];

  const recentActivities = [
    {
      action: "New student registered",
      user: "Maria Santos",
      time: "5 minutes ago"
    },
    {
      action: "Assessment completed",
      user: "Juan Dela Cruz",
      time: "15 minutes ago"
    },
    { action: "Query submitted", user: "Ana Reyes", time: "1 hour ago" },
    {
      action: "Track preference updated",
      user: "Carlos Mendoza",
      time: "2 hours ago"
    }
  ];

  type StatColor = "blue" | "yellow" | "green" | "purple";

  const getStatColor = (color: StatColor) => {
    const colors: Record<StatColor, string> = {
      blue: "bg-blue-100 text-blue-600",
      yellow: "bg-yellow-100 text-yellow-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600"
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">
          Manage student records, career tracks, and queries
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">{stat.label}</p>
                <p className="text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${getStatColor(
                  stat.color
                )} flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate("students")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-600 rounded-lg p-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-900">Manage Students</h3>
              <p className="text-gray-600">View and edit records</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate("queries")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 text-yellow-600 rounded-lg p-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-900">Answer Queries</h3>
              <p className="text-gray-600">Respond to students</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate("announcements")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 text-purple-600 rounded-lg p-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-900">Post Announcement</h3>
              <p className="text-gray-600">Share updates & events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900">Recent Activities</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="p-6 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-gray-900">{activity.action}</p>
                  <p className="text-gray-600">{activity.user}</p>
                </div>
              </div>
              <span className="text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
