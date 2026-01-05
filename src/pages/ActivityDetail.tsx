import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
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
    if ('start_time' in activity) return 'sleep';
    if ('time' in activity && !('start_time' in activity)) return 'diaper';
    return null;
  };

  const calculateDuration = (startTime: string | null, endTime: string | null): string => {
    if (!startTime || !endTime) return '';

    try {
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
    } catch {
      return '';
    }
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
              ← Back to {activityType === 'feed' ? 'Feed Logs' : activityType === 'diaper' ? 'Diaper Changes' : 'Sleep Logs'}
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
              {'date' in activity && (
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={activity.date}
                    onChange={(e) =>
                      setActivity({ ...activity, date: e.target.value })
                    }
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                  />
                </div>
              )}
              {'type' in activity && getActivityType() === 'diaper' && (
                <div>
                  <label
                    htmlFor="diaperType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Type
                  </label>
                  <select
                    id="diaperType"
                    value={(activity as Diaper).type || 'wet'}
                    onChange={(e) =>
                      setActivity({ ...(activity as Diaper), type: e.target.value as 'wet' | 'dirty' | 'both' })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                  >
                    <option value="wet">Wet</option>
                    <option value="dirty">Dirty</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              )}
              {'type' in activity && getActivityType() === 'feed' && (
                <div>
                  <label
                    htmlFor="feedType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Feed Type
                  </label>
                  <select
                    id="feedType"
                    value={(activity as Feed).type || 'bottle'}
                    onChange={(e) =>
                      setActivity({ ...(activity as Feed), type: e.target.value as 'bottle' | 'breast' | 'solid' })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                  >
                    <option value="bottle">Bottle</option>
                    <option value="breast">Breast</option>
                    <option value="solid">Solid Food</option>
                  </select>
                </div>
              )}
              {'type' in activity && getActivityType() === 'sleep' && (
                <div>
                  <label
                    htmlFor="sleepType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Sleep Type
                  </label>
                  <select
                    id="sleepType"
                    value={(activity as Sleep).type || 'nap'}
                    onChange={(e) =>
                      setActivity({ ...(activity as Sleep), type: e.target.value as 'nap' | 'overnight' })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                  >
                    <option value="nap">Nap</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </div>
              )}
              {getActivityType() === 'sleep' && 'start_time' in activity ? (
                <>
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
                      value={(activity as Sleep).start_time || ''}
                      onChange={(e) => {
                        const newStartTime = e.target.value;
                        const sleepActivity = activity as Sleep;
                        const calculatedDuration = calculateDuration(newStartTime, sleepActivity.end_time);
                        setActivity({
                          ...sleepActivity,
                          start_time: newStartTime,
                          duration: calculatedDuration
                        });
                      }}
                      className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endTime"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      End Time
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="endTime"
                        type="time"
                        value={(activity as Sleep).end_time || ''}
                        onChange={(e) => {
                          const newEndTime = e.target.value;
                          const sleepActivity = activity as Sleep;
                          const calculatedDuration = calculateDuration(sleepActivity.start_time, newEndTime);
                          setActivity({
                            ...sleepActivity,
                            end_time: newEndTime,
                            duration: calculatedDuration
                          });
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                      />
                      {!(activity as Sleep).end_time && (
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                            const sleepActivity = activity as Sleep;
                            const calculatedDuration = calculateDuration(sleepActivity.start_time, currentTime);
                            setActivity({
                              ...sleepActivity,
                              end_time: currentTime,
                              duration: calculatedDuration
                            });
                          }}
                          className={`px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                            colorScheme.id === "default"
                              ? "bg-gray-900 hover:bg-gray-800"
                              : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
                          }`}
                        >
                          End Now
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Duration
                    </label>
                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 flex items-center">
                      {calculateDuration((activity as Sleep).start_time, (activity as Sleep).end_time) || 'Set start and end times'}
                    </div>
                  </div>
                </>
              ) : (
                'time' in activity && (
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
                      className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                    />
                  </div>
                )
              )}
              {'caregiver' in activity && (
                <div>
                  <label
                    htmlFor="caregiver"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Caregiver
                  </label>
                  <select
                    id="caregiver"
                    value={activity.caregiver}
                    onChange={(e) =>
                      setActivity({ ...activity, caregiver: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                  >
                    <option value="Mum">Mum</option>
                    <option value="Dad">Dad</option>
                    <option value="Other">Other</option>
                  </select>
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
              {'notes' in activity && (
                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={activity.notes || ''}
                    onChange={(e) =>
                      setActivity({ ...activity, notes: e.target.value })
                    }
                    rows={4}
                    placeholder="Add any additional notes here..."
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
              {'date' in activity && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(activity.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Activity Type</p>
                <p className="text-lg font-medium text-gray-900 capitalize">
                  {activityType}
                </p>
              </div>
              {'type' in activity && activity.type && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {activityType === 'diaper' ? 'Diaper Type' : activityType === 'feed' ? 'Feed Type' : 'Sleep Type'}
                  </p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {activity.type}
                  </p>
                </div>
              )}
              {getActivityType() === 'sleep' && 'start_time' in activity ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Start Time</p>
                    <p className="text-lg font-medium text-gray-900">
                      {(activity as Sleep).start_time || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">End Time</p>
                    <p className="text-lg font-medium text-gray-900">
                      {(activity as Sleep).end_time || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="text-lg font-medium text-gray-900">
                      {(activity as Sleep).duration || calculateDuration((activity as Sleep).start_time, (activity as Sleep).end_time) || '-'}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time</p>
                  <p className="text-lg font-medium text-gray-900">
                    {time}
                  </p>
                </div>
              )}
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
              {'notes' in activity && activity.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-base text-gray-900 whitespace-pre-wrap">
                    {activity.notes}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
