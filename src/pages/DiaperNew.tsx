import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { IconDiaper } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { createDiaper } from "../lib/api/diapers";
import { getPreferences } from "../lib/api/preferences";

// Helper function to get current time in HH:MM format
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper function to get current date in YYYY-MM-DD format (local timezone)
const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DiaperNew() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const navigate = useNavigate();
  const [diaper, setDiaper] = useState({
    type: "wet" as "wet" | "dirty" | "both",
    time: getCurrentTime(),
    user: "",
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
        setDiaper(prev => ({ ...prev, user: preferences.default_caregiver! }));
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
      const diaperDetail = diaper.type.charAt(0).toUpperCase() + diaper.type.slice(1);
      await createDiaper({
        user_id: user.id,
        baby_id: selectedBaby.id,
        created_by_user_id: user.id,
        title: `${diaperDetail} Diaper`,
        detail: diaperDetail,
        time: diaper.time,
        caregiver: diaper.user,
        type: diaper.type,
        notes: diaper.notes || null,
        date: getCurrentDate(),
      });
      navigate("/diaper");
    } catch (err) {
      console.error("Failed to create diaper change:", err);
      setError("Failed to save diaper change. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconDiaper className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <Link to="/diaper" className="hover:text-gray-600">
          Diaper Changes
        </Link>
        <span>/</span>
        <span className="text-gray-900">New Change</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Log Diaper Change
        </h2>
        <p className="text-gray-500 text-base">
          Record a diaper change for your baby
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <select
                id="type"
                value={diaper.type}
                onChange={(e) => setDiaper({ ...diaper, type: e.target.value as "wet" | "dirty" | "both" })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
              >
                <option value="wet">Wet</option>
                <option value="dirty">Dirty</option>
                <option value="both">Both</option>
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
                type="time"
                required
                value={diaper.time}
                onChange={(e) => setDiaper({ ...diaper, time: e.target.value })}
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
                value={diaper.user}
                onChange={(e) => setDiaper({ ...diaper, user: e.target.value })}
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
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={diaper.notes}
                onChange={(e) =>
                  setDiaper({ ...diaper, notes: e.target.value })
                }
                rows={3}
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
              {loading ? "Saving..." : "Log Change"}
            </button>
            <Link
              to="/diaper"
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
