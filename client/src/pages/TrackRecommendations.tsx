export type TrackKey = keyof typeof trackDetails; // "stem" | "abm" | "humss" | "gas"

export interface TrackScore {
  track: TrackKey;
  score: number;
}

export interface AssessmentResults {
  primaryTrack: TrackScore;
  secondaryTrack: TrackScore;
  allScores: Record<TrackKey, number>;
}

interface TrackRecommendationsProps {
  assessmentResults: AssessmentResults | null;
}

const trackDetails = {
  stem: {
    name: "STEM",
    fullName: "Science, Technology, Engineering, and Mathematics",
    description:
      "Perfect for students interested in scientific inquiry, technological innovation, and mathematical problem-solving.",
    color: "blue" as const,
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    careers: [
      "Engineer (Civil, Mechanical, Electrical, etc.)",
      "Computer Scientist / Software Developer",
      "Medical Doctor / Healthcare Professional",
      "Research Scientist",
      "Architect",
      "Data Analyst / Statistician"
    ],
    subjects: [
      "Pre-Calculus",
      "Basic Calculus",
      "General Physics",
      "General Chemistry",
      "General Biology"
    ]
  },
  abm: {
    name: "ABM",
    fullName: "Accountancy, Business, and Management",
    description:
      "Ideal for students with entrepreneurial spirit and interest in business operations, finance, and management.",
    color: "green" as const,
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    careers: [
      "Accountant / Auditor",
      "Business Manager / Entrepreneur",
      "Marketing Professional",
      "Financial Analyst",
      "Human Resource Manager",
      "Business Consultant"
    ],
    subjects: [
      "Fundamentals of Accountancy",
      "Business Mathematics",
      "Applied Economics",
      "Business Finance",
      "Organization and Management"
    ]
  },
  humss: {
    name: "HUMSS",
    fullName: "Humanities and Social Sciences",
    description:
      "Best suited for students passionate about understanding human behavior, society, culture, and communication.",
    color: "purple" as const,
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    careers: [
      "Lawyer / Legal Professional",
      "Psychologist / Counselor",
      "Teacher / Professor",
      "Social Worker",
      "Journalist / Writer",
      "Diplomat / Foreign Service Officer"
    ],
    subjects: [
      "Creative Writing",
      "Introduction to World Religions",
      "Philippine Politics and Governance",
      "Disciplines and Ideas in Social Sciences",
      "Creative Nonfiction"
    ]
  },
  gas: {
    name: "GAS",
    fullName: "General Academic Strand",
    description:
      "A flexible track that allows exploration of various fields before choosing a specific career path in college.",
    color: "orange" as const,
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    careers: [
      "Various College Courses",
      "Interdisciplinary Fields",
      "Liberal Arts Programs",
      "Communication Specialist",
      "Public Relations Officer"
    ],
    subjects: [
      "Humanities Subjects",
      "Social Sciences Subjects",
      "Applied Subjects",
      "Specialized Subjects (Electives)",
      "General Education Subjects"
    ]
  }
} as const;

export default function TrackRecommendations({
  assessmentResults
}: TrackRecommendationsProps) {
  if (!assessmentResults) {
    return (
      <div className="max-w-4xl mx-auto">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-gray-900 mb-2">No Assessment Results Yet</h3>
          <p className="text-gray-600 mb-6">
            Complete the track assessment to receive your personalized SHS track
            recommendations.
          </p>
        </div>
      </div>
    );
  }

  const primaryTrack =
    trackDetails[assessmentResults.primaryTrack.track as TrackKey];
  const secondaryTrack =
    trackDetails[assessmentResults.secondaryTrack.track as TrackKey];

  const getColorClasses = (
    color: "blue" | "green" | "purple" | "orange"
  ): string[] => {
    const colors = {
      blue: "bg-blue-600 text-blue-600 bg-blue-50 border-blue-200",
      green: "bg-green-600 text-green-600 bg-green-50 border-green-200",
      purple: "bg-purple-600 text-purple-600 bg-purple-50 border-purple-200",
      orange: "bg-orange-600 text-orange-600 bg-orange-50 border-orange-200"
    };
    return colors[color].split(" ");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Your SHS Track Recommendations</h2>
        <p className="text-gray-600">
          Based on your assessment results and decision tree analysis
        </p>
      </div>

      {/* Primary Recommendation */}
      <div className="bg-white rounded-lg shadow-md border-2 border-blue-500">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg
                  className="w-8 h-8"
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
              </div>
              <div>
                <p className="text-blue-100">Best Match</p>
                <h3 className="text-white">Primary Recommendation</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Match Score</p>
              <p className="text-white">
                {Math.round((assessmentResults.primaryTrack.score / 15) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-start space-x-6 mb-6">
            <div
              className={`${
                getColorClasses(primaryTrack.color)[0]
              } text-white p-4 rounded-lg`}
            >
              {primaryTrack.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 mb-2">{primaryTrack.name}</h2>
              <p className="text-gray-700 mb-2">{primaryTrack.fullName}</p>
              <p className="text-gray-600">{primaryTrack.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-900 mb-3">Career Opportunities</h3>
              <ul className="space-y-2">
                {primaryTrack.careers.map((career, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
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
                    <span>{career}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 mb-3">Specialized Subjects</h3>
              <ul className="space-y-2">
                {primaryTrack.subjects.map((subject, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>{subject}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Recommendation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-gray-100 p-6 rounded-t-lg border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-600">Alternative Option</p>
                <h3 className="text-gray-900">Secondary Recommendation</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Match Score</p>
              <p className="text-gray-900">
                {Math.round(
                  (assessmentResults.secondaryTrack.score / 15) * 100
                )}
                %
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-start space-x-6">
            <div
              className={`${
                getColorClasses(secondaryTrack.color)[0]
              } text-white p-4 rounded-lg`}
            >
              {secondaryTrack.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 mb-2">{secondaryTrack.name}</h2>
              <p className="text-gray-700 mb-2">{secondaryTrack.fullName}</p>
              <p className="text-gray-600">{secondaryTrack.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Scores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Complete Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(assessmentResults.allScores).map(([track, score]) => {
            const key = track as TrackKey;
            const details = trackDetails[key];
            const percentage = Math.round((score / 15) * 100);
            return (
              <div key={track} className="text-center">
                <div className="mb-2">
                  <div
                    className={`inline-block ${
                      getColorClasses(details.color)[1]
                    } p-3 rounded-lg mb-2`}
                  >
                    {details.icon}
                  </div>
                  <p className="text-gray-900">{details.name}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className={`${
                      getColorClasses(details.color)[0]
                    } h-2 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-gray-600">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Next Steps</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Download Results
          </button>
          <button className="px-4 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Consult Counselor
          </button>
          <button className="px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
