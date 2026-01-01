import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { IconDiaper } from "../components/icons";

export function DiaperNew() {
  const navigate = useNavigate();
  const [diaper, setDiaper] = useState({
    title: "",
    type: "wet",
    time: "",
    user: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database/API
    console.log("Creating diaper change:", diaper);
    navigate("/diaper");
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
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={diaper.title}
                onChange={(e) =>
                  setDiaper({ ...diaper, title: e.target.value })
                }
                placeholder="e.g., Morning Change"
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
                value={diaper.type}
                onChange={(e) => setDiaper({ ...diaper, type: e.target.value })}
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
                type="text"
                required
                value={diaper.time}
                onChange={(e) => setDiaper({ ...diaper, time: e.target.value })}
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
                value={diaper.user}
                onChange={(e) => setDiaper({ ...diaper, user: e.target.value })}
                placeholder="e.g., Mum"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
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
                rows={3}
                placeholder="Any additional notes..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Log Change
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
