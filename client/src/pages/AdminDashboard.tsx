import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminStudentManagement from "./AdminStudentManagement";
import AdminCareerTracks from "./AdminCareerTracks";
import AdminQueryManagement from "./AdminQueryManagement";
import AdminAnnouncements from "./AdminAnnouncements";
import AccountSettings from "./AccountSettings";
import DashboardLayout, { type NavItem } from "../components/DashboardLayout";
import Icon from "../components/Icon";
import { api, errorMessage } from "../lib/api";
import {
  ADMIN_STATS_CHANGED_EVENT,
  ADMIN_VIEW_PATHS,
  type AdminView
} from "../lib/routes";

interface AdminDashboardProps {
  user: {
    id: string;
    name: string;
    role: "student" | "admin";
    email: string;
  };
  onLogout: () => void;
  view: AdminView;
}

type TrackKey = "stem" | "abm" | "humss" | "gas";

interface AdminStats {
  totalStudents: number;
  pendingQueries: number;
  activeTracks: number;
  completedAssessments: number;
  strandDistribution: Record<TrackKey, number>;
}

export default function AdminDashboard({
  user,
  onLogout,
  view
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Refresh counters whenever the admin moves between pages, so the pending
  // badge drops after answering queries.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      api<AdminStats>("/admin/stats")
        .then((data) => {
          if (!cancelled) {
            setStats(data);
            setStatsError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setStatsError(errorMessage(err, "Failed to load dashboard stats."));
          }
        });

    void load();
    window.addEventListener(ADMIN_STATS_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(ADMIN_STATS_CHANGED_EVENT, load);
    };
  }, [view]);

  const handleNavigation = (next: AdminView) => {
    navigate(ADMIN_VIEW_PATHS[next]);
  };

  const navItems: NavItem<AdminView>[] = [
    { view: "dashboard", label: "Dashboard", icon: "home" },
    { view: "students", label: "Student Records", icon: "users" },
    { view: "tracks", label: "Career Tracks", icon: "layers" },
    {
      view: "queries",
      label: "Student Queries",
      icon: "chat",
      badge: stats?.pendingQueries ?? 0
    },
    { view: "announcements", label: "Announcements", icon: "megaphone" },
    { view: "settings", label: "Settings", icon: "settings" }
  ];

  const renderContent = () => {
    switch (view) {
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
            stats={stats}
            error={statsError}
            onNavigate={handleNavigation}
          />
        );
    }
  };

  return (
    <DashboardLayout
      portalLabel="Admin Portal"
      accent="purple"
      userName={user.name}
      onLogout={onLogout}
      navItems={navItems}
      activeView={view}
      onNavigate={handleNavigation}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

interface Activity {
  type: "registered" | "assessment" | "query" | "answered";
  action: string;
  user: string;
  date: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"]
  ];
  for (const [size, unit] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

const STRANDS: { key: TrackKey; label: string; bar: string }[] = [
  { key: "stem", label: "STEM", bar: "bg-blue-500" },
  { key: "abm", label: "ABM", bar: "bg-green-500" },
  { key: "humss", label: "HUMSS", bar: "bg-amber-500" },
  { key: "gas", label: "GAS", bar: "bg-purple-500" }
];

function AdminDashboardHome({
  stats,
  error,
  onNavigate
}: {
  stats: AdminStats | null;
  error: string | null;
  onNavigate: (view: AdminView) => void;
}) {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    api<{ activities: Activity[] }>("/admin/activity")
      .then((data) => setActivities(data.activities))
      .catch((err) =>
        setActivityError(errorMessage(err, "Failed to load recent activity."))
      );
  }, []);

  const statCards = [
    {
      label: "Total Students",
      value: stats?.totalStudents,
      icon: "users" as const,
      color: "bg-blue-100 text-blue-600"
    },
    {
      label: "Pending Queries",
      value: stats?.pendingQueries,
      icon: "chat" as const,
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      label: "Active Tracks",
      value: stats?.activeTracks,
      icon: "layers" as const,
      color: "bg-green-100 text-green-600"
    },
    {
      label: "Assessments Completed",
      value: stats?.completedAssessments,
      icon: "check" as const,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const totalResults = stats
    ? STRANDS.reduce((sum, s) => sum + (stats.strandDistribution?.[s.key] ?? 0), 0)
    : 0;

  const quickActions = [
    {
      view: "students" as AdminView,
      title: "Manage Students",
      text: "View and edit records",
      icon: "users" as const,
      color: "bg-blue-100 text-blue-600"
    },
    {
      view: "queries" as AdminView,
      title: "Answer Queries",
      text: "Respond to students",
      icon: "chat" as const,
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      view: "announcements" as AdminView,
      title: "Post Announcement",
      text: "Share updates & events",
      icon: "megaphone" as const,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">
          Manage student records, career tracks, and queries
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value ?? "…"}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
              >
                <Icon name={stat.icon} className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {quickActions.map((a) => (
          <button
            key={a.view}
            type="button"
            onClick={() => onNavigate(a.view)}
            className="text-left bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <div className="flex items-center gap-4">
              <div className={`${a.color} rounded-lg p-3`}>
                <Icon name={a.icon} className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-gray-900">{a.title}</h3>
                <p className="text-gray-600">{a.text}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-1">Recommended Strands</h3>
          <p className="text-sm text-gray-500 mb-4">
            First-choice strand from {totalResults} completed{" "}
            {totalResults === 1 ? "assessment" : "assessments"}
          </p>
          {stats ? (
            <ul className="space-y-3">
              {STRANDS.map((s) => {
                const count = stats.strandDistribution?.[s.key] ?? 0;
                const pct = totalResults
                  ? Math.round((count / totalResults) * 100)
                  : 0;
                return (
                  <li key={s.key}>
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>{s.label}</span>
                      <span>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${s.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">Loading…</p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-gray-900">Recent Activities</h3>
          </div>
          {activityError ? (
            <p className="p-6 text-sm text-red-700">{activityError}</p>
          ) : activities === null ? (
            <p className="p-6 text-gray-500">Loading…</p>
          ) : activities.length === 0 ? (
            <p className="p-6 text-gray-500">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activities.map((a, idx) => (
                <li
                  key={`${a.type}-${a.date}-${idx}`}
                  className="p-4 sm:px-6 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-gray-900 truncate">{a.action}</p>
                    <p className="text-sm text-gray-600">{a.user}</p>
                  </div>
                  <time
                    dateTime={a.date}
                    className="text-sm text-gray-500 shrink-0"
                    title={new Date(a.date).toLocaleString()}
                  >
                    {timeAgo(a.date)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
