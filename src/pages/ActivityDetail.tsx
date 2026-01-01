import { useState } from "react";
import { Link, useParams } from "react-router";
import { IconDashboard } from "../components/icons";

interface Activity {
  title: string;
  detail: string;
  time: string;
  user: string;
  type: string;
}

export function ActivityDetail() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - in a real app this would come from a database/API
  const activitiesData: Record<string, Activity> = {
    // Dashboard activities
    "1": {
      title: "Morning Feed",
      detail: "150ml Formula",
      time: "08:30 AM",
      user: "Mum",
      type: "feed",
    },
    "2": {
      title: "Diaper Change",
      detail: "Wet",
      time: "10:15 AM",
      user: "Dad",
      type: "diaper",
    },
    "3": {
      title: "Afternoon Nap",
      detail: "2 hours",
      time: "01:00 PM",
      user: "Other",
      type: "sleep",
    },
    "4": {
      title: "Evening Feed",
      detail: "180ml Formula",
      time: "06:45 PM",
      user: "Mum",
      type: "feed",
    },
    // Feed activities
    f1: {
      title: "Morning Feed",
      detail: "150ml Formula - Bottle",
      time: "06:30 AM",
      user: "Mum",
      type: "feed",
    },
    f2: {
      title: "Mid-Morning Feed",
      detail: "120ml Breast Milk",
      time: "09:15 AM",
      user: "Mum",
      type: "feed",
    },
    f3: {
      title: "Lunch Feed",
      detail: "180ml Formula - Bottle",
      time: "12:00 PM",
      user: "Dad",
      type: "feed",
    },
    f4: {
      title: "Afternoon Feed",
      detail: "150ml Formula - Bottle",
      time: "02:30 PM",
      user: "Other",
      type: "feed",
    },
    f5: {
      title: "Evening Feed",
      detail: "180ml Formula - Bottle",
      time: "06:00 PM",
      user: "Mum",
      type: "feed",
    },
    f6: {
      title: "Night Feed",
      detail: "120ml Breast Milk",
      time: "09:30 PM",
      user: "Mum",
      type: "feed",
    },
    // Diaper activities
    d1: {
      title: "Morning Change",
      detail: "Wet",
      time: "06:00 AM",
      user: "Mum",
      type: "diaper",
    },
    d2: {
      title: "After Breakfast",
      detail: "Dirty",
      time: "08:30 AM",
      user: "Mum",
      type: "diaper",
    },
    d3: {
      title: "Mid-Morning",
      detail: "Wet",
      time: "10:15 AM",
      user: "Dad",
      type: "diaper",
    },
    d4: {
      title: "Before Nap",
      detail: "Wet",
      time: "12:00 PM",
      user: "Other",
      type: "diaper",
    },
    d5: {
      title: "After Nap",
      detail: "Dirty",
      time: "01:45 PM",
      user: "Other",
      type: "diaper",
    },
    d6: {
      title: "Afternoon",
      detail: "Wet",
      time: "03:30 PM",
      user: "Mum",
      type: "diaper",
    },
    d7: {
      title: "Before Dinner",
      detail: "Dirty",
      time: "05:45 PM",
      user: "Dad",
      type: "diaper",
    },
    d8: {
      title: "Before Bed",
      detail: "Wet",
      time: "08:00 PM",
      user: "Mum",
      type: "diaper",
    },
    // Sleep activities
    s1: {
      title: "Overnight Sleep",
      detail: "10 hrs",
      time: "07:00 PM - 05:00 AM",
      user: "Mum",
      type: "sleep",
    },
    s2: {
      title: "Morning Nap",
      detail: "1.5 hrs",
      time: "09:00 AM - 10:30 AM",
      user: "Dad",
      type: "sleep",
    },
    s3: {
      title: "Afternoon Nap",
      detail: "2 hrs",
      time: "01:00 PM - 03:00 PM",
      user: "Other",
      type: "sleep",
    },
    s4: {
      title: "Evening Nap",
      detail: "45 min",
      time: "05:30 PM - 06:15 PM",
      user: "Mum",
      type: "sleep",
    },
    s5: {
      title: "Overnight Sleep",
      detail: "9.5 hrs",
      time: "07:30 PM - 05:00 AM",
      user: "Dad",
      type: "sleep",
    },
    s6: {
      title: "Morning Nap",
      detail: "1 hr",
      time: "08:30 AM - 09:30 AM",
      user: "Mum",
      type: "sleep",
    },
  };

  const initialActivity = id ? activitiesData[id] : null;
  const [activity, setActivity] = useState<Activity | null>(initialActivity);

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

  const handleSave = () => {
    // In a real app, this would save to a database/API
    setIsEditing(false);
  };

  const handleCancel = () => {
    setActivity(initialActivity);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconDashboard className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <Link to="/" className="hover:text-gray-600">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900">{activity.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Edit Activity" : activity.title}
          </h2>
          <p className="text-gray-500 text-base">
            {isEditing
              ? "Update the activity details below"
              : "Activity details and information"}
          </p>
          {!isEditing && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors mt-3"
            >
              ← Back to Dashboard
            </Link>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
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
                  value={activity.title}
                  onChange={(e) =>
                    setActivity({ ...activity, title: e.target.value })
                  }
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
                  value={activity.type}
                  onChange={(e) =>
                    setActivity({ ...activity, type: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all bg-white"
                >
                  <option value="feed">Feed</option>
                  <option value="diaper">Diaper</option>
                  <option value="sleep">Sleep</option>
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
                  value={activity.time}
                  onChange={(e) =>
                    setActivity({ ...activity, time: e.target.value })
                  }
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
                  value={activity.user}
                  onChange={(e) =>
                    setActivity({ ...activity, user: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
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
                  value={activity.detail}
                  onChange={(e) =>
                    setActivity({ ...activity, detail: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
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
                  {activity.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Time</p>
                <p className="text-lg font-medium text-gray-900">
                  {activity.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Details</p>
                <p className="text-lg font-medium text-gray-900">
                  {activity.detail}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Caregiver</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {activity.user.charAt(0)}
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {activity.user}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
