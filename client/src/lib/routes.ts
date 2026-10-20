// client/src/lib/routes.ts
// URL for each dashboard page. Kept apart from the page components so the
// router can use them without loading the dashboards up front.

export type StudentView =
  | "dashboard"
  | "profile"
  | "assessment"
  | "recommendations"
  | "queries"
  | "settings"
  | "announcements";

export const STUDENT_VIEW_PATHS: Record<StudentView, string> = {
  dashboard: "/student/dashboard",
  profile: "/student/profile",
  assessment: "/student/assessment",
  recommendations: "/student/tracks",
  queries: "/student/queries",
  settings: "/account-settings",
  announcements: "/announcements"
};

export type AdminView =
  | "dashboard"
  | "students"
  | "tracks"
  | "queries"
  | "announcements"
  | "settings";

export const ADMIN_VIEW_PATHS: Record<AdminView, string> = {
  dashboard: "/admin/dashboard",
  students: "/admin/students",
  tracks: "/admin/career-tracks",
  queries: "/admin/queries",
  announcements: "/admin/announcements",
  settings: "/account-settings"
};

// Fired after an admin action that changes dashboard counters.
export const ADMIN_STATS_CHANGED_EVENT = "carpath:admin-stats-changed";
