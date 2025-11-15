import { useState } from "react";

interface Query {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  message: string;
  status: "pending" | "answered";
  date: string;
  response?: string;
  responseDate?: string;
  counselor?: string;
}

export default function AdminQueryManagement() {
  const [queries, setQueries] = useState<Query[]>([
    {
      id: "1",
      studentId: "STU2024001",
      studentName: "John Doe",
      subject: "STEM Track Requirements",
      message:
        "What are the specific grade requirements for the STEM track? I am currently in Grade 9 with an average of 88.",
      status: "answered",
      date: "2024-11-10",
      response:
        "Good day! For the STEM track, we recommend an average of 85 and above, especially in Science and Mathematics subjects. With your current average of 88, you are eligible for the STEM track. However, I also suggest assessing your interests and career goals through our assessment tool.",
      responseDate: "2024-11-11",
      counselor: "Ms. Rodriguez"
    },
    {
      id: "2",
      studentId: "STU2024002",
      studentName: "Maria Santos",
      subject: "Career Options in ABM",
      message:
        "Can you provide more information about career opportunities after taking the ABM strand?",
      status: "pending",
      date: "2024-11-12"
    },
    {
      id: "3",
      studentId: "STU2024003",
      studentName: "Juan Dela Cruz",
      subject: "Track Change Request",
      message:
        "I initially chose HUMSS but after taking the assessment, it recommended STEM. Can I still change my track preference?",
      status: "pending",
      date: "2024-11-13"
    },
    {
      id: "4",
      studentId: "STU2024004",
      studentName: "Ana Reyes",
      subject: "GAS Track Information",
      message:
        "What are the advantages of taking the GAS track compared to other specialized tracks?",
      status: "pending",
      date: "2024-11-13"
    }
  ]);

  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [response, setResponse] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "answered"
  >("all");

  const handleSubmitResponse = () => {
    if (selectedQuery && response.trim()) {
      const updatedQuery: Query = {
        ...selectedQuery,
        status: "answered",
        response: response,
        responseDate: new Date().toISOString().split("T")[0],
        counselor: "Admin User"
      };

      setQueries(
        queries.map((q) => (q.id === selectedQuery.id ? updatedQuery : q))
      );
      setSelectedQuery(null);
      setResponse("");
      alert("Response sent successfully!");
    }
  };

  const filteredQueries =
    filterStatus === "all"
      ? queries
      : queries.filter((q) => q.status === filterStatus);

  const pendingCount = queries.filter((q) => q.status === "pending").length;

  if (selectedQuery) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => {
            setSelectedQuery(null);
            setResponse("");
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
          Back to Queries
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900">{selectedQuery.subject}</h2>
              <span
                className={`px-3 py-1 rounded-full ${
                  selectedQuery.status === "answered"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {selectedQuery.status === "answered" ? "Answered" : "Pending"}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <span>
                From: {selectedQuery.studentName} ({selectedQuery.studentId})
              </span>
              <span>•</span>
              <span>{new Date(selectedQuery.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Student Query */}
            <div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6"
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
                <div className="flex-1">
                  <p className="text-gray-700 mb-1">Student Query</p>
                  <p className="text-gray-600">{selectedQuery.message}</p>
                </div>
              </div>
            </div>

            {/* Existing Response */}
            {selectedQuery.response && (
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-900">{selectedQuery.counselor}</p>
                      <p className="text-gray-600">
                        {new Date(
                          selectedQuery.responseDate!
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-700">{selectedQuery.response}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Response Form */}
            {selectedQuery.status === "pending" && (
              <div>
                <label className="block text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response to the student's query..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleSubmitResponse}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Send Response
                  </button>
                  <button
                    onClick={() => {
                      setSelectedQuery(null);
                      setResponse("");
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">Student Queries Management</h2>
          <p className="text-gray-600">
            View and respond to student questions and concerns
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {pendingCount} pending {pendingCount === 1 ? "query" : "queries"}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-6 py-4 border-b-2 transition-colors ${
              filterStatus === "all"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            All Queries ({queries.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-6 py-4 border-b-2 transition-colors ${
              filterStatus === "pending"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("answered")}
            className={`px-6 py-4 border-b-2 transition-colors ${
              filterStatus === "answered"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Answered ({queries.filter((q) => q.status === "answered").length})
          </button>
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {filteredQueries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block bg-gray-100 text-gray-400 rounded-full p-6 mb-4">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-gray-900 mb-2">No Queries Found</h3>
            <p className="text-gray-600">
              There are no {filterStatus !== "all" && filterStatus} queries at
              this time
            </p>
          </div>
        ) : (
          filteredQueries.map((query) => (
            <div
              key={query.id}
              onClick={() => setSelectedQuery(query)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-gray-900">{query.subject}</h3>
                    <span
                      className={`px-3 py-1 rounded-full ${
                        query.status === "answered"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {query.status === "answered" ? "Answered" : "Pending"}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {query.message}
                  </p>
                  <div className="flex items-center text-gray-500 space-x-4">
                    <span>
                      {query.studentName} ({query.studentId})
                    </span>
                    <span>•</span>
                    <span>{new Date(query.date).toLocaleDateString()}</span>
                    {query.status === "answered" && query.counselor && (
                      <>
                        <span>•</span>
                        <span>Responded by {query.counselor}</span>
                      </>
                    )}
                  </div>
                </div>
                <svg
                  className="w-6 h-6 text-gray-400 flex-shrink-0 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
