import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { api, errorMessage } from "../lib/api";
import { useConfirm, useToast } from "../components/feedbackContext";
import Icon from "../components/Icon";
import { ADMIN_STATS_CHANGED_EVENT } from "../lib/routes";

type TrackKey = "stem" | "abm" | "humss" | "gas";

interface StudentRow {
  _id: string;
  studentId: string | null;
  fullName: string | null;
  email: string | null;
  createdAt: string | null;
  isVerified: boolean;
  hasPassword: boolean;
  gradeLevel: string | null;
  section: string | null;
  hasAssessment: boolean;
  assessmentResult: {
    createdAt: string | null;
    primaryTrack: TrackKey | null;
    secondaryTrack: TrackKey | null;
    primaryTrackScore: number | null;
    secondaryTrackScore: number | null;
  } | null;
}

interface StudentDetail {
  id: string;
  fullName: string;
  email: string;
  studentId: string | null;
  createdAt: string | null;
  isVerified: boolean;
  hasPassword: boolean;
  queryCount: number;
  profile: Record<string, string | null> | null;
  assessment: {
    createdAt: string;
    primaryTrack: TrackKey;
    secondaryTrack: TrackKey;
    trackScores: Record<TrackKey, number>;
    domainScores: Record<string, number>;
    decisionPath: string[];
    correctAnswers: number;
    totalQuestions: number;
  } | null;
}

const TRACK_LABEL: Record<TrackKey, string> = {
  stem: "STEM",
  abm: "ABM",
  humss: "HUMSS",
  gas: "GAS"
};

function accountStatus(s: { isVerified: boolean; hasPassword: boolean }) {
  if (!s.hasPassword) return { label: "Invited", style: "bg-gray-100 text-gray-700" };
  if (!s.isVerified)
    return { label: "Unverified", style: "bg-yellow-100 text-yellow-800" };
  return { label: "Active", style: "bg-green-100 text-green-700" };
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  // Quote everything and neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCsv(rows: StudentRow[]) {
  const header = [
    "Student ID",
    "Full Name",
    "Email",
    "Grade Level",
    "Section",
    "Account Status",
    "Registered",
    "Assessment Date",
    "Primary Strand",
    "Primary Score",
    "Secondary Strand",
    "Secondary Score"
  ];
  const lines = rows.map((s) => {
    const r = s.assessmentResult;
    return [
      s.studentId,
      s.fullName,
      s.email,
      s.gradeLevel,
      s.section,
      accountStatus(s).label,
      s.createdAt?.slice(0, 10),
      r?.createdAt?.slice(0, 10),
      r?.primaryTrack ? TRACK_LABEL[r.primaryTrack] : "",
      r?.primaryTrackScore,
      r?.secondaryTrack ? TRACK_LABEL[r.secondaryTrack] : "",
      r?.secondaryTrackScore
    ]
      .map(csvCell)
      .join(",");
  });

  const blob = new Blob(["﻿" + [header.map(csvCell).join(","), ...lines].join("\r\n")], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `career-path-students-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

export default function AdminStudentManagement() {
  const toast = useToast();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrack, setFilterTrack] = useState<"all" | "none" | TrackKey>("all");
  const [filterSection, setFilterSection] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStudents(await api<StudentRow[]>("/students"));
    } catch (err) {
      setError(errorMessage(err, "Unable to load students. Please try again later."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const sections = useMemo(
    () =>
      [...new Set(students.map((s) => s.section).filter((s): s is string => Boolean(s)))].sort(),
    [students]
  );

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (s.fullName ?? "").toLowerCase().includes(term) ||
      (s.studentId ?? "").toLowerCase().includes(term) ||
      (s.email ?? "").toLowerCase().includes(term);
    const primary = s.assessmentResult?.primaryTrack ?? null;
    const matchesTrack =
      filterTrack === "all" ||
      (filterTrack === "none" ? !s.hasAssessment : primary === filterTrack);
    const matchesSection = filterSection === "all" || s.section === filterSection;
    return matchesSearch && matchesTrack && matchesSection;
  });

  if (selectedId) {
    return (
      <StudentDetailView
        id={selectedId}
        onBack={() => setSelectedId(null)}
        onChanged={() => {
          window.dispatchEvent(new Event(ADMIN_STATS_CHANGED_EVENT));
          void loadStudents();
        }}
        onDeleted={() => {
          setSelectedId(null);
          window.dispatchEvent(new Event(ADMIN_STATS_CHANGED_EVENT));
          void loadStudents();
        }}
      />
    );
  }

  const completed = students.filter((s) => s.hasAssessment).length;

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-2">Student Records</h2>
          <p className="text-gray-600">
            {students.length} students · {completed} completed the assessment
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadCsv(filteredStudents)}
            disabled={filteredStudents.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Icon name="download" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Add Student
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddStudentForm
          onCancel={() => setShowAddForm(false)}
          onCreated={(message, emailSent) => {
            setShowAddForm(false);
            toast(message, emailSent ? "success" : "info");
            window.dispatchEvent(new Event(ADMIN_STATS_CHANGED_EVENT));
            void loadStudents();
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div>
          <label htmlFor="student-search" className="sr-only">
            Search students
          </label>
          <input
            id="student-search"
            type="search"
            placeholder="Search by name, student ID, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="track-filter" className="sr-only">
            Filter by recommended strand
          </label>
          <select
            id="track-filter"
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value as typeof filterTrack)}
            className={inputClass}
          >
            <option value="all">All strands</option>
            {(Object.keys(TRACK_LABEL) as TrackKey[]).map((t) => (
              <option key={t} value={t}>
                {TRACK_LABEL[t]} (primary)
              </option>
            ))}
            <option value="none">No assessment yet</option>
          </select>
        </div>
        <div>
          <label htmlFor="section-filter" className="sr-only">
            Filter by section
          </label>
          <select
            id="section-filter"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className={inputClass}
          >
            <option value="all">All sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th scope="col" className="px-4 py-3">Student</th>
              <th scope="col" className="px-4 py-3">Grade / Section</th>
              <th scope="col" className="px-4 py-3">Recommendation</th>
              <th scope="col" className="px-4 py-3">Account</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                  Loading students…
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                  No students match these filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => {
                const r = s.assessmentResult;
                const status = accountStatus(s);
                return (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{s.fullName ?? "—"}</p>
                      <p className="text-sm text-gray-500">
                        {s.studentId ?? "No ID"} · {s.email ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {[s.gradeLevel, s.section].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r?.primaryTrack ? (
                        <>
                          <p>
                            <span className="font-medium">{TRACK_LABEL[r.primaryTrack]}</span>{" "}
                            {r.primaryTrackScore ?? "-"}%
                          </p>
                          {r.secondaryTrack && (
                            <p className="text-sm text-gray-500">
                              Next: {TRACK_LABEL[r.secondaryTrack]} {r.secondaryTrackScore ?? "-"}%
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">Not taken</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.style}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(s._id)}
                        aria-label={`View ${s.fullName ?? "student"}`}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddStudentForm({
  onCancel,
  onCreated
}: {
  onCancel: () => void;
  onCreated: (message: string, emailSent: boolean) => void;
}) {
  const [form, setForm] = useState({ fullName: "", email: "", gradeLevel: "", section: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const out = await api<{ message: string; emailSent: boolean }>(
        "/students",
        { method: "POST", body: JSON.stringify(form) }
      );
      onCreated(out.message, out.emailSent);
    } catch (err) {
      setError(errorMessage(err, "Failed to create the student."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
    >
      <div>
        <h3 className="text-gray-900">Add Student</h3>
        <p className="text-sm text-gray-600">
          The student gets an email with a link to choose their own password.
        </p>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="new-name" className="block text-gray-700 mb-1">Full name</label>
          <input id="new-name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="new-email" className="block text-gray-700 mb-1">Email</label>
          <input id="new-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="new-grade" className="block text-gray-700 mb-1">Grade level (optional)</label>
          <input id="new-grade" placeholder="Grade 10" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="new-section" className="block text-gray-700 mb-1">Section (optional)</label>
          <input id="new-section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className={inputClass} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60">
          {saving ? "Creating..." : "Create account"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

function StudentDetailView({
  id,
  onBack,
  onChanged,
  onDeleted
}: {
  id: string;
  onBack: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", gradeLevel: "", section: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const out = await api<{ student: StudentDetail }>(`/students/${id}`);
      setStudent(out.student);
      setForm({
        fullName: out.student.fullName,
        email: out.student.email,
        gradeLevel: out.student.profile?.gradeLevel ?? "",
        section: out.student.profile?.section ?? ""
      });
    } catch (err) {
      setError(errorMessage(err, "Failed to load the student."));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/students/${id}`, { method: "PATCH", body: JSON.stringify(form) });
      toast("Student updated.");
      setEditing(false);
      await load();
      onChanged();
    } catch (err) {
      toast(errorMessage(err, "Failed to update the student."), "error");
    } finally {
      setBusy(false);
    }
  };

  const resetAssessment = async () => {
    const ok = await confirm(
      "This deletes the student's current result so they can take the assessment again.",
      { title: "Reset assessment?", confirmLabel: "Reset", danger: true }
    );
    if (!ok) return;
    setBusy(true);
    try {
      const out = await api<{ message: string }>(`/students/${id}/assessment`, { method: "DELETE" });
      toast(out.message);
      await load();
      onChanged();
    } catch (err) {
      toast(errorMessage(err, "Failed to reset the assessment."), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirm(
      "This permanently deletes the account, profile, assessment result and queries. It cannot be undone.",
      { title: "Delete student?", confirmLabel: "Delete", danger: true }
    );
    if (!ok) return;
    setBusy(true);
    try {
      await api(`/students/${id}`, { method: "DELETE" });
      toast("Student deleted.");
      onDeleted();
    } catch (err) {
      toast(errorMessage(err, "Failed to delete the student."), "error");
      setBusy(false);
    }
  };

  const status = student ? accountStatus(student) : null;
  const a = student?.assessment;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button type="button" onClick={onBack} className="flex items-center text-purple-600 hover:text-purple-700">
        <Icon name="back" className="w-5 h-5 mr-2" />
        Back to Student Records
      </button>

      {error && <p className="text-red-700">{error}</p>}
      {!student && !error && <p className="text-gray-600">Loading…</p>}

      {student && (
        <>
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-gray-900">{student.fullName}</h2>
                <p className="text-gray-600">
                  {student.studentId ?? "No ID"} · {student.email}
                </p>
              </div>
              {status && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.style}`}>
                  {status.label}
                </span>
              )}
            </div>

            {editing ? (
              <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-name" className="block text-gray-700 mb-1">Full name</label>
                  <input id="edit-name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="edit-email" className="block text-gray-700 mb-1">Email</label>
                  <input id="edit-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="edit-grade" className="block text-gray-700 mb-1">Grade level</label>
                  <input id="edit-grade" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="edit-section" className="block text-gray-700 mb-1">Section</label>
                  <input id="edit-section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className={inputClass} />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <button type="submit" disabled={busy} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60">
                    {busy ? "Saving..." : "Save changes"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <Field label="Grade / Section" value={[student.profile?.gradeLevel, student.profile?.section].filter(Boolean).join(" / ") || "—"} />
                  <Field label="Registered" value={formatDate(student.createdAt)} />
                  <Field label="Queries sent" value={String(student.queryCount)} />
                  <Field label="Contact" value={student.profile?.contactNumber || "—"} />
                  <Field label="Guardian" value={student.profile?.guardianName || "—"} />
                  <Field label="Guardian contact" value={student.profile?.guardianContact || "—"} />
                  <Field label="Interests" value={student.profile?.interests || "—"} />
                  <Field label="Strengths" value={student.profile?.strengths || "—"} />
                </dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setEditing(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Edit details
                  </button>
                  <button type="button" onClick={remove} disabled={busy} className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-60">
                    Delete student
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-gray-900">Assessment Result</h3>
              {a && (
                <button type="button" onClick={resetAssessment} disabled={busy} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60">
                  Reset assessment
                </button>
              )}
            </div>
            {a ? (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Taken {formatDate(a.createdAt)} · {a.correctAnswers} of {a.totalQuestions} correct
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.keys(TRACK_LABEL) as TrackKey[]).map((t) => (
                    <div
                      key={t}
                      className={`rounded-lg border p-3 ${t === a.primaryTrack ? "border-purple-400 bg-purple-50" : "border-gray-200"}`}
                    >
                      <p className="text-sm text-gray-600">
                        {TRACK_LABEL[t]}
                        {t === a.primaryTrack ? " · primary" : t === a.secondaryTrack ? " · secondary" : ""}
                      </p>
                      <p className="text-xl font-semibold text-gray-900">{a.trackScores?.[t] ?? 0}%</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-gray-800 mb-2">Correct answers per domain (out of 15)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                    {Object.entries(a.domainScores ?? {}).map(([domain, score]) => (
                      <p key={domain} className="capitalize">
                        {domain}: <span className="font-medium">{score}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">This student has not taken the assessment yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 break-words">{value}</dd>
    </div>
  );
}
