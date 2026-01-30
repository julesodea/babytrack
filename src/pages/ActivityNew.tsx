import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { IconDashboard } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { createFeed } from "../lib/api/feeds";
import { createDiaper } from "../lib/api/diapers";
import { createSleep } from "../lib/api/sleeps";
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

// Helper function to calculate duration between two times
const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "";

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  let startDate = new Date();
  startDate.setHours(startHours, startMinutes, 0, 0);

  let endDate = new Date();
  endDate.setHours(endHours, endMinutes, 0, 0);

  // If end time is earlier than start time, assume it's the next day
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  } else {
    return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min`;
  }
};

export function ActivityNew() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activityType, setActivityType] = useState<"feed" | "diaper" | "sleep">(
    "feed"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Feed-specific state
  const [feedData, setFeedData] = useState({
    type: "bottle" as "bottle" | "breast" | "solid",
    amount: "",
    time: getCurrentTime(),
    caregiver: "",
  });

  // Diaper-specific state
  const [diaperData, setDiaperData] = useState({
    type: "wet" as "wet" | "dirty" | "both",
    time: getCurrentTime(),
    caregiver: "",
    notes: "",
  });

  // Sleep-specific state
  const [sleepData, setSleepData] = useState({
    type: "nap" as "nap" | "overnight",
    startTime: getCurrentTime(),
    endTime: getCurrentTime(),
    caregiver: "",
  });
  const [isOngoing, setIsOngoing] = useState(false);

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
        // Set default caregiver for all activity types
        setFeedData((prev) => ({
          ...prev,
          caregiver: preferences.default_caregiver!,
        }));
        setDiaperData((prev) => ({
          ...prev,
          caregiver: preferences.default_caregiver!,
        }));
        setSleepData((prev) => ({
          ...prev,
          caregiver: preferences.default_caregiver!,
        }));
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBaby) {
      setError("Please select a baby first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (activityType === "feed") {
        const feedType =
          feedData.type === "bottle"
            ? "Bottle Feed"
            : feedData.type === "breast"
            ? "Breastfeed"
            : "Solid Food";
        await createFeed({
          user_id: user.id,
          baby_id: selectedBaby.id,
          title: feedType,
          detail: `${feedData.amount}ml - ${
            feedData.type.charAt(0).toUpperCase() + feedData.type.slice(1)
          }`,
          amount: feedData.amount,
          time: feedData.time,
          caregiver: feedData.caregiver,
          type: feedData.type,
          date: getCurrentDate(),
        });
      } else if (activityType === "diaper") {
        await createDiaper({
          user_id: user.id,
          baby_id: selectedBaby.id,
          title: "Diaper Change",
          detail: `${
            diaperData.type.charAt(0).toUpperCase() + diaperData.type.slice(1)
          } diaper`,
          time: diaperData.time,
          caregiver: diaperData.caregiver,
          type: diaperData.type,
          notes: diaperData.notes,
          date: getCurrentDate(),
        });
      } else if (activityType === "sleep") {
        const duration = isOngoing
          ? "Ongoing"
          : calculateDuration(sleepData.startTime, sleepData.endTime);
        const sleepType = sleepData.type === "nap" ? "Nap" : "Overnight Sleep";
        await createSleep({
          user_id: user.id,
          baby_id: selectedBaby.id,
          title: sleepType,
          detail: isOngoing ? "Ongoing sleep" : `${duration} sleep`,
          duration: duration,
          start_time: sleepData.startTime,
          end_time: isOngoing ? null : sleepData.endTime,
          caregiver: sleepData.caregiver,
          type: sleepData.type,
          date: getCurrentDate(),
        });
      }
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["feeds"] });
      await queryClient.invalidateQueries({ queryKey: ["diapers"] });
      await queryClient.invalidateQueries({ queryKey: ["sleeps"] });
      navigate("/");
    } catch (err) {
      console.error("Failed to create activity:", err);
      setError("Failed to save activity. Please try again.");
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
        <Link to="/" className="hover:text-gray-600">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900">New Activity</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
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
            {/* Activity Type Selector */}
            <div>
              <label
                htmlFor="activityType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Activity Type
              </label>
              <select
                id="activityType"
                value={activityType}
                onChange={(e) =>
                  setActivityType(e.target.value as "feed" | "diaper" | "sleep")
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
              >
                <option value="feed">Feed</option>
                <option value="diaper">Diaper</option>
                <option value="sleep">Sleep</option>
              </select>
            </div>

            {/* Feed Fields */}
            {activityType === "feed" && (
              <>
                <div>
                  <label
                    htmlFor="feedType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Feed Type
                  </label>
                  <select
                    id="feedType"
                    value={feedData.type}
                    onChange={(e) =>
                      setFeedData({
                        ...feedData,
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
                    value={feedData.amount}
                    onChange={(e) =>
                      setFeedData({ ...feedData, amount: e.target.value })
                    }
                    placeholder="e.g., 150"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="feedTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Time
                  </label>
                  <input
                    id="feedTime"
                    type="time"
                    required
                    value={feedData.time}
                    onChange={(e) =>
                      setFeedData({ ...feedData, time: e.target.value })
                    }
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all text-left"
                  />
                </div>
                <div>
                  <label
                    htmlFor="feedCaregiver"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Caregiver
                  </label>
                  <select
                    id="feedCaregiver"
                    required
                    value={feedData.caregiver}
                    onChange={(e) =>
                      setFeedData({ ...feedData, caregiver: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                  >
                    <option value="">Select caregiver</option>
                    <option value="Mum">Mum</option>
                    <option value="Dad">Dad</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            {/* Diaper Fields */}
            {activityType === "diaper" && (
              <>
                <div>
                  <label
                    htmlFor="diaperType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Diaper Type
                  </label>
                  <select
                    id="diaperType"
                    value={diaperData.type}
                    onChange={(e) =>
                      setDiaperData({
                        ...diaperData,
                        type: e.target.value as "wet" | "dirty" | "both",
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                  >
                    <option value="wet">Wet</option>
                    <option value="dirty">Dirty</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="diaperTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Time
                  </label>
                  <input
                    id="diaperTime"
                    type="time"
                    required
                    value={diaperData.time}
                    onChange={(e) =>
                      setDiaperData({ ...diaperData, time: e.target.value })
                    }
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all text-left"
                  />
                </div>
                <div>
                  <label
                    htmlFor="diaperCaregiver"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Caregiver
                  </label>
                  <select
                    id="diaperCaregiver"
                    required
                    value={diaperData.caregiver}
                    onChange={(e) =>
                      setDiaperData({
                        ...diaperData,
                        caregiver: e.target.value,
                      })
                    }
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
                    htmlFor="diaperNotes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="diaperNotes"
                    value={diaperData.notes}
                    onChange={(e) =>
                      setDiaperData({ ...diaperData, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Any additional notes..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all resize-none"
                  />
                </div>
              </>
            )}

            {/* Sleep Fields */}
            {activityType === "sleep" && (
              <>
                <div>
                  <label
                    htmlFor="sleepType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Sleep Type
                  </label>
                  <select
                    id="sleepType"
                    value={sleepData.type}
                    onChange={(e) =>
                      setSleepData({
                        ...sleepData,
                        type: e.target.value as "nap" | "overnight",
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                  >
                    <option value="nap">Nap</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    required
                    value={sleepData.startTime}
                    onChange={(e) =>
                      setSleepData({ ...sleepData, startTime: e.target.value })
                    }
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all text-left"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    End Time
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    required={!isOngoing}
                    disabled={isOngoing}
                    value={sleepData.endTime}
                    onChange={(e) =>
                      setSleepData({ ...sleepData, endTime: e.target.value })
                    }
                    className={`px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all text-left ${
                      isOngoing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Duration
                  </label>
                  <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-medium">
                    {isOngoing
                      ? "Ongoing"
                      : calculateDuration(
                          sleepData.startTime,
                          sleepData.endTime
                        ) || "Select start and end time"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOngoing}
                      onChange={(e) => setIsOngoing(e.target.checked)}
                      className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-200"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Ongoing Sleep
                      </span>
                      <p className="text-xs text-gray-500">
                        Check this if the baby is still sleeping
                      </p>
                    </div>
                  </label>
                </div>
                <div>
                  <label
                    htmlFor="sleepCaregiver"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Caregiver
                  </label>
                  <select
                    id="sleepCaregiver"
                    required
                    value={sleepData.caregiver}
                    onChange={(e) =>
                      setSleepData({ ...sleepData, caregiver: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                  >
                    <option value="">Select caregiver</option>
                    <option value="Mum">Mum</option>
                    <option value="Dad">Dad</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}
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
              {loading
                ? "Saving..."
                : `Log ${
                    activityType.charAt(0).toUpperCase() + activityType.slice(1)
                  }`}
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
