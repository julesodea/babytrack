import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { IconScale, IconDashboard } from "../components/icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { createWeight } from "../lib/api/weights";
import { getCurrentTime, getCurrentDate } from "../utils/dateTime";
import { DatePicker } from "../components/DatePicker";
import { TimePicker } from "../components/TimePicker";
import { Select } from "../components/Select";

export function WeightNew() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState({
    name: "",
    value: "",
    unit: "kg",
    time: getCurrentTime(),
    date: getCurrentDate(),
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      await createWeight({
        user_id: user.id,
        baby_id: selectedBaby.id,
        created_by_user_id: user.id,
        name: weight.name,
        value: weight.value,
        unit: weight.unit,
        notes: weight.notes || null,
        date: weight.date,
        time: weight.time,
      });
      await queryClient.invalidateQueries({ queryKey: ["weights"] });
      navigate("/weight");
    } catch (err) {
      console.error("Failed to create weight entry:", err);
      setError("Failed to save weight entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
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
        <IconScale className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <Link to="/weight" className="hover:text-gray-600">
          Weight
        </Link>
        <span>/</span>
        <span className="text-gray-900">New Entry</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Log Weight
        </h2>
        <p className="text-gray-500 text-base">
          Record your baby's weight to track growth over time
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <form id="weight-log-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={weight.name}
                onChange={(e) => setWeight({ ...weight, name: e.target.value })}
                placeholder="e.g., Birth weight, Week 4 checkup"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <DatePicker
                value={weight.date}
                onChange={(date) => setWeight({ ...weight, date })}
                id="date"
                required
              />
            </div>
            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Weight
              </label>
              <input
                id="value"
                type="number"
                step="0.001"
                min="0"
                required
                value={weight.value}
                onChange={(e) => setWeight({ ...weight, value: e.target.value })}
                placeholder="e.g., 3.5"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Unit
              </label>
              <Select
                id="unit"
                value={weight.unit}
                onChange={(unit) => setWeight({ ...weight, unit })}
                options={[
                  { value: "kg", label: "kg" },
                  { value: "g", label: "g" },
                  { value: "lbs", label: "lbs" },
                  { value: "oz", label: "oz" },
                ]}
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
                value={weight.time}
                onChange={(time) => setWeight({ ...weight, time })}
                id="time"
                required
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
                value={weight.notes}
                onChange={(e) => setWeight({ ...weight, notes: e.target.value })}
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
        </form>
      </div>

      {/* Sticky buttons */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-72 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-100 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            type="submit"
            form="weight-log-form"
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              colorScheme.id === "default"
                ? "bg-gray-900 hover:bg-gray-800"
                : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
            }`}
          >
            {loading ? "Saving..." : "Log Weight"}
          </button>
          <Link
            to="/weight"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
