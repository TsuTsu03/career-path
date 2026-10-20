import { useEffect, useState } from "react";
import { api, errorMessage } from "../lib/api";
import { useToast } from "../components/feedbackContext";
import Icon from "../components/Icon";
import { ADMIN_STATS_CHANGED_EVENT } from "../lib/routes";

interface Query {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  message: string;
  status: "pending" | "answered";
  date: string;
  response?: string;
  responseDate?: string;
  counselor?: string;
}

type Filter = "all" | "pending" | "answered";

export default function AdminQueryManagement() {
  const toast = useToast();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [response, setResponse] = useState("");
  const [sending, setSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api<{ queries: Query[] }>("/queries")
      .then((data) => setQueries(data.queries))
      .catch((err) => setError(errorMessage(err, "Failed to load queries.")))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitResponse = async () => {
    if (!selectedQuery || !response.trim()) return;
    setSending(true);
    try {
      const out = await api<{ query: Query; emailSent?: boolean }>(
        `/queries/${selectedQuery.id}/reply`,
        {
          method: "PATCH",
          body: JSON.stringify({ response: response.trim() })
        }
      );
      setQueries((prev) =>
        prev.map((q) => (q.id === out.query.id ? out.query : q))
      );
      setSelectedQuery(null);
      setResponse("");
      toast(
        out.emailSent
          ? "Response sent. The student was notified by email."
          : "Response saved. The email notice could not be sent, but the student will see it in My Queries.",
        out.emailSent ? "success" : "info"
      );
      window.dispatchEvent(new Event(ADMIN_STATS_CHANGED_EVENT));
    } catch (err) {
      toast(errorMessage(err, "Failed to send the response."), "error");
    } finally {
      setSending(false);
    }
  };

  const term = search.trim().toLowerCase();
  const filteredQueries = queries.filter(
    (q) =>
      (filterStatus === "all" || q.status === filterStatus) &&
      (!term ||
        q.subject.toLowerCase().includes(term) ||
        q.studentName.toLowerCase().includes(term) ||
        q.studentId.toLowerCase().includes(term))
  );

  const pendingCount = queries.filter((q) => q.status === "pending").length;
  const answeredCount = queries.length - pendingCount;

  if (selectedQuery) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => {
            setSelectedQuery(null);
            setResponse("");
          }}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          <Icon name="back" className="w-5 h-5 mr-2" />
          Back to Queries
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-gray-900">{selectedQuery.subject}</h2>
              <StatusPill status={selectedQuery.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600">
              <span>
                From: {selectedQuery.studentName}
                {selectedQuery.studentId && ` (${selectedQuery.studentId})`}
              </span>
              <span aria-hidden="true">•</span>
              <span>{new Date(selectedQuery.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Icon name="user" className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 mb-1">Student Query</p>
                <p className="text-gray-600 whitespace-pre-line break-words">
                  {selectedQuery.message}
                </p>
              </div>
            </div>

            {selectedQuery.response && (
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <p className="text-gray-900">
                    {selectedQuery.counselor ?? "Counselor"}
                  </p>
                  {selectedQuery.responseDate && (
                    <p className="text-gray-600">
                      {new Date(selectedQuery.responseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-line break-words">
                  {selectedQuery.response}
                </p>
              </div>
            )}

            {selectedQuery.status === "pending" && (
              <div>
                <label
                  htmlFor="query-response"
                  className="block text-gray-700 mb-2"
                >
                  Your Response
                </label>
                <textarea
                  id="query-response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response to the student's query..."
                  rows={6}
                  maxLength={5000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitResponse}
                    disabled={sending || !response.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Response"}
                  </button>
                  <button
                    type="button"
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

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: `All Queries (${queries.length})` },
    { key: "pending", label: `Pending (${pendingCount})` },
    { key: "answered", label: `Answered (${answeredCount})` }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">Student Queries Management</h2>
          <p className="text-gray-600">
            View and respond to student questions and concerns
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
            {pendingCount} pending {pendingCount === 1 ? "query" : "queries"}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filterStatus === tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 sm:px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
                filterStatus === tab.key
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-3 lg:p-2 lg:pr-4">
          <label htmlFor="query-search" className="sr-only">
            Search queries
          </label>
          <input
            id="query-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject or student"
            className="w-full lg:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-600">Loading queries…</p>
        ) : filteredQueries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block bg-gray-100 text-gray-400 rounded-full p-6 mb-4">
              <Icon name="chat" className="w-16 h-16" />
            </div>
            <h3 className="text-gray-900 mb-2">No Queries Found</h3>
            <p className="text-gray-600">
              There are no {filterStatus !== "all" && filterStatus} queries
              {term ? " matching your search" : " at this time"}.
            </p>
          </div>
        ) : (
          filteredQueries.map((query) => (
            <button
              key={query.id}
              type="button"
              onClick={() => setSelectedQuery(query)}
              className="w-full text-left bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-gray-900">{query.subject}</h3>
                    <StatusPill status={query.status} />
                  </div>
                  <p className="text-gray-600 mb-2 line-clamp-2 break-words">
                    {query.message}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500">
                    <span>
                      {query.studentName}
                      {query.studentId && ` (${query.studentId})`}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>{new Date(query.date).toLocaleDateString()}</span>
                    {query.status === "answered" && query.counselor && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>Responded by {query.counselor}</span>
                      </>
                    )}
                  </div>
                </div>
                <Icon
                  name="chevron"
                  className="w-6 h-6 text-gray-400 shrink-0"
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Query["status"] }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm ${
        status === "answered"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status === "answered" ? "Answered" : "Pending"}
    </span>
  );
}
