import { useState } from "react";

interface AssessmentProps {
  onComplete: (results: any) => void;
}

const assessmentQuestions = [
  {
    id: 1,
    category: "Interests",
    question: "Which subject do you enjoy the most?",
    options: [
      {
        value: "science",
        label: "Science and Research",
        weight: { stem: 3, abm: 1, humss: 1, gas: 2 }
      },
      {
        value: "math",
        label: "Mathematics and Logic",
        weight: { stem: 3, abm: 2, humss: 0, gas: 2 }
      },
      {
        value: "arts",
        label: "Arts and Humanities",
        weight: { stem: 0, abm: 1, humss: 3, gas: 2 }
      },
      {
        value: "business",
        label: "Business and Economics",
        weight: { stem: 1, abm: 3, humss: 1, gas: 2 }
      }
    ]
  },
  {
    id: 2,
    category: "Skills",
    question: "What are you naturally good at?",
    options: [
      {
        value: "problem-solving",
        label: "Problem Solving & Analysis",
        weight: { stem: 3, abm: 2, humss: 1, gas: 2 }
      },
      {
        value: "communication",
        label: "Communication & Writing",
        weight: { stem: 1, abm: 2, humss: 3, gas: 2 }
      },
      {
        value: "leadership",
        label: "Leadership & Management",
        weight: { stem: 1, abm: 3, humss: 2, gas: 2 }
      },
      {
        value: "creativity",
        label: "Creativity & Innovation",
        weight: { stem: 2, abm: 1, humss: 3, gas: 2 }
      }
    ]
  },
  {
    id: 3,
    category: "Career Goals",
    question: "What career field interests you most?",
    options: [
      {
        value: "engineering",
        label: "Engineering & Technology",
        weight: { stem: 3, abm: 0, humss: 0, gas: 1 }
      },
      {
        value: "healthcare",
        label: "Healthcare & Medicine",
        weight: { stem: 3, abm: 0, humss: 1, gas: 2 }
      },
      {
        value: "business",
        label: "Business & Entrepreneurship",
        weight: { stem: 1, abm: 3, humss: 0, gas: 2 }
      },
      {
        value: "social",
        label: "Social Sciences & Education",
        weight: { stem: 0, abm: 1, humss: 3, gas: 2 }
      }
    ]
  },
  {
    id: 4,
    category: "Learning Style",
    question: "How do you prefer to learn?",
    options: [
      {
        value: "hands-on",
        label: "Hands-on experiments and labs",
        weight: { stem: 3, abm: 1, humss: 0, gas: 2 }
      },
      {
        value: "discussion",
        label: "Discussions and debates",
        weight: { stem: 0, abm: 2, humss: 3, gas: 2 }
      },
      {
        value: "projects",
        label: "Real-world projects",
        weight: { stem: 2, abm: 3, humss: 1, gas: 2 }
      },
      {
        value: "research",
        label: "Independent research",
        weight: { stem: 2, abm: 2, humss: 2, gas: 3 }
      }
    ]
  },
  {
    id: 5,
    category: "Work Environment",
    question: "What work environment appeals to you?",
    options: [
      {
        value: "lab",
        label: "Laboratory or Technical Setting",
        weight: { stem: 3, abm: 0, humss: 0, gas: 1 }
      },
      {
        value: "office",
        label: "Corporate Office",
        weight: { stem: 1, abm: 3, humss: 1, gas: 2 }
      },
      {
        value: "community",
        label: "Community or Field Work",
        weight: { stem: 0, abm: 1, humss: 3, gas: 2 }
      },
      {
        value: "flexible",
        label: "Flexible/Diverse Settings",
        weight: { stem: 1, abm: 2, humss: 2, gas: 3 }
      }
    ]
  }
];

export default function Assessment({ onComplete }: AssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [started, setStarted] = useState(false);

  const handleAnswer = (questionId: number, option: any) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results using decision tree
      const results = calculateResults(answers);
      onComplete(results);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = (userAnswers: Record<number, any>) => {
    const scores = {
      stem: 0,
      abm: 0,
      humss: 0,
      gas: 0
    };

    // Sum up weights from all answers
    Object.values(userAnswers).forEach((answer: any) => {
      scores.stem += answer.weight.stem;
      scores.abm += answer.weight.abm;
      scores.humss += answer.weight.humss;
      scores.gas += answer.weight.gas;
    });

    // Sort tracks by score
    const sortedTracks = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([track, score]) => ({ track, score }));

    return {
      primaryTrack: sortedTracks[0],
      secondaryTrack: sortedTracks[1],
      allScores: scores,
      answers: userAnswers
    };
  };

  if (!started) {
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
            <h2 className="text-gray-900 mb-4">Career Track Assessment</h2>
            <p className="text-gray-600 mb-6">
              This assessment will help determine the best SHS track for you
              based on your interests, skills, and career goals.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-gray-900 mb-4">Assessment Details</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>5 carefully designed questions</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Takes approximately 5-10 minutes</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Based on decision tree algorithm</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Personalized track recommendations</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const question = assessmentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700">
              Question {currentQuestion + 1} of {assessmentQuestions.length}
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
              {question.category}
            </span>
          </div>
          <h3 className="text-gray-900 mb-6">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                  answers[question.id]?.value === option.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      answers[question.id]?.value === option.value
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {answers[question.id]?.value === option.value && (
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span className="text-gray-900">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!answers[question.id]}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === assessmentQuestions.length - 1
              ? "View Results"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
