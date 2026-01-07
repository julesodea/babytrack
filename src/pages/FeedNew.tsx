import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { IconBottle, IconDashboard } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { createFeed } from "../lib/api/feeds";
import { getPreferences } from "../lib/api/preferences";

// Helper function to get current time in HH:MM format
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper function to get current date in YYYY-MM-DD format (local timezone)
const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function FeedNew() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feed, setFeed] = useState({
    amount: "",
    time: getCurrentTime(),
    date: getCurrentDate(),
    user: "",
    type: "bottle" as "bottle" | "breast" | "solid",
    detail: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadDefaultCaregiver();
    }
  }, [user]);

  const loadDefaultCaregiver = async () => {
    if (!user) return;
    try {
      const preferences = await getPreferences(user.id);
      if (preferences?.default_caregiver) {
        setFeed((prev) => ({ ...prev, user: preferences.default_caregiver! }));
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedBaby) {
      setError("Please select a baby first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const feedType = feed.type.charAt(0).toUpperCase() + feed.type.slice(1);
      await createFeed({
        user_id: user.id,
        baby_id: selectedBaby.id,
        created_by_user_id: user.id,
        title: `${feedType} Feed`,
        amount: feed.amount,
        detail: feed.detail || `${feed.amount}ml - ${feedType}`,
        time: feed.time,
        caregiver: feed.user,
        type: feed.type,
        notes: feed.notes || null,
        date: feed.date,
      });
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["feeds"] });
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
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <IconDashboard className="w-5 h-5" />
        </Link>
        <span>/</span>
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
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                value={feed.date}
                onChange={(e) => setFeed({ ...feed, date: e.target.value })}
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
                onChange={(e) =>
                  setFeed({
                    ...feed,
                    type: e.target.value as "bottle" | "breast" | "solid",
                  })
                }
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
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={feed.amount}
                onChange={(e) => setFeed({ ...feed, amount: e.target.value })}
                placeholder="150"
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
            <div>
              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Caregiver
              </label>
              <select
                id="user"
                required
                value={feed.user}
                onChange={(e) => setFeed({ ...feed, user: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
              >
                <option value="">Select caregiver</option>
                <option value="Mum">Mum</option>
                <option value="Dad">Dad</option>
                <option value="Other">Other</option>
              </select>
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
                value={feed.detail}
                onChange={(e) => setFeed({ ...feed, detail: e.target.value })}
                rows={3}
                placeholder="Additional details..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={feed.notes}
                onChange={(e) => setFeed({ ...feed, notes: e.target.value })}
                rows={4}
                placeholder="Any additional notes..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all resize-none"
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
