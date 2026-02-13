import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { IconDashboard, IconDiaper, IconBottle, IconMoon, IconUser } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useBaby } from "../contexts/BabyContext";
import { getFeed, updateFeed } from "../lib/api/feeds";
import { getDiaper, updateDiaper } from "../lib/api/diapers";
import { getSleep, updateSleep } from "../lib/api/sleeps";
import { getMedicine, updateMedicine } from "../lib/api/medicines";
import type { Feed, Diaper, Sleep, Medicine } from "../types/database";
import { Select } from "../components/Select";
import { DatePicker } from "../components/DatePicker";
import { TimePicker } from "../components/TimePicker";

type Activity = Feed | Diaper | Sleep | Medicine;

export function ActivityDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const { colorScheme } = useColorScheme();
  const queryClient = useQueryClient();
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

    // Get the type hint from URL query params
    const typeHint = searchParams.get('type');

    try {
      let data = null;

      // If we have a type hint, try that table first
      if (typeHint === 'feed') {
        data = await getFeed(id).catch(() => null);
        if (data) {
          setActivity(data);
          setLoading(false);
          return;
        }
      } else if (typeHint === 'diaper') {
        data = await getDiaper(id).catch(() => null);
        if (data) {
          setActivity(data);
          setLoading(false);
          return;
        }
      } else if (typeHint === 'sleep') {
        data = await getSleep(id).catch(() => null);
        if (data) {
          setActivity(data);
          setLoading(false);
          return;
        }
      } else if (typeHint === 'medicine') {
        data = await getMedicine(id).catch(() => null);
        if (data) {
          setActivity(data);
          setLoading(false);
          return;
        }
      }

      // If type hint didn't work or wasn't provided, try all tables
      // Try to fetch from feeds first (catch and suppress 404/406 errors)
      data = await getFeed(id).catch(() => null);
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

      // Try medicines
      data = await getMedicine(id).catch(() => null);
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

  const getActivityType = (): 'feed' | 'diaper' | 'sleep' | 'medicine' | null => {
    if (!activity) return null;

    // Check for medicine (has medicine_name and dosage fields)
    if ('medicine_name' in activity && 'dosage' in activity) {
      return 'medicine';
    }

    if (!('type' in activity) || !activity.type) return null;

    const type = activity.type;

    // Check feed types
    if (type === 'bottle' || type === 'breast' || type === 'solid') {
      return 'feed';
    }

    // Check diaper types
    if (type === 'wet' || type === 'dirty' || type === 'both' || type === 'other') {
      return 'diaper';
    }

    // Check sleep types
    if (type === 'nap' || type === 'overnight') {
      return 'sleep';
    }

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
      <div className="flex items-center justify-center h-screen w-full lg:-translate-y-16">
        <IconDashboard className="w-8 h-8 text-gray-400 animate-pulse" />
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
            aria-label="Go to dashboard"
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
      } else if (activityType === 'medicine') {
        await updateMedicine(id, activity as Medicine);
      }

      // Invalidate queries to refresh the data everywhere
      await queryClient.invalidateQueries({ queryKey: ["activities", selectedBaby?.id] });
      await queryClient.invalidateQueries({ queryKey: ["feeds", selectedBaby?.id] });
      await queryClient.invalidateQueries({ queryKey: ["diapers", selectedBaby?.id] });
      await queryClient.invalidateQueries({ queryKey: ["sleeps", selectedBaby?.id] });
      await queryClient.invalidateQueries({ queryKey: ["medicines", selectedBaby?.id] });

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
          aria-label="Go to dashboard"
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
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
            {isEditing ? "Edit Activity" : title}
          </h2>
          <p className="text-gray-500 text-base">
            {isEditing
              ? "Update the activity details below"
              : "Activity details and information"}
          </p>
          {!isEditing && (
            <Link
              to={activityType === 'feed' ? '/feed' : activityType === 'diaper' ? '/diaper' : activityType === 'sleep' ? '/sleep' : '/medicine'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors mt-3"
            >
              ← Back to {activityType === 'feed' ? 'Feed Logs' : activityType === 'diaper' ? 'Diaper Changes' : activityType === 'sleep' ? 'Sleep Logs' : 'Medicine Logs'}
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
                  <DatePicker
                    id="date"
                    value={activity.date}
                    onChange={(date) =>
                      setActivity({ ...activity, date })
                    }
                    required
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
                  <Select
                    id="diaperType"
                    value={(activity as Diaper).type || 'wet'}
                    onChange={(value) => {
                      const newType = value as 'wet' | 'dirty' | 'both' | 'other';
                      const diaperActivity = activity as Diaper;
                      const oldTypeDetail = diaperActivity.type ? diaperActivity.type.charAt(0).toUpperCase() + diaperActivity.type.slice(1) : '';
                      const newTypeDetail = newType.charAt(0).toUpperCase() + newType.slice(1);
                      // If current detail matches the old type, update it to the new type
                      // Otherwise, keep the custom detail
                      const newDetail = (diaperActivity.detail === oldTypeDetail || !diaperActivity.detail)
                        ? newTypeDetail
                        : diaperActivity.detail;
                      setActivity({
                        ...diaperActivity,
                        type: newType,
                        detail: newDetail
                      });
                    }}
                    options={[
                      { value: "wet", label: "Wet" },
                      { value: "dirty", label: "Dirty" },
                      { value: "both", label: "Both" },
                      { value: "other", label: "Other" },
                    ]}
                    icon={<IconDiaper className="w-4 h-4 text-gray-400" />}
                  />
                </div>
              )}
              {'type' in activity && getActivityType() === 'feed' && (
                <>
                  <div>
                    <label
                      htmlFor="feedType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Feed Type
                    </label>
                    <Select
                      id="feedType"
                      value={(activity as Feed).type || 'bottle'}
                      onChange={(value) => {
                        const newType = value as 'bottle' | 'breast' | 'solid';
                        const feedActivity = activity as Feed;
                        const oldFeedType = feedActivity.type ? feedActivity.type.charAt(0).toUpperCase() + feedActivity.type.slice(1) : '';
                        const newFeedType = newType.charAt(0).toUpperCase() + newType.slice(1);
                        const oldAutoDetail = feedActivity.amount ? `${feedActivity.amount}ml - ${oldFeedType}` : '';
                        // If current detail matches the auto-generated pattern, update it
                        // Otherwise, keep the custom detail
                        const newDetail = (feedActivity.detail === oldAutoDetail || !feedActivity.detail) && feedActivity.amount
                          ? `${feedActivity.amount}ml - ${newFeedType}`
                          : feedActivity.detail || '';
                        setActivity({
                          ...feedActivity,
                          type: newType,
                          detail: newDetail
                        });
                      }}
                      options={[
                        { value: "bottle", label: "Bottle" },
                        { value: "breast", label: "Breast" },
                        { value: "solid", label: "Solid Food" },
                      ]}
                      icon={<IconBottle className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Amount (ml)
                    </label>
                    <input
                      id="amount"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={(activity as Feed).amount || ''}
                      onChange={(e) => {
                        const newAmount = e.target.value;
                        const feedActivity = activity as Feed;
                        const feedType = feedActivity.type ? feedActivity.type.charAt(0).toUpperCase() + feedActivity.type.slice(1) : 'Bottle';
                        const oldAutoDetail = feedActivity.amount ? `${feedActivity.amount}ml - ${feedType}` : '';
                        // Check if detail follows the auto-generated pattern (any amount + ml - type)
                        const autoDetailPattern = new RegExp(`^\\d*ml - ${feedType}$`);
                        const isAutoGenerated = !feedActivity.detail || feedActivity.detail === oldAutoDetail || autoDetailPattern.test(feedActivity.detail);
                        // If current detail matches the auto-generated pattern, update it
                        // Otherwise, keep the custom detail
                        const newDetail = isAutoGenerated
                          ? (newAmount ? `${newAmount}ml - ${feedType}` : '')
                          : feedActivity.detail || '';
                        setActivity({
                          ...feedActivity,
                          amount: newAmount,
                          detail: newDetail
                        });
                      }}
                      placeholder="150"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                    />
                  </div>
                </>
              )}
              {getActivityType() === 'medicine' && 'medicine_name' in activity && (
                <>
                  <div>
                    <label
                      htmlFor="medicineName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Medicine Name
                    </label>
                    <input
                      id="medicineName"
                      type="text"
                      required
                      value={(activity as Medicine).medicine_name}
                      onChange={(e) => {
                        const newMedicineName = e.target.value;
                        const medicineActivity = activity as Medicine;
                        const oldAutoDetail = medicineActivity.medicine_name && medicineActivity.dosage
                          ? `${medicineActivity.medicine_name} - ${medicineActivity.dosage}`
                          : '';
                        const isAutoGenerated = !medicineActivity.detail || medicineActivity.detail === oldAutoDetail;
                        const newDetail = isAutoGenerated && medicineActivity.dosage
                          ? `${newMedicineName} - ${medicineActivity.dosage}`
                          : medicineActivity.detail || '';
                        setActivity({
                          ...medicineActivity,
                          medicine_name: newMedicineName,
                          title: newMedicineName,
                          detail: newDetail
                        });
                      }}
                      placeholder="e.g., Tylenol, Calpol"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dosage"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Dosage
                    </label>
                    <input
                      id="dosage"
                      type="text"
                      required
                      value={(activity as Medicine).dosage}
                      onChange={(e) => {
                        const newDosage = e.target.value;
                        const medicineActivity = activity as Medicine;
                        const oldAutoDetail = medicineActivity.medicine_name && medicineActivity.dosage
                          ? `${medicineActivity.medicine_name} - ${medicineActivity.dosage}`
                          : '';
                        const isAutoGenerated = !medicineActivity.detail || medicineActivity.detail === oldAutoDetail;
                        const newDetail = isAutoGenerated && medicineActivity.medicine_name
                          ? `${medicineActivity.medicine_name} - ${newDosage}`
                          : medicineActivity.detail || '';
                        setActivity({
                          ...medicineActivity,
                          dosage: newDosage,
                          detail: newDetail
                        });
                      }}
                      placeholder="e.g., 5ml, 2.5mg"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                    />
                  </div>
                </>
              )}
              {'type' in activity && getActivityType() === 'sleep' && (
                <div>
                  <label
                    htmlFor="sleepType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Sleep Type
                  </label>
                  <Select
                    id="sleepType"
                    value={(activity as Sleep).type || 'nap'}
                    onChange={(value) =>
                      setActivity({ ...(activity as Sleep), type: value as 'nap' | 'overnight' })
                    }
                    options={[
                      { value: "nap", label: "Nap" },
                      { value: "overnight", label: "Overnight" },
                    ]}
                    icon={<IconMoon className="w-4 h-4 text-gray-400" />}
                  />
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
                    <TimePicker
                      id="startTime"
                      value={(activity as Sleep).start_time || ''}
                      onChange={(newStartTime) => {
                        const sleepActivity = activity as Sleep;
                        const calculatedDuration = calculateDuration(newStartTime, sleepActivity.end_time);
                        const newDetail = sleepActivity.end_time
                          ? `${calculatedDuration} sleep`
                          : (sleepActivity.detail || 'Ongoing sleep');
                        setActivity({
                          ...sleepActivity,
                          start_time: newStartTime,
                          duration: calculatedDuration,
                          detail: newDetail
                        });
                      }}
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
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <TimePicker
                          id="endTime"
                          value={(activity as Sleep).end_time || ''}
                          onChange={(newEndTime) => {
                            const sleepActivity = activity as Sleep;
                            const calculatedDuration = calculateDuration(sleepActivity.start_time, newEndTime);
                            const newDetail = newEndTime
                              ? `${calculatedDuration} sleep`
                              : 'Ongoing sleep';
                            setActivity({
                              ...sleepActivity,
                              end_time: newEndTime,
                              duration: calculatedDuration,
                              detail: newDetail
                            });
                          }}
                        />
                      </div>
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
                              duration: calculatedDuration,
                              detail: `${calculatedDuration} sleep`
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
                    <TimePicker
                      id="time"
                      value={activity.time}
                      onChange={(time) =>
                        setActivity({ ...activity, time })
                      }
                      required
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
                  <Select
                    id="caregiver"
                    value={activity.caregiver}
                    onChange={(value) =>
                      setActivity({ ...activity, caregiver: value })
                    }
                    options={[
                      { value: "Mum", label: "Mum" },
                      { value: "Dad", label: "Dad" },
                      { value: "Other", label: "Other" },
                    ]}
                    icon={<IconUser className="w-4 h-4 text-gray-400" />}
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
              {getActivityType() === 'feed' && 'amount' in activity && (activity as Feed).amount && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount</p>
                  <p className="text-lg font-medium text-gray-900">
                    {(activity as Feed).amount}
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
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
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
