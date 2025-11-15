import { useState } from "react";

interface StudentProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function StudentProfile({ user }: StudentProfileProps) {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: user.email,
    studentId: "STU2024001",
    grade: "10",
    section: "A",
    gender: "Male",
    birthDate: "2009-05-15",
    contactNumber: "+63 912 345 6789",
    address: "123 Main Street, Quezon City",
    guardianName: "Jane Doe",
    guardianContact: "+63 912 345 6788",
    interests: "Science, Technology, Mathematics",
    strengths: "Problem solving, Critical thinking",
    hobbies: "Programming, Reading, Chess"
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // In real app, save to backend
    alert("Profile updated successfully!");
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">Student Profile</h2>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isEditing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
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
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-blue-100">Student ID: {profile.studentId}</p>
              <p className="text-blue-100">
                Grade {profile.grade} - Section {profile.section}
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
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
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
