import { useState } from "react";

interface AccountSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "student" | "admin";
  };
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [settings, setSettings] = useState({
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    queryNotifications: true,
    announcementNotifications: true,
    theme: "light"
  });

  const [activeTab, setActiveTab] = useState<
    "account" | "notifications" | "privacy"
  >("account");

  const handleSaveAccount = () => {
    alert("Account settings saved successfully!");
  };

  const handleChangePassword = () => {
    if (settings.newPassword === settings.confirmPassword) {
      alert("Password changed successfully!");
      setSettings({
        ...settings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } else {
      alert("New passwords do not match!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-600">
          Manage your account preferences and security
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("account")}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === "account"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === "notifications"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-6 py-4 border-b-2 transition-colors ${
                activeTab === "privacy"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Privacy
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) =>
                        setSettings({ ...settings, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveAccount}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={settings.currentPassword}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          currentPassword: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={settings.newPassword}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          newPassword: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={settings.confirmPassword}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          confirmPassword: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div>
              <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-gray-900">Email Notifications</p>
                    <p className="text-gray-600">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        emailNotifications: !settings.emailNotifications
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.emailNotifications
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.emailNotifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-gray-900">
                      Query Response Notifications
                    </p>
                    <p className="text-gray-600">
                      Get notified when counselors respond to your queries
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        queryNotifications: !settings.queryNotifications
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.queryNotifications
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.queryNotifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-gray-900">Announcement Notifications</p>
                    <p className="text-gray-600">
                      Receive notifications about new announcements and events
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        announcementNotifications:
                          !settings.announcementNotifications
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.announcementNotifications
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.announcementNotifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div>
              <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Privacy Settings
              </h3>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-blue-600 mr-3 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-gray-900 mb-1">Data Privacy Notice</p>
                      <p className="text-gray-700">
                        Your personal information and assessment results are
                        kept confidential and secure. Only authorized counselors
                        and administrators can access your data for guidance
                        purposes.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-900 mb-2">Profile Visibility</p>
                  <p className="text-gray-600 mb-3">
                    Your profile is only visible to counselors and
                    administrators
                  </p>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg inline-block text-gray-700">
                    Private
                  </div>
                </div>

                <div>
                  <p className="text-gray-900 mb-2">Data Export</p>
                  <p className="text-gray-600 mb-3">
                    Download a copy of your personal data and assessment results
                  </p>
                  <button className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Export My Data
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-gray-900 mb-2">Delete Account</p>
                  <p className="text-gray-600 mb-3">
                    Permanently delete your account and all associated data
                  </p>
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
