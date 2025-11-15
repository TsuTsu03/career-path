import React, { useState } from "react";

type AnnouncementCategory = "event" | "deadline" | "general" | "career";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  date: string;
  author: string;
  important: boolean;
}

interface NewAnnouncementInput {
  title: string;
  content: string;
  category: AnnouncementCategory;
  author: string;
  important: boolean;
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
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
    }
  ]);

  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState<NewAnnouncementInput>({
    title: "",
    content: "",
    category: "general",
    author: "Admin User",
    important: false
  });

  const handleCreateAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      const announcement: Announcement = {
        id: Date.now().toString(),
        ...newAnnouncement,
        date: new Date().toISOString().split("T")[0]
      };
      setAnnouncements((prev) => [announcement, ...prev]);
      setNewAnnouncement({
        title: "",
        content: "",
        category: "general",
        author: "Admin User",
        important: false
      });
      setShowNewForm(false);
      alert("Announcement published successfully!");
    }
  };

  const handleUpdateAnnouncement = () => {
    if (selectedAnnouncement) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === selectedAnnouncement.id ? selectedAnnouncement : a
        )
      );
      setSelectedAnnouncement(null);
      setIsEditing(false);
      alert("Announcement updated successfully!");
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setSelectedAnnouncement(null);
    }
  };

  const getCategoryColor = (category: AnnouncementCategory) => {
    const colors: Record<AnnouncementCategory, string> = {
      event: "bg-blue-100 text-blue-700",
      deadline: "bg-red-100 text-red-700",
      general: "bg-gray-100 text-gray-700",
      career: "bg-purple-100 text-purple-700"
    };
    return colors[category];
  };

  if (selectedAnnouncement) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => {
            setSelectedAnnouncement(null);
            setIsEditing(false);
          }}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
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
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-gray-900">
              {isEditing ? "Edit Announcement" : "Announcement Details"}
            </h2>
            <div className="flex space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Edit
                </button>
              )}
              {isEditing && (
                <button
                  onClick={handleUpdateAnnouncement}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              )}
              <button
                onClick={() =>
                  handleDeleteAnnouncement(selectedAnnouncement.id)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={selectedAnnouncement.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedAnnouncement({
                    ...selectedAnnouncement,
                    title: e.target.value
                  })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Content</label>
              <textarea
                value={selectedAnnouncement.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setSelectedAnnouncement({
                    ...selectedAnnouncement,
                    content: e.target.value
                  })
                }
                disabled={!isEditing}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={selectedAnnouncement.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedAnnouncement({
                      ...selectedAnnouncement,
                      category: e.target.value as AnnouncementCategory
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
                >
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="deadline">Deadline</option>
                  <option value="career">Career</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  value={selectedAnnouncement.author}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSelectedAnnouncement({
                      ...selectedAnnouncement,
                      author: e.target.value
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="important"
                checked={selectedAnnouncement.important}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedAnnouncement({
                    ...selectedAnnouncement,
                    important: e.target.checked
                  })
                }
                disabled={!isEditing}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="important" className="ml-2 text-gray-700">
                Mark as important announcement
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">Announcements & Events</h2>
          <p className="text-gray-600">
            Create and manage announcements for students
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
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
          New Announcement
        </button>
      </div>

      {/* New Announcement Form */}
      {showNewForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-gray-900 mb-4">Create New Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    title: e.target.value
                  })
                }
                placeholder="Enter announcement title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Content</label>
              <textarea
                value={newAnnouncement.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    content: e.target.value
                  })
                }
                placeholder="Write your announcement content here..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={newAnnouncement.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      category: e.target.value as AnnouncementCategory
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="deadline">Deadline</option>
                  <option value="career">Career</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  value={newAnnouncement.author}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      author: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newImportant"
                checked={newAnnouncement.important}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    important: e.target.checked
                  })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="newImportant" className="ml-2 text-gray-700">
                Mark as important announcement
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateAnnouncement}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Publish Announcement
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
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
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
            <h3 className="text-gray-900 mb-2">No Announcements Yet</h3>
            <p className="text-gray-600">
              Create your first announcement to share with students
            </p>
          </div>
        ) : (
          announcements.map((announcement) => (
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
                      className={`px-3 py-1 rounded-full capitalize ${getCategoryColor(
                        announcement.category
                      )}`}
                    >
                      {announcement.category}
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
          ))
        )}
      </div>
    </div>
  );
}
