// client/src/components/AssessmentResult.tsx

import type { JSX } from "react";

type TrackKey = "stem" | "abm" | "humss" | "gas";

type AptitudeDomain =
  | "verbal"
  | "numerical"
  | "scientific"
  | "abstract"
  | "clerical"
  | "entrepreneurial";

interface TrackScore {
  track: TrackKey;
  score: number;
}

interface TrackScores {
  stem: number;
  abm: number;
  humss: number;
  gas: number;
}

interface DomainScores {
  verbal: number;
  numerical: number;
  scientific: number;
  abstract: number;
  clerical: number;
  entrepreneurial: number;
}

export interface AssessmentResult {
  primaryTrack: TrackScore;
  secondaryTrack: TrackScore;
  allScores: TrackScores;
  domainScores: DomainScores;
  decisionPath: string[];
  assessmentId?: string;
}

interface AssessmentResultProps {
  result: AssessmentResult;
  onRetake?: () => void;
}

const trackLabels: Record<TrackKey, string> = {
  stem: "STEM (Science, Technology, Engineering, and Mathematics)",
  abm: "ABM (Accountancy, Business, and Management)",
  humss: "HUMSS (Humanities and Social Sciences)",
  gas: "GAS (General Academic Strand)"
};

const trackDescriptions: Record<TrackKey, string> = {
  stem: "Recommended for students with strong aptitude in mathematics, science, and analytical/problem-solving skills. Ideal for engineering, IT, health sciences, and technical careers.",
  abm: "Recommended for students inclined towards numbers, business concepts, and entrepreneurial thinking. Ideal for careers in business, finance, management, and marketing.",
  humss:
    "Recommended for students strong in verbal reasoning, communication, social awareness, and critical thinking about people and society. Ideal for education, law, social sciences, and the arts.",
  gas: "Recommended for students with balanced abilities across domains or those still exploring their specific specialization. Provides flexibility in preparing for diverse college courses."
};

const domainLabels: Record<AptitudeDomain, string> = {
  verbal: "Verbal",
  numerical: "Numerical",
  scientific: "Scientific",
  abstract: "Abstract Reasoning",
  clerical: "Clerical & Detail",
  entrepreneurial: "Entrepreneurial"
};

function getMaxDomainScore(domainScores: DomainScores): number {
  return Math.max(
    domainScores.verbal,
    domainScores.numerical,
    domainScores.scientific,
    domainScores.abstract,
    domainScores.clerical,
    domainScores.entrepreneurial
  );
}

function getMaxTrackScore(trackScores: TrackScores): number {
  return Math.max(
    trackScores.stem,
    trackScores.abm,
    trackScores.humss,
    trackScores.gas
  );
}

export default function AssessmentResultView({
  result,
  onRetake
}: AssessmentResultProps): JSX.Element {
  const {
    primaryTrack,
    secondaryTrack,
    allScores,
    domainScores,
    decisionPath
  } = result;

  const maxDomainScore = getMaxDomainScore(domainScores) || 1;
  const maxTrackScore = getMaxTrackScore(allScores) || 1;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header + primary recommendation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-gray-900 mb-2">Aptitude Assessment Results</h2>
            <p className="text-gray-600">
              Based on your performance across different aptitude domains,
              CAREER PATH generated a recommended SHS track using a
              decision-tree logic.
            </p>
            {result.assessmentId && (
              <p className="text-sm text-gray-500 mt-2">
                Assessment ID:{" "}
                <span className="font-mono">{result.assessmentId}</span>
              </p>
            )}
          </div>
          {onRetake && (
            <button
              onClick={onRetake}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              Retake Assessment
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Primary Track */}
          <div className="border border-blue-100 bg-blue-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-700 mb-1">
              Primary Recommendation
            </h3>
            <p className="font-semibold text-blue-900 mb-1">
              {trackLabels[primaryTrack.track]}
            </p>
            <p className="text-sm text-blue-900 mb-2">
              Score: <span className="font-semibold">{primaryTrack.score}</span>{" "}
              (relative to other tracks)
            </p>
            <p className="text-sm text-blue-900">
              {trackDescriptions[primaryTrack.track]}
            </p>
          </div>

          {/* Secondary Track */}
          <div className="border border-purple-100 bg-purple-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-purple-700 mb-1">
              Secondary Recommendation
            </h3>
            <p className="font-semibold text-purple-900 mb-1">
              {trackLabels[secondaryTrack.track]}
            </p>
            <p className="text-sm text-purple-900 mb-2">
              Score:{" "}
              <span className="font-semibold">{secondaryTrack.score}</span>
            </p>
            <p className="text-sm text-purple-900">
              This track also matches several of your aptitude strengths and may
              serve as an alternative or supporting pathway.
            </p>
          </div>
        </div>
      </div>

      {/* Domain Scores Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-gray-900 mb-2">Aptitude Profile by Domain</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Each bar shows how many items you answered correctly in that domain.
          Higher scores indicate stronger aptitude in that area.
        </p>

        <div className="space-y-4">
          {(Object.keys(domainScores) as AptitudeDomain[]).map((domainKey) => {
            const score = domainScores[domainKey];
            const percentage = (score / maxDomainScore) * 100;

            return (
              <div key={domainKey}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-800">
                    {domainLabels[domainKey]}
                  </span>
                  <span className="text-xs text-gray-600">
                    {score} / {maxDomainScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Track Scores Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-gray-900 mb-2">Track Score Comparison</h3>
        <p className="text-gray-600 mb-6 text-sm">
          These scores are computed from your aptitude performance and mapped to
          SHS tracks using rule-based decision logic (decision tree).
        </p>

        <div className="space-y-4">
          {(Object.keys(allScores) as TrackKey[]).map((trackKey) => {
            const score = allScores[trackKey];
            const percentage = (score / maxTrackScore) * 100;
            const isPrimary = trackKey === primaryTrack.track;
            const isSecondary = trackKey === secondaryTrack.track;

            return (
              <div key={trackKey}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-800">
                    {trackLabels[trackKey]}
                  </span>
                  <span className="text-xs text-gray-600">
                    {score} / {maxTrackScore}{" "}
                    {isPrimary && (
                      <span className="ml-1 text-blue-700 font-semibold">
                        (Primary)
                      </span>
                    )}
                    {isSecondary && !isPrimary && (
                      <span className="ml-1 text-purple-700 font-semibold">
                        (Secondary)
                      </span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isPrimary
                        ? "bg-blue-600"
                        : isSecondary
                        ? "bg-purple-600"
                        : "bg-gray-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Path / Explanation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-gray-900 mb-2">Decision Tree Explanation</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Below is a simplified explanation of how the system used your answers
          and domain scores to arrive at the recommended track (decision path).
          This section is very useful for thesis documentation and panel
          presentation.
        </p>

        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
          {decisionPath.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
