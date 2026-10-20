import { useCallback, useEffect, useState } from "react";
import { api, ApiError, errorMessage } from "../lib/api";
import { getToken } from "../lib/session";
import { useToast } from "../components/feedbackContext";

interface StudentProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface StudentProfileData {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  grade: string;
  section: string;
  gender: string;
  birthDate: string; // yyyy-MM-dd
  contactNumber: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  interests: string;
  strengths: string;
  hobbies: string;
}

interface ApiProfileResponse {
  success?: boolean;
  message?: string;
  data?: Partial<
    StudentProfileData & {
      gradeLevel?: string;
    }
  >;
}

const emptyProfile: StudentProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  studentId: "",
  grade: "",
  section: "",
  gender: "",
  birthDate: "",
  contactNumber: "",
  address: "",
  guardianName: "",
  guardianContact: "",
  interests: "",
  strengths: "",
  hobbies: ""
};

export default function StudentProfile({ user }: StudentProfileProps) {
  const [profile, setProfile] = useState<StudentProfileData>({
    ...emptyProfile,
    email: user.email
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const mergeProfileFromApi = useCallback(
    (payload: ApiProfileResponse | null): void => {
      if (!payload) return;

      const raw = (payload.data ?? {}) as ApiProfileResponse["data"];

      setProfile((prev) => ({
        ...prev,
        firstName: raw?.firstName ?? "",
        lastName: raw?.lastName ?? "",
        email: raw?.email ?? user.email,
        studentId: raw?.studentId ?? "",
        grade: raw?.gradeLevel ?? raw?.grade ?? "",
        section: raw?.section ?? "",
        gender: raw?.gender ?? "",
        birthDate: raw?.birthDate ? String(raw.birthDate).slice(0, 10) : "",
        contactNumber: raw?.contactNumber ?? "",
        address: raw?.address ?? "",
        guardianName: raw?.guardianName ?? "",
        guardianContact: raw?.guardianContact ?? "",
        interests: raw?.interests ?? "",
        strengths: raw?.strengths ?? "",
        hobbies: raw?.hobbies ?? ""
      }));
    },
    [user.email]
  );

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      if (!getToken()) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const body = await api<ApiProfileResponse>("/students/me");
        mergeProfileFromApi(body);
        setIsNewProfile(false);
        setIsEditing(false);
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 404) {
          // First visit: start a new profile with the account's details.
          setIsNewProfile(true);
          setIsEditing(true);
          try {
            const me = await api<{ user: { studentId: string | null } }>(
              "/auth/me"
            );
            setProfile((prev) => ({
              ...prev,
              email: user.email,
              studentId: me.user.studentId ?? ""
            }));
          } catch {
            setProfile((prev) => ({ ...prev, email: user.email }));
          }
        } else {
          setError(errorMessage(err, "Failed to load profile"));
          setIsEditing(true);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [user.email, mergeProfileFromApi]);

  const handleChange = (
    field: keyof StudentProfileData,
    value: string
  ): void => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError(null);

    // Email and student ID come from the account and are not sent.
    const payload = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      birthDate: profile.birthDate || undefined,
      contactNumber: profile.contactNumber,
      address: profile.address,
      guardianName: profile.guardianName,
      guardianContact: profile.guardianContact,
      interests: profile.interests,
      strengths: profile.strengths,
      hobbies: profile.hobbies,
      gradeLevel: profile.grade,
      section: profile.section
    };

    try {
      const body = await api<ApiProfileResponse>("/students/me", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (body?.data) mergeProfileFromApi(body);

      setIsNewProfile(false);
      setIsEditing(false);
      toast("Profile updated successfully!");
    } catch (err: unknown) {
      setError(errorMessage(err, "Failed to save profile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading profile...</div>;
  }

  const canToggleEdit = !isNewProfile;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">Student Profile</h2>
          <p className="text-gray-600">Manage your personal information</p>
          {isNewProfile && (
            <p className="text-sm text-orange-600 mt-1">
              Please complete your profile to continue using CAREER PATH.
            </p>
          )}
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        <button
          onClick={() => (isEditing ? void handleSave() : setIsEditing(true))}
          disabled={saving || (!canToggleEdit && !isEditing)}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isEditing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : canToggleEdit
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          {isEditing
            ? saving
              ? "Saving..."
              : "Save Changes"
            : isNewProfile
              ? "Fill Profile"
              : "Edit Profile"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 rounded-t-lg">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="text-white">
              <h3>
                {profile.firstName || "Your"} {profile.lastName || "Name"}
              </h3>
              <p className="text-blue-100">
                Student ID: {profile.studentId || "Not set yet"}
              </p>
              <p className="text-blue-100">
                {profile.grade && profile.section
                  ? `Grade ${profile.grade} - Section ${profile.section}`
                  : "No grade/section set"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="profile-firstName"
                  className="block text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  id="profile-firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-lastName"
                  className="block text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="profile-lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-gender"
                  className="block text-gray-700 mb-2"
                >
                  Gender
                </label>
                <select
                  id="profile-gender"
                  value={profile.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="profile-birthDate"
                  className="block text-gray-700 mb-2"
                >
                  Birth Date
                </label>
                <input
                  id="profile-birthDate"
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  disabled={!isEditing}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-grade"
                  className="block text-gray-700 mb-2"
                >
                  Grade Level
                </label>
                <select
                  id="profile-grade"
                  value={profile.grade}
                  onChange={(e) => handleChange("grade", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                >
                  <option value="">Select grade level</option>
                  {profile.grade &&
                    !["Grade 9", "Grade 10", "Grade 11", "Grade 12"].includes(
                      profile.grade
                    ) && <option>{profile.grade}</option>}
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="profile-section"
                  className="block text-gray-700 mb-2"
                >
                  Section
                </label>
                <input
                  id="profile-section"
                  type="text"
                  value={profile.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  disabled={!isEditing}
                  maxLength={40}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-contactNumber"
                  className="block text-gray-700 mb-2"
                >
                  Contact Number
                </label>
                <input
                  id="profile-contactNumber"
                  type="tel"
                  value={profile.contactNumber}
                  onChange={(e) =>
                    handleChange("contactNumber", e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="profile-address"
                  className="block text-gray-700 mb-2"
                >
                  Address
                </label>
                <textarea
                  id="profile-address"
                  value={profile.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="profile-guardianName"
                  className="block text-gray-700 mb-2"
                >
                  Guardian Name
                </label>
                <input
                  id="profile-guardianName"
                  type="text"
                  value={profile.guardianName}
                  onChange={(e) => handleChange("guardianName", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-guardianContact"
                  className="block text-gray-700 mb-2"
                >
                  Guardian Contact
                </label>
                <input
                  id="profile-guardianContact"
                  type="tel"
                  value={profile.guardianContact}
                  onChange={(e) =>
                    handleChange("guardianContact", e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Academic Profile
            </h3>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="profile-interests"
                  className="block text-gray-700 mb-2"
                >
                  Interests & Passions
                </label>
                <textarea
                  id="profile-interests"
                  value={profile.interests}
                  onChange={(e) => handleChange("interests", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-strengths"
                  className="block text-gray-700 mb-2"
                >
                  Strengths
                </label>
                <textarea
                  id="profile-strengths"
                  value={profile.strengths}
                  onChange={(e) => handleChange("strengths", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-hobbies"
                  className="block text-gray-700 mb-2"
                >
                  Hobbies & Activities
                </label>
                <textarea
                  id="profile-hobbies"
                  value={profile.hobbies}
                  onChange={(e) => handleChange("hobbies", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
