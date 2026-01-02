import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { IconDashboard } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { useColorScheme } from "../context/ColorSchemeContext";
import { getFeed, updateFeed } from "../lib/api/feeds";
import { getDiaper, updateDiaper } from "../lib/api/diapers";
import { getSleep, updateSleep } from "../lib/api/sleeps";
import type { Feed, Diaper, Sleep } from "../types/database";

type Activity = Feed | Diaper | Sleep;

export function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadActivity();
    }
  }, [id, user]);

  const loadActivity = async () => {
    if (!id) return;

    setLoading(true);
    setError("");
    try {
      // Try to fetch from feeds first
      let data = await getFeed(id).catch(() => null);
      if (data) {
        setActivity(data);
        setLoading(false);
        return;
      }

      // Try diapers
      data = await getDiaper(id).catch(() => null);
      if (data) {
        setActivity(data);
        setLoading(false);
        return;
      }

      // Try sleeps
      data = await getSleep(id).catch(() => null);
      if (data) {
        setActivity(data);
        setLoading(false);
        return;
      }

      // Not found in any table
      setActivity(null);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load activity:", err);
      setError("Failed to load activity");
      setLoading(false);
    }
  };

  const getActivityType = (): 'feed' | 'diaper' | 'sleep' | null => {
    if (!activity) return null;
    if ('amount' in activity) return 'feed';
    if ('type' in activity && ('wet' in activity || 'dirty' in activity)) return 'diaper';
    if ('start_time' in activity) return 'sleep';
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading activity...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
          <IconDashboard className="w-5 h-5 text-gray-500" />
          <span>/</span>
          <Link to="/" className="hover:text-gray-600">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900">Activity Not Found</span>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <p className="text-gray-500">Activity not found.</p>
          <Link
            to="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!activity || !id) return;

    setError("");
    try {
      const activityType = getActivityType();

      if (activityType === 'feed') {
        await updateFeed(id, activity as Feed);
      } else if (activityType === 'diaper') {
        await updateDiaper(id, activity as Diaper);
      } else if (activityType === 'sleep') {
        await updateSleep(id, activity as Sleep);
      }

      setIsEditing(false);
      await loadActivity(); // Reload to get updated data
    } catch (err) {
      console.error("Failed to save activity:", err);
      setError("Failed to save changes. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadActivity(); // Reload original data
  };

  const activityType = getActivityType();
  const title = 'title' in activity ? activity.title : 'Activity';
  const detail = 'detail' in activity ? activity.detail : '';
  const time = 'time' in activity ? activity.time : ('start_time' in activity ? activity.start_time : '');
  const caregiver = 'caregiver' in activity ? activity.caregiver : '';

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconDashboard className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <Link to="/" className="hover:text-gray-600">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900">{title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Edit Activity" : title}
          </h2>
          <p className="text-gray-500 text-base">
            {isEditing
              ? "Update the activity details below"
              : "Activity details and information"}
          </p>
          {!isEditing && (
            <Link
              to={activityType === 'feed' ? '/feed' : activityType === 'diaper' ? '/diaper' : '/sleep'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors mt-3"
            >
              ← Back to {activityType === 'feed' ? 'Feed' : activityType === 'diaper' ? 'Diaper' : 'Sleep'} Logs
            </Link>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
              colorScheme.id === "default"
                ? "bg-gray-900 hover:bg-gray-800"
                : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
            }`}
          >
            Edit
          </button>
        )}
      </div>

      {/* Activity Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {'title' in activity && (
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
                    value={activity.title || ''}
                    onChange={(e) =>
                      setActivity({ ...activity, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                  />
                </div>
              )}
              {'time' in activity && (
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
                    value={activity.time}
                    onChange={(e) =>
                      setActivity({ ...activity, time: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                  />
                </div>
              )}
              {'caregiver' in activity && (
                <div>
                  <label
                    htmlFor="caregiver"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Caregiver
                  </label>
                  <input
                    id="caregiver"
                    type="text"
                    value={activity.caregiver}
                    onChange={(e) =>
                      setActivity({ ...activity, caregiver: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                  />
                </div>
              )}
              {'detail' in activity && (
                <div className="sm:col-span-2">
                  <label
                    htmlFor="detail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Details
                  </label>
                  <textarea
                    id="detail"
                    value={activity.detail || ''}
                    onChange={(e) =>
                      setActivity({ ...activity, detail: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all resize-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                  colorScheme.id === "default"
                    ? "bg-gray-900 hover:bg-gray-800"
                    : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
                }`}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Type</p>
                <p className="text-lg font-medium text-gray-900 capitalize">
                  {activityType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Time</p>
                <p className="text-lg font-medium text-gray-900">
                  {time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Details</p>
                <p className="text-lg font-medium text-gray-900">
                  {detail || 'No details provided'}
                </p>
              </div>
              {caregiver && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Caregiver</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      {caregiver.charAt(0)}
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {caregiver}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
