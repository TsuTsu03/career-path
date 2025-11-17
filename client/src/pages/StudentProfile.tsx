import { useEffect, useState } from "react";

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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:9007/api";

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

  const mergeProfileFromApi = (payload: ApiProfileResponse | null): void => {
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
  };

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/students/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.status === 404) {
          // Walang profile pa → force edit with mostly blank fields
          setProfile((prev) => ({
            ...prev,
            email: user.email
          }));
          setIsNewProfile(true);
          setIsEditing(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to load profile (${res.status})`);
        }

        const body = (await res.json()) as ApiProfileResponse;
        mergeProfileFromApi(body);

        setIsNewProfile(false);
        setIsEditing(false);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load profile");
        }
        // optional: allow edit anyway for fallback
        setIsEditing(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [user.email]);

  const handleChange = (
    field: keyof StudentProfileData,
    value: string
  ): void => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/students/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!res.ok) {
        const body = (await res.json()) as ApiProfileResponse;
        throw new Error(
          body.message ?? `Failed to save profile (${res.status})`
        );
      }

      const body = (await res.json()) as ApiProfileResponse;
      mergeProfileFromApi(body);

      setIsNewProfile(false);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save profile");
      }
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
              Please complete your profile to continue using CARPATH.
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
        {/* Profile Header */}
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

        {/* Profile Details */}
        <div className="p-8 space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Gender</label>
                <select
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
                <label className="block text-gray-700 mb-2">Birth Date</label>
                <input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
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
                <label className="block text-gray-700 mb-2">Address</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div>
            <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Guardian Name
                </label>
                <input
                  type="text"
                  value={profile.guardianName}
                  onChange={(e) => handleChange("guardianName", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Guardian Contact
                </label>
                <input
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

          {/* Academic Interests */}
          <div>
            <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Academic Profile
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Interests & Passions
                </label>
                <textarea
                  value={profile.interests}
                  onChange={(e) => handleChange("interests", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Strengths</label>
                <textarea
                  value={profile.strengths}
                  onChange={(e) => handleChange("strengths", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Hobbies & Activities
                </label>
                <textarea
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
