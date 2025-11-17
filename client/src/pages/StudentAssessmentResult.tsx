// client/src/pages/StudentAssessmentResult.tsx
import { useLocation, useNavigate } from "react-router-dom";
import type { AssessmentResult } from "./AssessmentResult";

type LocationState = AssessmentResult | null;

export default function StudentAssessmentResult() {
  const nav = useNavigate();
  const location = useLocation();

  // We treat location.state as the actual AssessmentResult object
  const result = (location.state as LocationState) ?? null;

  const handleRetake = () => {
    nav("/student/assessment", { replace: true });
  };

  // Walang result (page opened directly / state nawala) → show “Start Assessment”
  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-900">
              CARPATH Student Assessment
            </h1>
            <p className="text-sm text-gray-500">
              SHS Track Recommender · Aptitude-based Assessment (Similar to
              NCAE)
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-blue-100 text-blue-600 rounded-full p-4 mb-4">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Career Track Aptitude Assessment
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                This aptitude-based assessment (similar to NCAE) will help
                determine the best SHS track for you based on your abilities in
                different domains.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-gray-900 font-medium mb-4">
                Assessment Details
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start">
                  <span className="w-5 h-5 text-blue-600 mr-2 mt-0.5">✔</span>
                  <span>
                    Multiple aptitude domains (verbal, numerical, etc.)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 text-blue-600 mr-2 mt-0.5">✔</span>
                  <span>Each item has one correct answer</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 text-blue-600 mr-2 mt-0.5">✔</span>
                  <span>Results are processed using a decision-tree logic</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-red-600 mb-4 text-center">
              No assessment result found for this session. Please take the
              assessment first.
            </p>

            <button
              onClick={handleRetake}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Assessment
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =============== With result ===============

  const {
    primaryTrack,
    secondaryTrack,
    allScores,
    domainScores,
    decisionPath
  } = result;

  const trackLabels: Record<string, string> = {
    stem: "STEM (Science, Technology, Engineering, and Mathematics)",
    abm: "ABM (Accountancy, Business, and Management)",
    humss: "HUMSS (Humanities and Social Sciences)",
    gas: "GAS (General Academic Strand)"
  };

  const trackDescriptions: Record<string, string> = {
    stem: "You show strong aptitude in numerical, scientific, and abstract reasoning. You may enjoy problem-solving, experiments, and technology-related tasks.",
    abm: "You have strong potential in business, management, and entrepreneurial domains. You may enjoy organizing, planning, and working with numbers in real-life situations.",
    humss:
      "You demonstrate strengths in verbal, social, and communication-based skills. You may enjoy reading, writing, discussing ideas, and helping people.",
    gas: "You have a balanced profile across multiple domains. GAS allows you to further explore different fields before choosing a specific specialization."
  };

  const trackScoresArray = Object.entries(allScores).map(([track, score]) => ({
    track,
    label: trackLabels[track] ?? track.toUpperCase(),
    score
  }));

  const domainScoresArray = Object.entries(domainScores).map(
    ([domain, score]) => ({
      domain,
      label: domain.charAt(0).toUpperCase() + domain.slice(1),
      score
    })
  );

  const maxTrackScore = Math.max(...trackScoresArray.map((t) => t.score));
  const maxDomainScore = Math.max(...domainScoresArray.map((d) => d.score));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-900">
            CARPATH Student Assessment
          </h1>
          <p className="text-sm text-gray-500">
            SHS Track Recommender · Aptitude-based Assessment (Similar to NCAE)
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Summary card */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Recommended SHS Track
              </h2>
              <p className="text-gray-600 text-sm max-w-2xl">
                Based on your performance across different aptitude domains, the
                system has identified the most suitable Senior High School
                tracks for you.
              </p>
            </div>
            <button
              onClick={handleRetake}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Retake Assessment
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase mb-1">
                Primary Recommendation
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                {trackLabels[primaryTrack.track] ??
                  primaryTrack.track.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Score:{" "}
                <span className="font-semibold">{primaryTrack.score}</span>
              </p>
              <p className="text-sm text-gray-700">
                {trackDescriptions[primaryTrack.track]}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-purple-700 uppercase mb-1">
                Secondary Recommendation
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                {trackLabels[secondaryTrack.track] ??
                  secondaryTrack.track.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Score:{" "}
                <span className="font-semibold">{secondaryTrack.score}</span>
              </p>
              <p className="text-sm text-gray-700">
                This track is also a strong option for you and may be considered
                together with your primary recommendation.
              </p>
            </div>
          </div>
        </section>

        {/* Graphs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Track scores */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Track Scores Overview
            </h3>
            <div className="space-y-4">
              {trackScoresArray.map((t) => {
                const percent =
                  maxTrackScore > 0 ? (t.score / maxTrackScore) * 100 : 0;
                return (
                  <div key={t.track}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">
                        {t.track.toUpperCase()}
                      </span>
                      <span>{t.score}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Domain scores */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Aptitude Domain Scores
            </h3>
            <div className="space-y-4">
              {domainScoresArray.map((d) => {
                const percent =
                  maxDomainScore > 0 ? (d.score / maxDomainScore) * 100 : 0;
                return (
                  <div key={d.domain}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{d.label}</span>
                      <span>{d.score}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-indigo-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Decision path */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            How this recommendation was generated
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Below is a simplified explanation of the decision-tree reasoning
            used to recommend your SHS track:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
            {decisionPath.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
