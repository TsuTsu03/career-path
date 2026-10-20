import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, errorMessage } from "../lib/api";
import { updateStoredName } from "../lib/session";
import { useToast } from "../components/feedbackContext";
import PasswordInput from "../components/PasswordInput";

interface AccountSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "student" | "admin";
  };
}

type ActiveTab = "account" | "password" | "admins";

interface AdminRow {
  id: string;
  fullName: string;
  email: string;
  createdAt: string | null;
  pendingSetup: boolean;
  setupLinkExpired: boolean;
}

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";

function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 8) problems.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) problems.push("an uppercase letter");
  if (!/[0-9]/.test(password)) problems.push("a number");
  if (!/[^A-Za-z0-9]/.test(password)) problems.push("a special character");
  return problems;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const isAdmin = user.role === "admin";
  const [activeTab, setActiveTab] = useState<ActiveTab>("account");

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "account", label: "Account" },
    { key: "password", label: "Password" },
    ...(isAdmin ? [{ key: "admins" as const, label: "Administrators" }] : [])
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-600">
          Manage your account details and password
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="border-b border-gray-200 flex overflow-x-auto"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 sm:px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "account" && <AccountTab user={user} />}
          {activeTab === "password" && <PasswordTab />}
          {activeTab === "admins" && isAdmin && (
            <AdminsTab currentUserId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}

function AccountTab({ user }: AccountSettingsProps) {
  const toast = useToast();
  const [fullName, setFullName] = useState(user.name);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ user: { fullName: string; studentId: string | null } }>("/auth/me")
      .then((out) => {
        setFullName(out.user.fullName);
        setStudentId(out.user.studentId);
      })
      .catch(() => {
        // keep the name from the session
      });
  }, []);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const out = await api<{ user: { fullName: string } }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ fullName })
      });
      updateStoredName(out.user.fullName);
      toast("Account details saved.");
    } catch (err) {
      toast(errorMessage(err, "Failed to save your details."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6 max-w-xl">
      <div>
        <label htmlFor="account-name" className="block text-gray-700 mb-2">
          Full name
        </label>
        <input
          id="account-name"
          required
          maxLength={120}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="account-email" className="block text-gray-700 mb-2">
          Email address
        </label>
        <input
          id="account-email"
          type="email"
          value={user.email}
          readOnly
          className={`${inputClass} bg-gray-50 text-gray-600`}
        />
        <p className="text-sm text-gray-500 mt-1">
          {user.role === "student"
            ? "Ask your school admin if your email needs to change."
            : "Contact another administrator if your email needs to change."}
        </p>
      </div>
      {studentId && (
        <div>
          <p className="block text-gray-700 mb-2">Student ID</p>
          <p className="text-gray-900">{studentId}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

function PasswordTab() {
  const toast = useToast();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const problems = passwordProblems(form.newPassword);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (problems.length) {
      setError(`New password needs ${problems.join(", ")}.`);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Password changed.");
    } catch (err) {
      setError(errorMessage(err, "Failed to change the password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-xl">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <div>
        <label htmlFor="current-password" className="block text-gray-700 mb-2">
          Current password
        </label>
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          required
          value={form.currentPassword}
          onChange={(e) =>
            setForm({ ...form, currentPassword: e.target.value })
          }
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-gray-700 mb-2">
          New password
        </label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          required
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          className={inputClass}
        />
        {form.newPassword && problems.length > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            Still needs: {problems.join(", ")}.
          </p>
        )}
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-gray-700 mb-2">
          Confirm new password
        </label>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {saving ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}

function AdminsTab({ currentUserId }: { currentUserId: string }) {
  const toast = useToast();
  const [admins, setAdmins] = useState<AdminRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newAdmin, setNewAdmin] = useState({ fullName: "", email: "" });
  const [adding, setAdding] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const out = await api<{ admins: AdminRow[] }>("/admin/admins");
      setAdmins(out.admins);
    } catch (err) {
      setError(errorMessage(err, "Failed to load administrators."));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addAdmin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    try {
      const out = await api<{ message: string; emailSent: boolean }>(
        "/auth/admin/create",
        {
          method: "POST",
          body: JSON.stringify({
            fullName: newAdmin.fullName.trim(),
            email: newAdmin.email.trim().toLowerCase()
          })
        }
      );
      setNewAdmin({ fullName: "", email: "" });
      toast(out.message, out.emailSent ? "success" : "info");
      await load();
    } catch (err) {
      toast(errorMessage(err, "Failed to create admin."), "error");
    } finally {
      setAdding(false);
    }
  };

  const resend = async (admin: AdminRow) => {
    setResending(admin.id);
    try {
      await api(`/admin/admins/${admin.id}/resend-setup`, { method: "POST" });
      toast(`New setup link sent to ${admin.email}.`);
      await load();
    } catch (err) {
      toast(errorMessage(err, "Failed to send the setup link."), "error");
    } finally {
      setResending(null);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-gray-900 mb-3">Administrators</h3>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!admins && !error && <p className="text-gray-600">Loading…</p>}
        {admins && (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {admins.map((a) => (
              <li
                key={a.id}
                className="p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-gray-900">
                    {a.fullName}
                    {a.id === currentUserId && (
                      <span className="text-gray-500"> (you)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 break-all">{a.email}</p>
                </div>
                {a.pendingSetup ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      {a.setupLinkExpired
                        ? "Setup link expired"
                        : "Waiting for setup"}
                    </span>
                    <button
                      type="button"
                      onClick={() => resend(a)}
                      disabled={resending === a.id}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium disabled:opacity-60"
                    >
                      {resending === a.id ? "Sending…" : "Resend link"}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={addAdmin} className="space-y-4 max-w-xl">
        <div>
          <h3 className="text-gray-900">Add Administrator</h3>
          <p className="text-sm text-gray-600">
            The new admin gets an email with a link to set their password. The
            link works for 24 hours.
          </p>
        </div>
        <div>
          <label htmlFor="admin-name" className="block text-gray-700 mb-2">
            Full name
          </label>
          <input
            id="admin-name"
            required
            value={newAdmin.fullName}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, fullName: e.target.value })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="admin-email" className="block text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={newAdmin.email}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, email: e.target.value })
            }
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
        >
          {adding ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}
