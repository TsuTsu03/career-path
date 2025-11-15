import { useState } from "react";

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
}

export default function AdminStudentManagement() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      studentId: "STU2024001",
      name: "John Doe",
      email: "john.doe@example.com",
      grade: "10",
      section: "A",
      track: "STEM",
      gpa: 90.5,
      assessmentCompleted: true,
      enrollmentDate: "2024-06-01"
    },
    {
      id: "2",
      studentId: "STU2024002",
      name: "Maria Santos",
      email: "maria.santos@example.com",
      grade: "10",
      section: "B",
      track: "ABM",
      gpa: 88.3,
      assessmentCompleted: true,
      enrollmentDate: "2024-06-01"
    },
    {
      id: "3",
      studentId: "STU2024003",
      name: "Juan Dela Cruz",
      email: "juan.delacruz@example.com",
      grade: "10",
      section: "A",
      track: "HUMSS",
      gpa: 87.8,
      assessmentCompleted: false,
      enrollmentDate: "2024-06-01"
    },
    {
      id: "4",
      studentId: "STU2024004",
      name: "Ana Reyes",
      email: "ana.reyes@example.com",
      grade: "11",
      section: "C",
      track: "GAS",
      gpa: 89.2,
      assessmentCompleted: true,
      enrollmentDate: "2024-06-01"
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrack, setFilterTrack] = useState("all");

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

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.email && newStudent.studentId) {
      const student: Student = {
        id: Date.now().toString(),
        ...newStudent,
        assessmentCompleted: false
      };
      setStudents([...students, student]);
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
      alert("Student added successfully!");
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(
      students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    setSelectedStudent(null);
    alert("Student record updated successfully!");
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to delete this student record?")) {
      setStudents(students.filter((s) => s.id !== id));
      setSelectedStudent(null);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = filterTrack === "all" || student.track === filterTrack;
    return matchesSearch && matchesTrack;
  });

  if (selectedStudent) {
    return (
      <div className="max-w-4xl mx-auto">
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
                  type="text"
                  value={selectedStudent.studentId}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      studentId: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                <select
                  value={selectedStudent.grade}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      grade: e.target.value
                    })
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
                <select
                  value={selectedStudent.track}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      track: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="STEM">STEM</option>
                  <option value="ABM">ABM</option>
                  <option value="HUMSS">HUMSS</option>
                  <option value="GAS">GAS</option>
                </select>
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
                      gpa: parseFloat(e.target.value)
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
    <div className="max-w-6xl mx-auto">
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

      {/* Add Student Form */}
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

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, student ID, or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-gray-700">Grade</th>
                <th className="px-6 py-3 text-left text-gray-700">Track</th>
                <th className="px-6 py-3 text-left text-gray-700">GPA</th>
                <th className="px-6 py-3 text-left text-gray-700">
                  Assessment
                </th>
                <th className="px-6 py-3 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {student.grade}-{student.section}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {student.track}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{student.gpa}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        student.assessmentCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {student.assessmentCompleted ? "Complete" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </div>
    </div>
  );
}
