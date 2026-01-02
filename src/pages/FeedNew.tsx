import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { IconBottle } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { createFeed } from "../lib/api/feeds";

// Helper function to get current time in HH:MM format
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export function FeedNew() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState({
    title: "",
    amount: "",
    time: getCurrentTime(),
    user: "",
    type: "bottle" as "bottle" | "breast" | "solid",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      await createFeed({
        user_id: user.id,
        title: feed.title,
        amount: feed.amount,
        detail: `${feed.amount}ml - ${feed.type.charAt(0).toUpperCase() + feed.type.slice(1)}`,
        time: feed.time,
        caregiver: feed.user,
        type: feed.type,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      });
      navigate("/feed");
    } catch (err) {
      console.error("Failed to create feed:", err);
      setError("Failed to save feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconBottle className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <Link to="/feed" className="hover:text-gray-600">
          Feed Logs
        </Link>
        <span>/</span>
        <span className="text-gray-900">New Feed</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Log New Feed
        </h2>
        <p className="text-gray-500 text-base">
          Record a feeding session for your baby
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
                value={feed.title}
                onChange={(e) => setFeed({ ...feed, title: e.target.value })}
                placeholder="e.g., Morning Feed"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Feed Type
              </label>
              <select
                id="type"
                value={feed.type}
                onChange={(e) => setFeed({ ...feed, type: e.target.value as "bottle" | "breast" | "solid" })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
              >
                <option value="bottle">Bottle</option>
                <option value="breast">Breast</option>
                <option value="solid">Solid Food</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount (ml)
              </label>
              <input
                id="amount"
                type="number"
                required
                value={feed.amount}
                onChange={(e) => setFeed({ ...feed, amount: e.target.value })}
                placeholder="e.g., 150"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
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
                type="time"
                required
                value={feed.time}
                onChange={(e) => setFeed({ ...feed, time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div className="sm:col-span-2">
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
                value={feed.user}
                onChange={(e) => setFeed({ ...feed, user: e.target.value })}
                placeholder="e.g., Mum"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                colorScheme.id === "default"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
              }`}
            >
              {loading ? "Saving..." : "Log Feed"}
            </button>
            <Link
              to="/feed"
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
