import { useState } from "react";

interface CareerTrack {
  id: string;
  name: string;
  fullName: string;
  description: string;
  subjects: string[];
  careers: string[];
  requirements: string;
  enrolledStudents: number;
}

export default function AdminCareerTracks() {
  const [tracks, setTracks] = useState<CareerTrack[]>([
    {
      id: "1",
      name: "STEM",
      fullName: "Science, Technology, Engineering, and Mathematics",
      description:
        "Perfect for students interested in scientific inquiry, technological innovation, and mathematical problem-solving.",
      subjects: [
        "Pre-Calculus",
        "Basic Calculus",
        "General Physics",
        "General Chemistry",
        "General Biology"
      ],
      careers: [
        "Engineer",
        "Computer Scientist",
        "Medical Doctor",
        "Research Scientist",
        "Architect",
        "Data Analyst"
      ],
      requirements:
        "Average of 85 and above, especially in Science and Mathematics",
      enrolledStudents: 187
    },
    {
      id: "2",
      name: "ABM",
      fullName: "Accountancy, Business, and Management",
      description:
        "Ideal for students with entrepreneurial spirit and interest in business operations, finance, and management.",
      subjects: [
        "Fundamentals of Accountancy",
        "Business Mathematics",
        "Applied Economics",
        "Business Finance",
        "Organization and Management"
      ],
      careers: [
        "Accountant",
        "Business Manager",
        "Marketing Professional",
        "Financial Analyst",
        "HR Manager",
        "Business Consultant"
      ],
      requirements:
        "Average of 83 and above, strong analytical and communication skills",
      enrolledStudents: 145
    },
    {
      id: "3",
      name: "HUMSS",
      fullName: "Humanities and Social Sciences",
      description:
        "Best suited for students passionate about understanding human behavior, society, culture, and communication.",
      subjects: [
        "Creative Writing",
        "Introduction to World Religions",
        "Philippine Politics and Governance",
        "Disciplines and Ideas in Social Sciences",
        "Creative Nonfiction"
      ],
      careers: [
        "Lawyer",
        "Psychologist",
        "Teacher",
        "Social Worker",
        "Journalist",
        "Diplomat"
      ],
      requirements:
        "Average of 83 and above, strong reading comprehension and writing skills",
      enrolledStudents: 128
    },
    {
      id: "4",
      name: "GAS",
      fullName: "General Academic Strand",
      description:
        "A flexible track that allows exploration of various fields before choosing a specific career path in college.",
      subjects: [
        "Humanities Subjects",
        "Social Sciences Subjects",
        "Applied Subjects",
        "Specialized Subjects (Electives)",
        "General Education Subjects"
      ],
      careers: [
        "Various College Courses",
        "Interdisciplinary Fields",
        "Liberal Arts Programs",
        "Communication Specialist",
        "Public Relations Officer"
      ],
      requirements: "Average of 80 and above",
      enrolledStudents: 82
    }
  ]);

  const [selectedTrack, setSelectedTrack] = useState<CareerTrack | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateTrack = () => {
    if (selectedTrack) {
      setTracks(
        tracks.map((t) => (t.id === selectedTrack.id ? selectedTrack : t))
      );
      setIsEditing(false);
      alert("Track updated successfully!");
    }
  };

  const addSubject = () => {
    if (selectedTrack) {
      setSelectedTrack({
        ...selectedTrack,
        subjects: [...selectedTrack.subjects, ""]
      });
    }
  };

  const updateSubject = (index: number, value: string) => {
    if (selectedTrack) {
      const newSubjects = [...selectedTrack.subjects];
      newSubjects[index] = value;
      setSelectedTrack({ ...selectedTrack, subjects: newSubjects });
    }
  };

  const removeSubject = (index: number) => {
    if (selectedTrack) {
      setSelectedTrack({
        ...selectedTrack,
        subjects: selectedTrack.subjects.filter((_, i) => i !== index)
      });
    }
  };

  const addCareer = () => {
    if (selectedTrack) {
      setSelectedTrack({
        ...selectedTrack,
        careers: [...selectedTrack.careers, ""]
      });
    }
  };

  const updateCareer = (index: number, value: string) => {
    if (selectedTrack) {
      const newCareers = [...selectedTrack.careers];
      newCareers[index] = value;
      setSelectedTrack({ ...selectedTrack, careers: newCareers });
    }
  };

  const removeCareer = (index: number) => {
    if (selectedTrack) {
      setSelectedTrack({
        ...selectedTrack,
        careers: selectedTrack.careers.filter((_, i) => i !== index)
      });
    }
  };

  if (selectedTrack) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => {
            setSelectedTrack(null);
            setIsEditing(false);
          }}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Career Tracks
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-blue-700 p-6 rounded-t-lg flex items-center justify-between">
            <div>
              <h2 className="text-white mb-2">{selectedTrack.name} Track</h2>
              <p className="text-blue-100">
                {selectedTrack.enrolledStudents} enrolled students
              </p>
            </div>
            <button
              onClick={() =>
                isEditing ? handleUpdateTrack() : setIsEditing(true)
              }
              className={`px-6 py-2 rounded-lg transition-colors ${
                isEditing
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-white hover:bg-gray-100 text-purple-600"
              }`}
            >
              {isEditing ? "Save Changes" : "Edit Track"}
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Track Name</label>
              <input
                type="text"
                value={selectedTrack.name}
                onChange={(e) =>
                  setSelectedTrack({ ...selectedTrack, name: e.target.value })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={selectedTrack.fullName}
                onChange={(e) =>
                  setSelectedTrack({
                    ...selectedTrack,
                    fullName: e.target.value
                  })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={selectedTrack.description}
                onChange={(e) =>
                  setSelectedTrack({
                    ...selectedTrack,
                    description: e.target.value
                  })
                }
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Requirements</label>
              <textarea
                value={selectedTrack.requirements}
                onChange={(e) =>
                  setSelectedTrack({
                    ...selectedTrack,
                    requirements: e.target.value
                  })
                }
                disabled={!isEditing}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700">
                  Specialized Subjects
                </label>
                {isEditing && (
                  <button
                    onClick={addSubject}
                    className="text-purple-600 hover:text-purple-700 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Subject
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {selectedTrack.subjects.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => updateSubject(index, e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeSubject(index)}
                        className="text-red-600 hover:text-red-700"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700">
                  Career Opportunities
                </label>
                {isEditing && (
                  <button
                    onClick={addCareer}
                    className="text-purple-600 hover:text-purple-700 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Career
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {selectedTrack.careers.map((career, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={career}
                      onChange={(e) => updateCareer(index, e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeCareer(index)}
                        className="text-red-600 hover:text-red-700"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Career Track Profiles</h2>
        <p className="text-gray-600">
          Manage SHS track information, subjects, and career opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 mb-1">{track.name}</h3>
                  <p className="text-gray-700">{track.fullName}</p>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {track.enrolledStudents} students
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {track.description}
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-gray-700 mb-1">Subjects</p>
                  <p className="text-gray-600">
                    {track.subjects.length} specialized subjects
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 mb-1">Career Paths</p>
                  <p className="text-gray-600">
                    {track.careers.length} career opportunities
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrack(track)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View & Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Track Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Track Enrollment Statistics</h3>
        <div className="space-y-4">
          {tracks.map((track) => {
            const totalStudents = tracks.reduce(
              (sum, t) => sum + t.enrolledStudents,
              0
            );
            const percentage = Math.round(
              (track.enrolledStudents / totalStudents) * 100
            );
            return (
              <div key={track.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{track.name}</span>
                  <span className="text-gray-900">
                    {track.enrolledStudents} students ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-700">
            Total Enrolled:{" "}
            <span className="text-gray-900">
              {tracks.reduce((sum, t) => sum + t.enrolledStudents, 0)} students
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
