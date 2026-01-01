import { useState } from "react";
import { IconFilter } from "../components/icons";

export function Preferences() {
  const [settings, setSettings] = useState({
    feedReminders: true,
    diaperAlerts: true,
    sleepTracking: false,
    theme: "light",
    timeFormat: "12h",
    defaultCaregiver: "Mum",
    measurementUnit: "ml",
  });

  const handleSave = () => {
    // In a real app, this would save to a database/API
    console.log("Saving preferences:", settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconFilter className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Preferences</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Preferences
        </h2>
        <p className="text-gray-500 text-base">
          Customize your baby tracker experience
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Feed Reminders
                </p>
                <p className="text-xs text-gray-500">
                  Get notified when it's time for a feed
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    feedReminders: !settings.feedReminders,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.feedReminders ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.feedReminders ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Diaper Alerts
                </p>
                <p className="text-xs text-gray-500">
                  Receive alerts for diaper check times
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    diaperAlerts: !settings.diaperAlerts,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.diaperAlerts ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.diaperAlerts ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sleep Tracking
                </p>
                <p className="text-xs text-gray-500">
                  Enable automatic sleep pattern analysis
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    sleepTracking: !settings.sleepTracking,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.sleepTracking ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.sleepTracking ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Display</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="theme"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Theme
              </label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) =>
                  setSettings({ ...settings, theme: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="timeFormat"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Time Format
              </label>
              <select
                id="timeFormat"
                value={settings.timeFormat}
                onChange={(e) =>
                  setSettings({ ...settings, timeFormat: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Data Defaults
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="defaultCaregiver"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Default Caregiver
              </label>
              <input
                id="defaultCaregiver"
                type="text"
                value={settings.defaultCaregiver}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCaregiver: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="measurementUnit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Measurement Unit
              </label>
              <select
                id="measurementUnit"
                value={settings.measurementUnit}
                onChange={(e) =>
                  setSettings({ ...settings, measurementUnit: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
              >
                <option value="ml">Milliliters (ml)</option>
                <option value="oz">Ounces (oz)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
