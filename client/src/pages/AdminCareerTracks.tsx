import { useEffect, useState } from "react";
import { api, errorMessage } from "../lib/api";
import { useToast } from "../components/feedbackContext";
import Icon from "../components/Icon";

export interface CareerTrack {
  id: string;
  code: "stem" | "abm" | "humss" | "gas";
  name: string;
  fullName: string;
  description: string;
  subjects: string[];
  careers: string[];
  requirements: string;
  isActive: boolean;
  recommendedStudents: number;
}

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

export default function AdminCareerTracks() {
  const toast = useToast();
  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CareerTrack | null>(null);
  const [draft, setDraft] = useState<CareerTrack | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ tracks: CareerTrack[] }>("/tracks")
      .then((data) => setTracks(data.tracks))
      .catch((err) => setError(errorMessage(err, "Failed to load tracks.")))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const out = await api<{ track: CareerTrack }>(`/tracks/${draft.code}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: draft.fullName,
          description: draft.description,
          requirements: draft.requirements,
          subjects: draft.subjects.filter((s) => s.trim()),
          careers: draft.careers.filter((c) => c.trim()),
          isActive: draft.isActive
        })
      });
      setTracks((prev) => prev.map((t) => (t.code === out.track.code ? out.track : t)));
      setSelected(out.track);
      setDraft(null);
      toast("Track updated.");
    } catch (err) {
      toast(errorMessage(err, "Failed to update the track."), "error");
    } finally {
      setSaving(false);
    }
  };

  if (selected) {
    const editing = draft !== null;
    const track = draft ?? selected;

    const updateList = (key: "subjects" | "careers", index: number, value: string) => {
      if (!draft) return;
      const next = [...draft[key]];
      next[index] = value;
      setDraft({ ...draft, [key]: next });
    };

    const listEditor = (key: "subjects" | "careers", label: string) => (
      <div>
        <h3 className="text-gray-900 mb-3">{label}</h3>
        {editing ? (
          <div className="space-y-2">
            {track[key].map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <label className="sr-only" htmlFor={`${key}-${idx}`}>
                  {label} {idx + 1}
                </label>
                <input
                  id={`${key}-${idx}`}
                  value={item}
                  onChange={(e) => updateList(key, idx, e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    draft && setDraft({ ...draft, [key]: draft[key].filter((_, i) => i !== idx) })
                  }
                  className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label={`Remove ${item || "item"}`}
                >
                  <Icon name="close" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => draft && setDraft({ ...draft, [key]: [...draft[key], ""] })}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              + Add {key === "subjects" ? "subject" : "career"}
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {track[key].map((item) => (
              <li key={item} className="flex items-center gap-2 text-gray-700">
                <Icon name="check" className="w-4 h-4 text-purple-600" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    );

    return (
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setDraft(null);
          }}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          <Icon name="back" className="w-5 h-5 mr-2" />
          Back to Career Tracks
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-gray-900">{track.name}</h2>
              {editing ? (
                <>
                  <label htmlFor="track-full-name" className="sr-only">Full name</label>
                  <input
                    id="track-full-name"
                    value={track.fullName}
                    onChange={(e) => setDraft({ ...track, fullName: e.target.value })}
                    className={`${inputClass} mt-2`}
                  />
                </>
              ) : (
                <p className="text-gray-600">{track.fullName}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {track.recommendedStudents} {track.recommendedStudents === 1 ? "student has" : "students have"} this as their top recommendation
              </p>
            </div>
            {editing ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDraft({ ...selected, subjects: [...selected.subjects], careers: [...selected.careers] })}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Edit Track
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-gray-900 mb-2">Description</h3>
              {editing ? (
                <>
                  <label htmlFor="track-description" className="sr-only">Description</label>
                  <textarea
                    id="track-description"
                    rows={4}
                    value={track.description}
                    onChange={(e) => setDraft({ ...track, description: e.target.value })}
                    className={inputClass}
                  />
                </>
              ) : (
                <p className="text-gray-700">{track.description}</p>
              )}
            </div>

            <div>
              <h3 className="text-gray-900 mb-2">Requirements</h3>
              {editing ? (
                <>
                  <label htmlFor="track-requirements" className="sr-only">Requirements</label>
                  <input
                    id="track-requirements"
                    value={track.requirements}
                    onChange={(e) => setDraft({ ...track, requirements: e.target.value })}
                    className={inputClass}
                  />
                </>
              ) : (
                <p className="text-gray-700">{track.requirements}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listEditor("subjects", "Core Subjects")}
              {listEditor("careers", "Career Opportunities")}
            </div>

            {editing && (
              <label className="flex items-center gap-3 text-gray-700">
                <input
                  type="checkbox"
                  checked={track.isActive}
                  onChange={(e) => setDraft({ ...track, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                Offered this school year
              </label>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Career Tracks Management</h2>
        <p className="text-gray-600">
          Manage SHS strand information shown to students
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading tracks…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <button
              key={track.code}
              type="button"
              onClick={() => setSelected(track)}
              className="text-left bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-gray-900">{track.name}</h3>
                  <p className="text-gray-600">{track.fullName}</p>
                </div>
                {!track.isActive && (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    Not offered
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-4 line-clamp-2">{track.description}</p>
              <div className="flex items-center justify-between text-gray-600">
                <span>
                  {track.recommendedStudents} top {track.recommendedStudents === 1 ? "match" : "matches"}
                </span>
                <Icon name="chevron" className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
