import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { IconMoon } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { createSleep } from "../lib/api/sleeps";

// Helper function to get current time in HH:MM format
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export function SleepNew() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sleep, setSleep] = useState({
    title: "",
    duration: "",
    startTime: getCurrentTime(),
    endTime: getCurrentTime(),
    user: "",
    type: "nap" as "nap" | "overnight",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      await createSleep({
        user_id: user.id,
        title: sleep.title,
        detail: `${sleep.duration} sleep`,
        duration: sleep.duration,
        start_time: sleep.startTime,
        end_time: sleep.endTime,
        caregiver: sleep.user,
        type: sleep.type,
        date: new Date().toISOString().split('T')[0],
      });
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
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Log New Sleep
        </h2>
        <p className="text-gray-500 text-base">
          Record a sleep session for your baby
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
                value={sleep.title}
                onChange={(e) => setSleep({ ...sleep, title: e.target.value })}
                placeholder="e.g., Afternoon Nap"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sleep Type
              </label>
              <select
                id="type"
                value={sleep.type}
                onChange={(e) => setSleep({ ...sleep, type: e.target.value as "nap" | "overnight" })}
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
                value={sleep.startTime}
                onChange={(e) =>
                  setSleep({ ...sleep, startTime: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
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
                required
                value={sleep.endTime}
                onChange={(e) =>
                  setSleep({ ...sleep, endTime: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Duration
              </label>
              <input
                id="duration"
                type="text"
                required
                value={sleep.duration}
                onChange={(e) =>
                  setSleep({ ...sleep, duration: e.target.value })
                }
                placeholder="e.g., 2 hrs"
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
                value={sleep.user}
                onChange={(e) => setSleep({ ...sleep, user: e.target.value })}
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
              {loading ? "Saving..." : "Log Sleep"}
            </button>
            <Link
              to="/sleep"
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
