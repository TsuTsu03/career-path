// client/src/pages/StudentQueries.tsx

import { useEffect, useState, type JSX } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9007";

function getStoredToken(): string | null {
  const keys = ["access", "token", "accessToken", "authToken"];
  for (const key of keys) {
    const local = localStorage.getItem(key);
    if (local) return local;
    const session = sessionStorage.getItem(key);
    if (session) return session;
  }
  return null;
}

interface StudentQueriesProps {
  userId: string;
}

interface Query {
  id: string;
  subject: string;
  message: string;
  status: "pending" | "answered";
  date: string;
  response?: string;
  responseDate?: string;
  counselor?: string;
  userId: string;
}

/**
 * Expected shape ng backend.
 * I-align mo to sa actual fields ng DB mo later.
 */
interface BackendQuery {
  id: string;
  subject: string;
  message: string;
  status: "pending" | "answered";
  userId: string;

  createdAt?: string;
  answeredAt?: string;
  updatedAt?: string;

  response?: string;
  counselorName?: string;
}

/** Map backend → front-end Query */
function mapBackendQuery(q: BackendQuery): Query {
  return {
    id: q.id,
    subject: q.subject,
    message: q.message,
    status: q.status,
    userId: q.userId,
    date: q.createdAt ?? new Date().toISOString(),
    response: q.response,
    responseDate: q.answeredAt ?? q.updatedAt,
    counselor: q.counselorName
  };
}

export default function StudentQueries({
  userId
}: StudentQueriesProps): JSX.Element {
  const [queries, setQueries] = useState<Query[]>([]);
  const [showNewQuery, setShowNewQuery] = useState(false);
  const [newQuery, setNewQuery] = useState({ subject: "", message: "" });
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ========== GET /api/queries?userId=... ========== */
  useEffect(() => {
    const fetchQueries = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      const token = getStoredToken();
      if (!token) {
        setError("No session found. Please log in again to view your queries.");
        setLoading(false);
        return;
      }

      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        };

        const url = `${API_BASE_URL}/queries?userId=${encodeURIComponent(
          userId
        )}`;

        const res = await fetch(url, { method: "GET", headers });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(
            body.message ??
              `Failed to load queries from server (status ${res.status}).`
          );
        }

        const body = (await res.json()) as {
          success: boolean;
          queries: BackendQuery[];
        };

        if (!body.success) {
          throw new Error(
            "Server returned success = false when loading queries."
          );
        }

        const mapped = body.queries.map(mapBackendQuery);
        setQueries(mapped);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) setError(err.message);
        else setError("Unexpected error while loading queries.");
      } finally {
        setLoading(false);
      }
    };

    void fetchQueries();
  }, [userId]);

  /* ========== POST /api/queries ========== */
  const handleSubmitQuery = async (): Promise<void> => {
    if (!newQuery.subject.trim() || !newQuery.message.trim()) return;

    const token = getStoredToken();
    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };

      const payload = {
        subject: newQuery.subject.trim(),
        message: newQuery.message.trim(),
        userId
      };

      const res = await fetch(`${API_BASE_URL}/queries`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(
          body.message ??
            `Failed to submit query. Server responded with ${res.status}.`
        );
      }

      // Depende sa final implementation mo:
      // Option A: server returns the created query object
      // Option B: server returns just { success, message }
      const body = (await res.json().catch(() => ({}))) as
        | { success: boolean; message: string; query?: BackendQuery }
        | BackendQuery;

      let created: Query | null = null;

      if ("id" in body) {
        // direct BackendQuery
        created = mapBackendQuery(body as BackendQuery);
      } else if ("query" in body && body.query) {
        created = mapBackendQuery(body.query as BackendQuery);
      }

      if (created) {
        setQueries((prev) => [created!, ...prev]);
      } else {
        // optimistic add kung di mo pa na-return yung created query sa backend
        const optimistic: Query = {
          id: Date.now().toString(),
          subject: payload.subject,
          message: payload.message,
          status: "pending",
          date: new Date().toISOString(),
          userId
        };
        setQueries((prev) => [optimistic, ...prev]);
      }

      setNewQuery({ subject: "", message: "" });
      setShowNewQuery(false);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
      else setError("Unexpected error while submitting query.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ========== Detail view ========== */

  if (selectedQuery) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedQuery(null)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
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
            <p className="text-gray-600">
              Submitted on {new Date(selectedQuery.date).toLocaleDateString()}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Original Query */}
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
                  <p className="text-gray-700">You</p>
                  <p className="text-gray-600 mt-2">{selectedQuery.message}</p>
                </div>
              </div>
            </div>

            {/* Response */}
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
                      <p className="text-gray-900">
                        {selectedQuery.counselor ?? "Counselor"}
                      </p>
                      <p className="text-gray-600">
                        {selectedQuery.responseDate
                          ? new Date(
                              selectedQuery.responseDate
                            ).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <p className="text-gray-700">{selectedQuery.response}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedQuery.status === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center text-yellow-800">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Waiting for counselor response...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ========== List view ========== */

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">My Queries</h2>
          <p className="text-gray-600">
            Ask questions and get guidance from counselors
          </p>
        </div>
        <button
          onClick={() => setShowNewQuery(!showNewQuery)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
          New Query
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* New Query Form */}
      {showNewQuery && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-gray-900 mb-4">Submit a New Query</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={newQuery.subject}
                onChange={(e) =>
                  setNewQuery({ ...newQuery, subject: e.target.value })
                }
                placeholder="What is your query about?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea
                value={newQuery.message}
                onChange={(e) =>
                  setNewQuery({ ...newQuery, message: e.target.value })
                }
                placeholder="Describe your question or concern in detail..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitQuery}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Query"}
              </button>
              <button
                onClick={() => {
                  setShowNewQuery(false);
                  setNewQuery({ subject: "", message: "" });
                }}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-700">Loading your queries…</p>
          </div>
        ) : queries.length === 0 ? (
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
            <h3 className="text-gray-900 mb-2">No Queries Yet</h3>
            <p className="text-gray-600">
              Submit your first query to get guidance from counselors
            </p>
          </div>
        ) : (
          queries.map((query) => (
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
                  <p className="text-gray-500">
                    Submitted on {new Date(query.date).toLocaleDateString()}
                  </p>
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
