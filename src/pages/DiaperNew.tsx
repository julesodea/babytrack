import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { IconDashboard, IconDiaper, IconUser } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { createDiaper } from "../lib/api/diapers";
import { getPreferences } from "../lib/api/preferences";
import { getCurrentTime, getCurrentDate } from "../utils/dateTime";
import { DatePicker } from "../components/DatePicker";
import { TimePicker } from "../components/TimePicker";
import { Select } from "../components/Select";

export function DiaperNew() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [diaper, setDiaper] = useState({
    type: "wet" as "wet" | "dirty" | "both" | "other",
    time: getCurrentTime(),
    date: getCurrentDate(),
    user: "",
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
        detail: diaper.detail || diaperDetail,
        time: diaper.time,
        caregiver: diaper.user,
        type: diaper.type,
        notes: diaper.notes || null,
        date: diaper.date,
      });
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["diapers"] });
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
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <IconDashboard className="w-5 h-5" />
        </Link>
        <span>/</span>
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
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
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
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <DatePicker
                value={diaper.date}
                onChange={(date) => setDiaper({ ...diaper, date })}
                id="date"
                required
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type
              </label>
              <Select
                id="type"
                value={diaper.type}
                onChange={(type) => setDiaper({ ...diaper, type: type as "wet" | "dirty" | "both" | "other" })}
                options={[
                  { value: "wet", label: "Wet" },
                  { value: "dirty", label: "Dirty" },
                  { value: "both", label: "Both" },
                  { value: "other", label: "Other" },
                ]}
                icon={<IconDiaper className="w-4 h-4 text-gray-400" />}
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
                value={diaper.time}
                onChange={(time) => setDiaper({ ...diaper, time })}
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
                value={diaper.user}
                onChange={(user) => setDiaper({ ...diaper, user })}
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
                value={diaper.detail}
                onChange={(e) => setDiaper({ ...diaper, detail: e.target.value })}
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
                value={diaper.notes}
                onChange={(e) =>
                  setDiaper({ ...diaper, notes: e.target.value })
                }
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
