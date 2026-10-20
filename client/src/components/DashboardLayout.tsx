// client/src/components/DashboardLayout.tsx
//
// Shared shell for the student and admin portals: header, sidebar navigation
// (a slide-in drawer on phones) and the main content area.
import { useEffect, useState, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

export interface NavItem<V extends string> {
  view: V;
  label: string;
  icon: IconName;
  badge?: number;
}

interface DashboardLayoutProps<V extends string> {
  portalLabel: string;
  accent: "blue" | "purple";
  userName: string;
  onLogout: () => void;
  navItems: NavItem<V>[];
  activeView: V;
  onNavigate: (view: V) => void;
  children: ReactNode;
}

const ACCENT = {
  blue: {
    active: "bg-blue-50 text-blue-700",
    badge: "bg-blue-600"
  },
  purple: {
    active: "bg-purple-50 text-purple-700",
    badge: "bg-purple-600"
  }
};

export default function DashboardLayout<V extends string>({
  portalLabel,
  accent,
  userName,
  onLogout,
  navItems,
  activeView,
  onNavigate,
  children
}: DashboardLayoutProps<V>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const colors = ACCENT[accent];

  // Close the phone drawer whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [activeView]);

  const nav = (
    <nav aria-label={`${portalLabel} navigation`} className="p-4 space-y-1">
      {navItems.map((item) => {
        const isActive = item.view === activeView;
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => onNavigate(item.view)}
            aria-current={isActive ? "page" : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              isActive ? colors.active : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon name={item.icon} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span
                className={`min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-semibold text-white ${colors.badge}`}
                aria-label={`${item.badge} new`}
              >
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="md:hidden -ml-1 p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Icon name="menu" className="w-6 h-6" />
            </button>
            <img
              src="/assets/LOGO.jpg"
              alt=""
              className="w-8 h-8 object-contain shrink-0"
            />
            <div className="min-w-0">
              <p className="text-gray-900 font-semibold leading-tight">
                CAREER PATH
              </p>
              <p className="text-gray-600 text-sm leading-tight">
                {portalLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-gray-700 truncate max-w-48">
              {userName}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 shrink-0 bg-white min-h-[calc(100vh-4rem)] shadow-sm">
          {nav}
        </aside>

        {/* Phone drawer */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between px-4 pt-4">
                <p className="text-gray-900 font-semibold">{userName}</p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <Icon name="close" />
                </button>
              </div>
              {nav}
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
