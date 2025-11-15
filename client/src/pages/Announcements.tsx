import { useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "event" | "deadline" | "general" | "career";
  date: string;
  author: string;
  important: boolean;
}

export default function Announcements() {
  const [announcements] = useState<Announcement[]>([
    {
      id: "1",
      title: "Career Fair 2024: Explore Your Future",
      content:
        "Join us for the Annual Career Fair on November 20, 2024, from 9:00 AM to 4:00 PM at the School Gymnasium. Meet representatives from top universities and industries to learn about different career paths and educational opportunities. All SHS students are encouraged to attend!",
      category: "event",
      date: "2024-11-13",
      author: "Guidance Office",
      important: true
    },
    {
      id: "2",
      title: "SHS Track Selection Deadline Extended",
      content:
        "The deadline for SHS track selection has been extended to November 30, 2024. Students who have not yet completed their career assessment or submitted their track preference forms should do so before the deadline. Visit the Guidance Office for assistance.",
      category: "deadline",
      date: "2024-11-12",
      author: "Academic Affairs",
      important: true
    },
    {
      id: "3",
      title: "Workshop: Introduction to STEM Careers",
      content:
        "A special workshop on STEM (Science, Technology, Engineering, and Mathematics) careers will be held on November 18, 2024, at 2:00 PM in Room 301. Guest speakers from various STEM fields will share their experiences and career insights. Open to all interested students.",
      category: "event",
      date: "2024-11-11",
      author: "STEM Department",
      important: false
    },
    {
      id: "4",
      title: "New Career Resources Available in Library",
      content:
        "The school library has added new career exploration books, college guides, and industry magazines to help students make informed decisions about their future. Resources are available for all SHS tracks including STEM, ABM, HUMSS, and GAS.",
      category: "general",
      date: "2024-11-10",
      author: "Library Services",
      important: false
    },
    {
      id: "5",
      title: "Online Seminar: Entrepreneurship in the Digital Age",
      content:
        "ABM students and aspiring entrepreneurs are invited to an online seminar on November 22, 2024, at 3:00 PM. Learn about starting a business, digital marketing, and financial management from successful young entrepreneurs. Registration link will be sent via email.",
      category: "career",
      date: "2024-11-09",
      author: "ABM Department",
      important: false
    }
  ]);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [filter, setFilter] = useState<
    "all" | "event" | "deadline" | "general" | "career"
  >("all");

  const getCategoryColor = (category: string) => {
    const colors = {
      event: "bg-blue-100 text-blue-700",
      deadline: "bg-red-100 text-red-700",
      general: "bg-gray-100 text-gray-700",
      career: "bg-purple-100 text-purple-700"
    };
    return colors[category as keyof typeof colors];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "event":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "deadline":
        return (
          <svg
            className="w-5 h-5"
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
        );
      case "career":
        return (
          <svg
            className="w-5 h-5"
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
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const filteredAnnouncements =
    filter === "all"
      ? announcements
      : announcements.filter((a) => a.category === filter);

  if (selectedAnnouncement) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedAnnouncement(null)}
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
          Back to Announcements
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            {selectedAnnouncement.important && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-yellow-800">Important Announcement</span>
              </div>
            )}

            <div className="flex items-center space-x-3 mb-4">
              <span
                className={`px-3 py-1 rounded-full flex items-center ${getCategoryColor(
                  selectedAnnouncement.category
                )}`}
              >
                {getCategoryIcon(selectedAnnouncement.category)}
                <span className="ml-2 capitalize">
                  {selectedAnnouncement.category}
                </span>
              </span>
            </div>

            <h2 className="text-gray-900 mb-4">{selectedAnnouncement.title}</h2>

            <div className="flex items-center text-gray-600 mb-6 space-x-4">
              <div className="flex items-center">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{selectedAnnouncement.author}</span>
              </div>
              <div className="flex items-center">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {new Date(selectedAnnouncement.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Announcements & Events</h2>
        <p className="text-gray-600">
          Stay updated with career-related news and events
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
              filter === "all"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            All Announcements
          </button>
          <button
            onClick={() => setFilter("event")}
            className={`px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
              filter === "event"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setFilter("deadline")}
            className={`px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
              filter === "deadline"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Deadlines
          </button>
          <button
            onClick={() => setFilter("career")}
            className={`px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
              filter === "career"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Career News
          </button>
          <button
            onClick={() => setFilter("general")}
            className={`px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
              filter === "general"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            General
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            onClick={() => setSelectedAnnouncement(announcement)}
            className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer ${
              announcement.important
                ? "border-yellow-300 border-2"
                : "border-gray-200"
            }`}
          >
            {announcement.important && (
              <div className="flex items-center text-yellow-700 mb-3">
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <span>Important</span>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full flex items-center ${getCategoryColor(
                      announcement.category
                    )}`}
                  >
                    {getCategoryIcon(announcement.category)}
                    <span className="ml-2 capitalize">
                      {announcement.category}
                    </span>
                  </span>
                </div>
                <h3 className="text-gray-900 mb-2">{announcement.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {announcement.content}
                </p>
                <div className="flex items-center text-gray-500 space-x-4">
                  <span>{announcement.author}</span>
                  <span>•</span>
                  <span>
                    {new Date(announcement.date).toLocaleDateString()}
                  </span>
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
        ))}
      </div>
    </div>
  );
}
