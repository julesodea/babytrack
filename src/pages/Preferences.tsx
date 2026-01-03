import { useState, useEffect } from "react";
import { IconFilter } from "../components/icons";
import { useColorScheme, colorSchemes } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile } from "../lib/api/profiles";
import { getPreferences, upsertPreferences } from "../lib/api/preferences";

export function Preferences() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    feedReminders: true,
    feedReminderInterval: 3,
    diaperAlerts: true,
    diaperAlertInterval: 3,
    sleepTracking: false,
    theme: "light",
    timeFormat: "12h",
    defaultCaregiver: "",
    measurementUnit: "ml",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPreferences();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profile = await getProfile(user.id);
      if (profile && profile.full_name) {
        setFullName(profile.full_name);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;

    setIsLoadingPreferences(true);
    try {
      const preferences = await getPreferences(user.id);
      if (preferences) {
        setSettings(prev => ({
          ...prev,
          defaultCaregiver: preferences.default_caregiver || "",
          feedReminders: preferences.feed_reminders ?? true,
          feedReminderInterval: preferences.feed_reminder_interval || 3,
          diaperAlerts: preferences.diaper_alerts ?? true,
          diaperAlertInterval: preferences.diaper_alert_interval || 3,
        }));
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await Promise.all([
        updateProfile(user.id, { full_name: fullName }),
        upsertPreferences({
          user_id: user.id,
          default_caregiver: settings.defaultCaregiver || null,
          feed_reminders: settings.feedReminders,
          feed_reminder_interval: settings.feedReminderInterval,
          diaper_alerts: settings.diaperAlerts,
          diaper_alert_interval: settings.diaperAlertInterval,
        })
      ]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
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

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Preferences saved successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Account Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Notifications
          </h3>
          {isLoadingPreferences ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-48"></div>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-48"></div>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-48"></div>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
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
                      settings.feedReminders
                        ? colorScheme.id === "default"
                          ? "bg-gray-900"
                          : colorScheme.cardBg
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.feedReminders ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {settings.feedReminders && (
                  <div className="ml-0 flex items-center gap-2">
                    <label htmlFor="feedInterval" className="text-xs text-gray-600">
                      Remind me every
                    </label>
                    <input
                      id="feedInterval"
                      type="number"
                      min="1"
                      max="24"
                      value={settings.feedReminderInterval}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          feedReminderInterval: parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none"
                    />
                    <span className="text-xs text-gray-600">hours</span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
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
                      settings.diaperAlerts
                        ? colorScheme.id === "default"
                          ? "bg-gray-900"
                          : colorScheme.cardBg
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.diaperAlerts ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {settings.diaperAlerts && (
                  <div className="ml-0 flex items-center gap-2">
                    <label htmlFor="diaperInterval" className="text-xs text-gray-600">
                      Remind me every
                    </label>
                    <input
                      id="diaperInterval"
                      type="number"
                      min="1"
                      max="24"
                      value={settings.diaperAlertInterval}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          diaperAlertInterval: parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none"
                    />
                    <span className="text-xs text-gray-600">hours</span>
                  </div>
                )}
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
                    settings.sleepTracking
                      ? colorScheme.id === "default"
                        ? "bg-gray-900"
                        : colorScheme.cardBg
                      : "bg-gray-200"
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
          )}
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

        {/* Card Color Scheme */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Dashboard Card Color
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Choose a color scheme for your dashboard cards
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => setColorScheme(scheme)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  colorScheme.id === scheme.id
                    ? "border-gray-900 ring-1+ ring-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-full h-12 rounded-lg mb-2 ${scheme.cardBg} ${
                    scheme.id === "default" ? "border border-gray-200" : ""
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {scheme.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Data Defaults
          </h3>
          {isLoadingPreferences ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-3 bg-gray-100 rounded w-full mt-2"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="defaultCaregiver"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Default Caregiver
                </label>
                <select
                  id="defaultCaregiver"
                  value={settings.defaultCaregiver}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCaregiver: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                >
                  <option value="">None (select manually each time)</option>
                  <option value="Mum">Mum</option>
                  <option value="Dad">Dad</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  This caregiver will be pre-selected when creating new activities
                </p>
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
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              colorScheme.id === "default"
                ? "bg-gray-900 hover:bg-gray-800"
                : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
            }`}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
