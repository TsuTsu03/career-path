import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountSettings from "./AccountSettings";
import Announcements from "./Announcements";
import StudentProfile from "./StudentProfile";
import Assessment from "./Assessment";
import StudentQueries from "./StudentQueries";
import TrackRecommendations from "./TrackRecommendations";
import DashboardLayout, { type NavItem } from "../components/DashboardLayout";
import Icon from "../components/Icon";
import { api } from "../lib/api";
import { STUDENT_VIEW_PATHS, type StudentView } from "../lib/routes";

interface StudentDashboardProps {
  user: {
    id: string;
    name: string;
    role: "student" | "admin";
    email: string;
  };
  onLogout: () => void;
  view: StudentView;
}

interface QueryItem {
  id: string;
  status: "pending" | "answered";
}

interface AnnouncementItem {
  id: string;
  date: string;
}

// Remembers, per student and per browser, what they have already seen.
function readSeen(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeSeen(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // storage full or blocked: badges just reappear next time
  }
}

interface ProgressState {
  assessmentDone: boolean;
  reviewed: boolean;
  askedCounselor: boolean;
}

export default function StudentDashboard({
  user,
  onLogout,
  view
}: StudentDashboardProps) {
  const navigate = useNavigate();
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [announcementIds, setAnnouncementIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressState | null>(null);

  const seenAnswersKey = `seenAnswers:${user.id}`;
  const seenAnnouncementsKey = `seenAnnouncements:${user.id}`;
  const reviewedKey = `reviewedRecommendations:${user.id}`;

  // Load what the badges and progress card need.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // The progress card only shows on the home page; other pages only
      // need the badge counts.
      const needsProgress = view === "dashboard" || view === "recommendations";
      const [queries, announcements, latest] = await Promise.allSettled([
        api<{ queries: QueryItem[] }>("/queries"),
        api<{ announcements: AnnouncementItem[] }>("/announcements"),
        needsProgress
          ? api<unknown>("/assessments/aptitude/latest")
          : Promise.reject(new Error("skipped"))
      ]);
      if (cancelled) return;

      const queryList =
        queries.status === "fulfilled" ? queries.value.queries : [];
      setAnsweredIds(
        queryList.filter((q) => q.status === "answered").map((q) => q.id)
      );
      setAnnouncementIds(
        announcements.status === "fulfilled"
          ? announcements.value.announcements.map((a) => a.id)
          : []
      );
      setProgress((prev) => ({
        assessmentDone: needsProgress
          ? latest.status === "fulfilled"
          : (prev?.assessmentDone ?? false),
        reviewed: localStorage.getItem(reviewedKey) === "1",
        askedCounselor: queryList.length > 0
      }));
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [view, reviewedKey]);

  // Opening a page marks its items as seen.
  useEffect(() => {
    if (view === "queries" && answeredIds.length) {
      writeSeen(seenAnswersKey, answeredIds);
    }
    if (view === "announcements" && announcementIds.length) {
      writeSeen(seenAnnouncementsKey, announcementIds);
    }
    if (view === "recommendations" && progress?.assessmentDone) {
      localStorage.setItem(reviewedKey, "1");
    }
  }, [
    view,
    answeredIds,
    announcementIds,
    progress?.assessmentDone,
    seenAnswersKey,
    seenAnnouncementsKey,
    reviewedKey
  ]);

  const newAnswers =
    view === "queries"
      ? 0
      : answeredIds.filter((id) => !readSeen(seenAnswersKey).includes(id))
          .length;
  const newAnnouncements =
    view === "announcements"
      ? 0
      : announcementIds.filter(
          (id) => !readSeen(seenAnnouncementsKey).includes(id)
        ).length;

  const handleNavigation = (next: StudentView) => {
    navigate(STUDENT_VIEW_PATHS[next]);
  };

  const navItems: NavItem<StudentView>[] = [
    { view: "dashboard", label: "Dashboard", icon: "home" },
    { view: "profile", label: "My Profile", icon: "user" },
    { view: "assessment", label: "Track Assessment", icon: "clipboard" },
    { view: "recommendations", label: "SHS Recommendations", icon: "trend" },
    {
      view: "announcements",
      label: "Announcements",
      icon: "megaphone",
      badge: newAnnouncements
    },
    { view: "queries", label: "My Queries", icon: "chat", badge: newAnswers },
    { view: "settings", label: "Settings", icon: "settings" }
  ];

  const renderContent = () => {
    switch (view) {
      case "profile":
        return <StudentProfile user={user} />;
      case "assessment":
        return <Assessment />;
      case "recommendations":
        return <TrackRecommendations />;
      case "queries":
        return <StudentQueries userId={user.id} />;
      case "settings":
        return <AccountSettings user={user} />;
      case "announcements":
        return <Announcements />;
      default:
        return (
          <DashboardHome
            name={user.name}
            onNavigate={handleNavigation}
            progress={progress}
            newAnswers={newAnswers}
          />
        );
    }
  };

  return (
    <DashboardLayout
      portalLabel="Student Portal"
      accent="blue"
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

interface DashboardHomeProps {
  name: string;
  onNavigate: (view: StudentView) => void;
  progress: ProgressState | null;
  newAnswers: number;
}

function DashboardHome({
  name,
  onNavigate,
  progress,
  newAnswers
}: DashboardHomeProps) {
  const firstName = name.split(" ")[0] || name;

  const actions: {
    view: StudentView;
    title: string;
    text: string;
    icon: "clipboard" | "trend" | "chat";
    color: string;
  }[] = [
    {
      view: "assessment",
      title: progress?.assessmentDone ? "Assessment Done" : "Take Assessment",
      text: progress?.assessmentDone
        ? "Review your answers and result"
        : "Discover your best-fit strand",
      icon: "clipboard",
      color: "bg-blue-100 text-blue-600"
    },
    {
      view: "recommendations",
      title: "View Results",
      text: "See your strand recommendations",
      icon: "trend",
      color: "bg-green-100 text-green-600"
    },
    {
      view: "queries",
      title: "Ask Questions",
      text:
        newAnswers > 0
          ? `${newAnswers} new ${newAnswers === 1 ? "answer" : "answers"} from your counselor`
          : "Get guidance from counselors",
      icon: "chat",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const steps = [
    {
      label: "Complete Career Assessment",
      done: progress?.assessmentDone ?? false,
      view: "assessment" as StudentView
    },
    {
      label: "Review Track Recommendations",
      done: progress?.reviewed ?? false,
      view: "recommendations" as StudentView
    },
    {
      label: "Consult with Counselor",
      done: progress?.askedCounselor ?? false,
      view: "queries" as StudentView
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Welcome, {firstName}</h2>
        <p className="text-gray-600">
          Your personalized career path guidance system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {actions.map((a) => (
          <button
            key={a.view}
            type="button"
            onClick={() => onNavigate(a.view)}
            className="text-left bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Your Progress</h3>
        {progress === null ? (
          <p className="text-gray-500">Loading your progress…</p>
        ) : (
          <ol className="space-y-4">
            {steps.map((step, idx) => (
              <li key={step.label} className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate(step.view)}
                  className="flex items-center gap-3 text-left hover:underline"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      step.done
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {step.done ? <Icon name="check" /> : idx + 1}
                  </span>
                  <span className="text-gray-700">{step.label}</span>
                </button>
                {step.done && <span className="text-green-600">Completed</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
