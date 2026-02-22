import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { IconDashboard, IconMoon, IconUser } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { createSleep } from "../lib/api/sleeps";
import { getPreferences } from "../lib/api/preferences";
import { getCurrentTime, getCurrentDate } from "../utils/dateTime";
import { DatePicker } from "../components/DatePicker";
import { TimePicker } from "../components/TimePicker";
import { Select } from "../components/Select";

// Helper function to calculate duration between two times
const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "";

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

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
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
  }
};

export function SleepNew() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sleep, setSleep] = useState({
    startTime: getCurrentTime(),
    endTime: getCurrentTime(),
    date: getCurrentDate(),
    user: "",
    type: "nap" as "nap" | "overnight",
    detail: "",
    notes: "",
  });
  const [isOngoing, setIsOngoing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadDefaultCaregiver = async () => {
      try {
        const preferences = await getPreferences(user.id);
        if (preferences?.default_caregiver) {
          setSleep(prev => ({ ...prev, user: preferences.default_caregiver! }));
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    loadDefaultCaregiver();
  }, [user]);

  // Auto-calculate duration when start or end time changes
  const duration = isOngoing ? "Ongoing" : calculateDuration(sleep.startTime, sleep.endTime);

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
      const sleepType = sleep.type === 'nap' ? 'Nap' : 'Overnight Sleep';
      await createSleep({
        user_id: user.id,
        baby_id: selectedBaby.id,
        created_by_user_id: user.id,
        title: sleepType,
        detail: sleep.detail || (isOngoing ? 'Ongoing sleep' : `${duration} sleep`),
        duration: isOngoing ? 'Ongoing' : duration,
        start_time: sleep.startTime,
        end_time: isOngoing ? null : sleep.endTime,
        caregiver: sleep.user,
        type: sleep.type,
        notes: sleep.notes || null,
        date: sleep.date,
      });
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["sleeps"] });
      navigate("/sleep");
    } catch (err) {
      console.error("Failed to create sleep entry:", err);
      setError("Failed to save sleep entry. Please try again.");
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
        <IconMoon className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <Link to="/sleep" className="hover:text-gray-600">
          Sleep Logs
        </Link>
        <span>/</span>
        <span className="text-gray-900">New Sleep</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Log New Sleep
        </h2>
        <p className="text-gray-500 text-base">
          Record a sleep session for your baby
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <form id="sleep-log-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <DatePicker
                value={sleep.date}
                onChange={(date) => setSleep({ ...sleep, date })}
                id="date"
                required
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sleep Type
              </label>
              <Select
                id="type"
                value={sleep.type}
                onChange={(type) => setSleep({ ...sleep, type: type as "nap" | "overnight" })}
                options={[
                  { value: "nap", label: "Nap" },
                  { value: "overnight", label: "Overnight" },
                ]}
                icon={<IconMoon className="w-4 h-4 text-gray-400" />}
              />
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
                  <span className="text-sm font-medium text-gray-700">Ongoing Sleep</span>
                  <p className="text-xs text-gray-500">Check this if the baby is still sleeping</p>
                </div>
              </label>
            </div>
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Time
              </label>
              <TimePicker
                value={sleep.startTime}
                onChange={(startTime) => setSleep({ ...sleep, startTime })}
                id="startTime"
                required
              />
            </div>
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                End Time
              </label>
              <TimePicker
                value={sleep.endTime}
                onChange={(endTime) => setSleep({ ...sleep, endTime })}
                id="endTime"
                required={!isOngoing}
                disabled={isOngoing}
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
                {duration || 'Select start and end time'}
              </div>
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
                value={sleep.user}
                onChange={(user) => setSleep({ ...sleep, user })}
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
                value={sleep.detail}
                onChange={(e) => setSleep({ ...sleep, detail: e.target.value })}
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
                value={sleep.notes}
                onChange={(e) => setSleep({ ...sleep, notes: e.target.value })}
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
            form="sleep-log-form"
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              colorScheme.id === "default"
                ? "bg-gray-900 hover:bg-gray-800"
                : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
            }`}
          >
            {loading ? "Saving..." : "Log Sleep"}
          </button>
          <Link
            to="/sleep"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
      </div>
    </div>
  );
}
