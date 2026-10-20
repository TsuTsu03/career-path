// client/src/components/Assessment.tsx
import { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError, errorMessage } from "../lib/api";
import { getSessionUser, getToken } from "../lib/session";
type TrackKey = "stem" | "abm" | "humss" | "gas";

type AptitudeDomain =
  | "verbal"
  | "numerical"
  | "scientific"
  | "abstract"
  | "clerical"
  | "entrepreneurial";

interface AssessmentOption {
  id: string;
  label: string;
}

// Questions come from the server without the correct answer.
interface AssessmentQuestion {
  id: number;
  domain: AptitudeDomain;
  stem: string;
  options: AssessmentOption[];
}

interface QuestionSetResponse {
  questions: AssessmentQuestion[];
  assessmentToken: string;
}

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

type DomainScores = Record<AptitudeDomain, number>;

export interface AssessmentResult {
  primaryTrack: TrackScore;
  secondaryTrack: TrackScore;
  allScores: TrackScores;
  domainScores: DomainScores;
  decisionPath: string[];
  assessmentId?: string;
}

interface AssessmentProps {
  onComplete?: (results: AssessmentResult) => void;
}

interface BackendResult {
  primaryTrack: TrackScore;
  secondaryTrack: TrackScore;
  allScores: TrackScores;
  domainScores: DomainScores;
  decisionPath: string[];
  assessmentId?: string;
}

// Answers in progress survive a refresh. Keyed by user so a shared computer
// never shows one student another's draft.
interface AssessmentDraft {
  questions: AssessmentQuestion[];
  assessmentToken: string;
  answers: Record<number, AssessmentOption | undefined>;
  currentQuestion: number;
}

function draftKey(): string {
  return `assessmentDraft:${getSessionUser()?.id ?? "anon"}`;
}

function loadDraft(): AssessmentDraft | null {
  try {
    const raw = localStorage.getItem(draftKey());
    return raw ? (JSON.parse(raw) as AssessmentDraft) : null;
  } catch {
    return null;
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(draftKey());
  } catch {
    // ignore
  }
}

export default function Assessment({
  onComplete
}: AssessmentProps): JSX.Element {
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, AssessmentOption | undefined>
  >({});
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentToken, setAssessmentToken] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<AssessmentDraft | null>(() => loadDraft());

  const [existingResult, setExistingResult] = useState<AssessmentResult | null>(
    null
  );
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check if the student already has an assessment result
  useEffect(() => {
    const checkExistingResult = async (): Promise<void> => {
      if (!getToken()) {
        setCheckingExisting(false);
        return;
      }

      try {
        const body = await api<BackendResult>("/assessments/aptitude/latest");
        setExistingResult(body);
        clearDraft();
        setDraft(null);
      } catch (err) {
        // 404 means no result yet; any other error: let them start anyway.
        if (!(err instanceof ApiError && err.status === 404)) {
          console.error("Error checking existing assessment:", err);
        }
      } finally {
        setCheckingExisting(false);
      }
    };

    void checkExistingResult();
  }, []);

  // Save progress after every answer or page change.
  useEffect(() => {
    if (!started || !assessmentToken || questions.length === 0) return;
    try {
      localStorage.setItem(
        draftKey(),
        JSON.stringify({ questions, assessmentToken, answers, currentQuestion })
      );
    } catch {
      // storage full or blocked: the assessment still works, just no resume
    }
  }, [started, assessmentToken, questions, answers, currentQuestion]);

  // Warn before closing the tab in the middle of the assessment.
  useEffect(() => {
    if (!started || submitting) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [started, submitting]);

  const handleAnswer = (questionId: number, option: AssessmentOption): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const resumeDraft = (): void => {
    if (!draft) return;
    setQuestions(draft.questions);
    setAssessmentToken(draft.assessmentToken);
    setAnswers(draft.answers);
    setCurrentQuestion(
      Math.min(draft.currentQuestion, draft.questions.length - 1)
    );
    setStarted(true);
  };

  const startAssessment = async (): Promise<void> => {
    setLoadingQuestions(true);
    setError(null);

    if (!getToken()) {
      setError(
        "No token found. Please log in again before taking the assessment."
      );
      setLoadingQuestions(false);
      return;
    }

    try {
      const body = await api<QuestionSetResponse>(
        "/assessments/aptitude/questions"
      );
      clearDraft();
      setDraft(null);
      setQuestions(body.questions);
      setAssessmentToken(body.assessmentToken);
      setAnswers({});
      setCurrentQuestion(0);
      setStarted(true);
    } catch (err) {
      setError(
        errorMessage(err, "Unexpected error while loading the assessment.")
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitToBackend = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);

    const payload = {
      assessmentToken,
      answers: questions.map((q) => {
        const selected = answers[q.id];
        return {
          questionId: q.id,
          selectedOptionId: selected ? selected.id : ""
        };
      })
    };

    try {
      const body = await api<BackendResult>("/assessments/aptitude", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      clearDraft();
      if (onComplete) {
        onComplete(body);
      }

      navigate("/student/assessment/result", {
        state: body
      });
    } catch (err) {
      const message = errorMessage(
        err,
        "Unexpected error while submitting assessment."
      );
      // The signed question set expired (4 hours): start a fresh one.
      if (err instanceof ApiError && err.status === 400) {
        clearDraft();
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = (): void => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      void submitToBackend();
    }
  };

  const handlePrevious = (): void => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Scores are already 0-100 (the decision tree's confidence per strand).
  const getPercentage = (_result: AssessmentResult, score: number): number =>
    Math.round(score);

  /* ---------- Pre-assessment screen ---------- */

  if (!started) {
    // While checking if meron nang result
    if (checkingExisting) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-700">
              Checking your previous assessment results…
            </p>
          </div>
        </div>
      );
    }

    // If may existing result, show summary + confirm to retake
    if (existingResult) {
      const primary = existingResult.primaryTrack;
      const secondary = existingResult.secondaryTrack;

      const primaryPercent = getPercentage(existingResult, primary.score);
      const secondaryPercent = getPercentage(existingResult, secondary.score);

      return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-gray-900 mb-2">
                You have already taken the Career Track Aptitude Assessment
              </h2>
              <p className="text-gray-600">
                Below is a quick summary of your latest result. To take the
                assessment again, ask your school counselor to reset it.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <h3 className="text-gray-900 mb-2">Latest Assessment Summary</h3>
              <p className="text-gray-700">
                <strong>Primary Track:</strong> {primary.track.toUpperCase()} (
                {primaryPercent}% match)
              </p>
              <p className="text-gray-700">
                <strong>Secondary Track:</strong>{" "}
                {secondary.track.toUpperCase()} ({secondaryPercent}% match)
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Decision Notes:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {existingResult.decisionPath.slice(0, 3).map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-end">
              <button
                onClick={() => navigate("/student/tracks")}
                className="w-full md:w-auto px-5 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                View Full Recommendations
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No existing result – original “Start Assessment” screen
    return (
      <div className="max-w-3xl mx-auto">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h2 className="text-gray-900 mb-4">
              Career Track Aptitude Assessment
            </h2>
            <p className="text-gray-600 mb-6">
              This aptitude-based assessment (similar to NCAE) will help
              determine the best SHS track for you based on your abilities in
              different domains.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-gray-900 mb-4">Assessment Details</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-5 h-5 text-blue-600 mr-2 mt-0.5">✔</span>
                <span>Multiple aptitude domains (verbal, numerical, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="w-5 h-5 text-blue-600 mr-2 mt-0.5">✔</span>
                <span>Each item has one correct answer</span>
              </li>
              <li className="flex items-start">
                <span className="w-5 h-5 text-blue-600 mr-2 mt-0.5">✔</span>
                <span>Results are classified using a C4.5 decision tree</span>
              </li>
            </ul>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
          )}

          {draft && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              You have an unfinished assessment (
              {Object.values(draft.answers).filter(Boolean).length} of{" "}
              {draft.questions.length} answered).
              <button
                type="button"
                onClick={resumeDraft}
                className="mt-3 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue where I left off
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => void startAssessment()}
            disabled={loadingQuestions}
            className={`w-full py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              draft
                ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loadingQuestions
              ? "Loading questions..."
              : draft
                ? "Start over with new questions"
                : "Start Assessment"}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Actual assessment (when started) ---------- */

  const question = questions[currentQuestion];
  if (!question) {
    return <></>;
  }
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Progress */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-gray-700">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {question.domain.toUpperCase()}
            </span>
          </div>
          <h3 className="text-gray-900 mb-6">{question.stem}</h3>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                  answers[question.id]?.id === option.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      answers[question.id]?.id === option.id
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {answers[question.id]?.id === option.id && (
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span className="text-gray-900">{option.label}</span>
                </div>
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || submitting}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!answers[question.id] || submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1
              ? submitting
                ? "Submitting..."
                : "View Results"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
