import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { IconDashboard } from "../components/icons";

export function ActivityNew() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState({
    title: "",
    detail: "",
    time: "",
    user: "",
    type: "feed",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database/API
    console.log("Creating activity:", activity);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconDashboard className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <Link to="/" className="hover:text-gray-600">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900">New Activity</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Add New Activity
        </h2>
        <p className="text-gray-500 text-base">
          Log a new activity for your baby
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={activity.title}
                onChange={(e) =>
                  setActivity({ ...activity, title: e.target.value })
                }
                placeholder="e.g., Morning Feed"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <select
                id="type"
                value={activity.type}
                onChange={(e) =>
                  setActivity({ ...activity, type: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
              >
                <option value="feed">Feed</option>
                <option value="diaper">Diaper</option>
                <option value="sleep">Sleep</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Time
              </label>
              <input
                id="time"
                type="text"
                required
                value={activity.time}
                onChange={(e) =>
                  setActivity({ ...activity, time: e.target.value })
                }
                placeholder="e.g., 08:30 AM"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Caregiver
              </label>
              <input
                id="user"
                type="text"
                required
                value={activity.user}
                onChange={(e) =>
                  setActivity({ ...activity, user: e.target.value })
                }
                placeholder="e.g., Mum"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="detail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Details
              </label>
              <textarea
                id="detail"
                value={activity.detail}
                onChange={(e) =>
                  setActivity({ ...activity, detail: e.target.value })
                }
                rows={3}
                placeholder="e.g., 150ml Formula"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Create Activity
            </button>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
