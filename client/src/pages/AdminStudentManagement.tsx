import { useEffect, useState } from "react";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL ?? "http://localhost:9007";

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  grade: string;
  section: string;
  track: string;
  gpa: number;
  assessmentCompleted: boolean;
  enrollmentDate: string;
  dateCompleted: string;
}

interface TrackScores {
  stem?: number;
  abm?: number;
  humss?: number;
  gas?: number;
}

interface BackendAssessmentResult {
  createdAt?: string | null;
  trackScores?: TrackScores;
  primaryTrack?: string | null;
  secondaryTrack?: string | null;
  primaryTrackScore?: number | null;
  secondaryTrackScore?: number | null;
}

interface BackendUser {
  _id: string;
  studentId?: string | null;
  fullName?: string | null;
  email?: string | null;
  role: "student" | "admin";
  createdAt?: string | null;
  hasAssessment?: boolean;
  assessmentResult?: BackendAssessmentResult | null;
}

const getTrackScore = (scores: TrackScores | undefined, track: string) => {
  if (!scores || !track) return undefined;

  const normalizedTrack = track.toLowerCase();

  if (normalizedTrack === "stem") return scores.stem;
  if (normalizedTrack === "abm") return scores.abm;
  if (normalizedTrack === "humss") return scores.humss;
  if (normalizedTrack === "gas") return scores.gas;

  return undefined;
};

export default function AdminStudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState({
    studentId: "",
    name: "",
    email: "",
    grade: "10",
    section: "A",
    track: "STEM",
    gpa: 0,
    enrollmentDate: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          localStorage.getItem("access") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        const res = await fetch(`${API_BASE_URL}/students`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data: BackendUser[] = await res.json();

        const mapped: Student[] = data.map((u) => {
          const assessment = u.assessmentResult;
          const scores = assessment?.trackScores;
          const hasAssessment = Boolean(u.hasAssessment && assessment);

          const primaryTrackRaw = assessment?.primaryTrack ?? "";
          const secondaryTrackRaw = assessment?.secondaryTrack ?? "";

          const primaryTrack = primaryTrackRaw.toUpperCase();
          const secondaryTrack = secondaryTrackRaw.toUpperCase();

          const primaryScore =
            assessment?.primaryTrackScore ??
            getTrackScore(scores, primaryTrackRaw);

          const secondaryScore =
            assessment?.secondaryTrackScore ??
            getTrackScore(scores, secondaryTrackRaw);

          const trackDisplay =
            primaryTrack && secondaryTrack
              ? `Primary: ${primaryTrack} / Secondary: ${secondaryTrack}`
              : primaryTrack
                ? `Primary: ${primaryTrack}`
                : secondaryTrack
                  ? `Secondary: ${secondaryTrack}`
                  : "";
          const gradeDisplay =
            primaryTrack && secondaryTrack
              ? `${primaryTrack}: ${primaryScore ?? "-"}\n${secondaryTrack}: ${secondaryScore ?? "-"}`
              : primaryTrack
                ? `${primaryTrack}: ${primaryScore ?? "-"}`
                : secondaryTrack
                  ? `${secondaryTrack}: ${secondaryScore ?? "-"}`
                  : "—";

          return {
            id: u._id,
            studentId: u.studentId ?? "-",
            name: u.fullName ?? "—",
            email: u.email ?? "—",
            grade: hasAssessment ? gradeDisplay : "—",
            section: "",
            track: hasAssessment ? trackDisplay : "",
            gpa: 0,
            assessmentCompleted: hasAssessment,
            enrollmentDate: u.createdAt
              ? u.createdAt.slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            dateCompleted: assessment?.createdAt
              ? assessment.createdAt.slice(0, 10)
              : ""
          };
        });

        setStudents(mapped);
      } catch (err) {
        console.error(err);
        setError("Unable to load students. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.email && newStudent.studentId) {
      const student: Student = {
        id: Date.now().toString(),
        ...newStudent,
        assessmentCompleted: false,
        dateCompleted: ""
      };

      setStudents((prev) => [...prev, student]);
      setNewStudent({
        studentId: "",
        name: "",
        email: "",
        grade: "10",
        section: "A",
        track: "STEM",
        gpa: 0,
        enrollmentDate: new Date().toISOString().split("T")[0]
      });
      setShowAddForm(false);

      alert(
        "Student added locally. (TODO: hook to POST /students kapag ready na backend)"
      );
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    setSelectedStudent(null);

    alert(
      "Student updated locally. (TODO: hook to PUT /students/:id kapag ready na)"
    );
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to delete this student record?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setSelectedStudent(null);

      alert(
        "Student deleted locally. (TODO: hook to DELETE /students/:id kapag ready na)"
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTrack =
      filterTrack === "all" ||
      student.track.toUpperCase().includes(filterTrack.toUpperCase());

    return matchesSearch && matchesTrack;
  });

  if (selectedStudent) {
    return (
      <div className="w-full mx-auto">
        <button
          onClick={() => setSelectedStudent(null)}
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
          Back to Student List
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-blue-700 p-6 rounded-t-lg">
            <h2 className="text-white">Edit Student Record</h2>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Student ID</label>
                <input
                  disabled
                  type="text"
                  value={selectedStudent.studentId}
                  className="w-full px-4 py-2 border rounded-lg outline-none border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={selectedStudent.name}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      name: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={selectedStudent.email}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      email: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Grade Level</label>
                <input
                  type="text"
                  value={selectedStudent.grade}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      grade: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Section</label>
                <input
                  type="text"
                  value={selectedStudent.section}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      section: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">SHS Track</label>
                <input
                  type="text"
                  value={selectedStudent.track}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      track: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">GPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedStudent.gpa}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      gpa: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  value={selectedStudent.enrollmentDate}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      enrollmentDate: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Assessment Date Completed
                </label>
                <input
                  disabled
                  type="text"
                  value={selectedStudent.dateCompleted || "-"}
                  className="w-full px-4 py-2 border rounded-lg outline-none border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => handleUpdateStudent(selectedStudent)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteStudent(selectedStudent.id)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">Student Records Management</h2>
          <p className="text-gray-600">
            Add, update, and manage student profiles
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Student
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-gray-900 mb-4">Add New Student</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Student ID</label>
              <input
                type="text"
                value={newStudent.studentId}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, studentId: e.target.value })
                }
                placeholder="STU2024XXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                placeholder="Enter full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Grade Level</label>
              <select
                value={newStudent.grade}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, grade: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Section</label>
              <input
                type="text"
                value={newStudent.section}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, section: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">SHS Track</label>
              <select
                value={newStudent.track}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, track: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="STEM">STEM</option>
                <option value="ABM">ABM</option>
                <option value="HUMSS">HUMSS</option>
                <option value="GAS">GAS</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleAddStudent}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Student
            </button>

            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, student ID, or email..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="all">All Tracks</option>
              <option value="STEM">STEM</option>
              <option value="ABM">ABM</option>
              <option value="HUMSS">HUMSS</option>
              <option value="GAS">GAS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Student ID
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Grade
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Track
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  GPA
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Assessment
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Date Completed
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading students…
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 align-top">
                    <td className="px-5 py-5 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {student.studentId}
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-900 min-w-[140px]">
                      <div className="whitespace-normal break-words leading-6">
                        {student.name || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600 min-w-[220px]">
                      <div className="whitespace-normal break-all leading-6">
                        {student.email || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-900 min-w-[160px]">
                      {student.grade && student.grade !== "—" ? (
                        <div className="space-y-1 whitespace-pre-line leading-6">
                          {student.grade}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-5 py-5 text-sm min-w-[320px]">
                      {student.track ? (
                        <div className="inline-flex rounded-xl bg-blue-50 px-3 py-2 text-blue-700 border border-blue-100 leading-6 whitespace-normal break-words">
                          {student.track}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-900 whitespace-nowrap">
                      {student.gpa ? student.gpa.toFixed(1) : "-"}
                    </td>

                    <td className="px-5 py-5 text-sm">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm ${
                          student.assessmentCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {student.assessmentCompleted ? "Complete" : "Pending"}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-600 whitespace-nowrap">
                      {student.assessmentCompleted
                        ? student.dateCompleted || "-"
                        : "-"}
                    </td>

                    <td className="px-5 py-5 text-sm whitespace-nowrap">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="font-medium text-purple-600 hover:text-purple-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </div>
    </div>
  );
}
