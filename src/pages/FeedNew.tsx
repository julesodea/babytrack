import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { IconBottle, IconDashboard, IconUser } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { createFeed } from "../lib/api/feeds";
import { getPreferences } from "../lib/api/preferences";
import { getCurrentTime, getCurrentDate } from "../utils/dateTime";
import { DatePicker } from "../components/DatePicker";
import { TimePicker } from "../components/TimePicker";
import { Select } from "../components/Select";

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
    if (!user) return;

    const loadDefaultCaregiver = async () => {
      try {
        const preferences = await getPreferences(user.id);
        if (preferences?.default_caregiver) {
          setFeed((prev) => ({ ...prev, user: preferences.default_caregiver! }));
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    loadDefaultCaregiver();
  }, [user]);

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
          aria-label="Go to dashboard"
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
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Log New Feed
        </h2>
        <p className="text-gray-500 text-base">
          Record a feeding session for your baby
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <form id="feed-log-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <DatePicker
                value={feed.date}
                onChange={(date) => setFeed({ ...feed, date })}
                id="date"
                required
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Feed Type
              </label>
              <Select
                id="type"
                value={feed.type}
                onChange={(type) =>
                  setFeed({
                    ...feed,
                    type: type as "bottle" | "breast" | "solid",
                  })
                }
                options={[
                  { value: "bottle", label: "Bottle" },
                  { value: "breast", label: "Breast" },
                  { value: "solid", label: "Solid Food" },
                ]}
                icon={<IconBottle className="w-4 h-4 text-gray-400" />}
              />
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
              <TimePicker
                value={feed.time}
                onChange={(time) => setFeed({ ...feed, time })}
                id="time"
                required
              />
            </div>
            <div>
              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Caregiver
              </label>
              <Select
                id="user"
                value={feed.user}
                onChange={(user) => setFeed({ ...feed, user })}
                options={[
                  { value: "Mum", label: "Mum" },
                  { value: "Dad", label: "Dad" },
                  { value: "Other", label: "Other" },
                ]}
                placeholder="Select caregiver"
                required
                icon={<IconUser className="w-4 h-4 text-gray-400" />}
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
        </form>
      </div>

      {/* Log buttons */}
      <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            form="feed-log-form"
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
    </div>
  );
}
