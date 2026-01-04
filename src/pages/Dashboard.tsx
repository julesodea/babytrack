import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconBottle,
  IconCalendar,
  IconDashboard,
  IconDiaper,
  IconFilter,
  IconMoon,
  IconSearch,
} from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";
import { PendingInvites } from "../components/PendingInvites";
import { NotificationBanner } from "../components/NotificationBanner";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { getProfile } from "../lib/api/profiles";
import { getPreferences } from "../lib/api/preferences";
import { getFeeds, deleteFeeds } from "../lib/api/feeds";
import { getDiapers, deleteDiapers } from "../lib/api/diapers";
import { getSleeps, deleteSleeps } from "../lib/api/sleeps";

interface ActivityItem {
  id: string;
  detail: string;
  time: string;
  user: string;
  type: "feed" | "diaper" | "sleep";
  date: string;
  created_at: string;
}

export function Dashboard() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Query for user profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  // Query for user preferences
  const { data: preferences, isLoading: loadingPreferences } = useQuery({
    queryKey: ["preferences", user?.id],
    queryFn: () => getPreferences(user!.id),
    enabled: !!user,
  });

  // Query for activities
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["activities", selectedBaby?.id],
    queryFn: async () => {
      if (!selectedBaby) return [];

      const [feeds, diapers, sleeps] = await Promise.all([
        getFeeds(selectedBaby.id),
        getDiapers(selectedBaby.id),
        getSleeps(selectedBaby.id),
      ]);

      // Map feeds to ActivityItem format
      const feedActivities: ActivityItem[] = feeds.map((f) => ({
        id: f.id,
        detail: f.detail || "",
        time: f.time,
        user: f.caregiver,
        type: "feed" as const,
        date: f.date,
        created_at: f.created_at,
      }));

      // Map diapers to ActivityItem format
      const diaperActivities: ActivityItem[] = diapers.map((d) => ({
        id: d.id,
        detail: d.detail || "",
        time: d.time,
        user: d.caregiver,
        type: "diaper" as const,
        date: d.date,
        created_at: d.created_at,
      }));

      // Map sleeps to ActivityItem format
      const sleepActivities: ActivityItem[] = sleeps.map((s) => ({
        id: s.id,
        detail: s.detail || "",
        time: s.start_time || "",
        user: s.caregiver,
        type: "sleep" as const,
        date: s.date,
        created_at: s.created_at,
      }));

      // Combine all activities and sort by date + time (most recent first)
      const allActivities = [
        ...feedActivities,
        ...diaperActivities,
        ...sleepActivities,
      ];
      allActivities.sort((a, b) => {
        // Create datetime strings for comparison
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return dateTimeB.localeCompare(dateTimeA);
      });

      return allActivities;
    },
    enabled: !!selectedBaby,
  });

  const fullName = profile?.full_name || "";
  const data = activities;

  // Check for overdue activities
  const feedReminderEnabled = preferences?.feed_reminders ?? true;
  const feedReminderInterval = preferences?.feed_reminder_interval || 3;
  const diaperAlertEnabled = preferences?.diaper_alerts ?? true;
  const diaperAlertInterval = preferences?.diaper_alert_interval || 3;

  const lastFeed = data.find((a) => a.type === "feed");
  const lastDiaper = data.find((a) => a.type === "diaper");

  const getHoursSince = (activity: ActivityItem | undefined) => {
    if (!activity) return Infinity;
    const now = new Date();
    const activityDate = new Date(`${activity.date}T${activity.time}`);
    return (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
  };

  const hoursSinceLastFeed = getHoursSince(lastFeed);
  const hoursSinceLastDiaper = getHoursSince(lastDiaper);

  const showFeedReminder =
    !loadingPreferences &&
    !loadingActivities &&
    feedReminderEnabled &&
    hoursSinceLastFeed >= feedReminderInterval;
  const showDiaperAlert =
    !loadingPreferences &&
    !loadingActivities &&
    diaperAlertEnabled &&
    hoursSinceLastDiaper >= diaperAlertInterval;

  const getFeedReminderMessage = () => {
    const hours = Math.floor(hoursSinceLastFeed);
    if (hours === Infinity)
      return `No feed recorded yet for ${
        selectedBaby?.name || "Baby"
      }. Time for a feed!`;
    return `${selectedBaby?.name || "Baby"} hasn't been fed in ${hours} ${
      hours === 1 ? "hour" : "hours"
    }. Time for a feed!`;
  };

  const getDiaperAlertMessage = () => {
    const hours = Math.floor(hoursSinceLastDiaper);
    if (hours === Infinity)
      return `No diaper change recorded yet for ${
        selectedBaby?.name || "Baby"
      }. Time for a check!`;
    return `${
      selectedBaby?.name || "Baby"
    }'s diaper hasn't been changed in ${hours} ${
      hours === 1 ? "hour" : "hours"
    }. Time for a check!`;
  };

  const uniqueDates = [...new Set(data.map((a) => a.date))];

  const filteredData = data.filter((item) => {
    const matchesDate = !dateFilter || item.date === dateFilter;
    const matchesType = !typeFilter || item.type === typeFilter;
    return matchesDate && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleDateFilterChange = (date: string) => {
    setDateFilter(date);
    setCurrentPage(1);
    setShowDateDropdown(false);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setCurrentPage(1);
    setShowTypeDropdown(false);
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (!selectedBaby || selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      // Group selected activities by type
      const feedIds: string[] = [];
      const diaperIds: string[] = [];
      const sleepIds: string[] = [];

      selectedIds.forEach((id) => {
        const activity = data.find((a) => a.id === id);
        if (activity) {
          if (activity.type === "feed") feedIds.push(id);
          else if (activity.type === "diaper") diaperIds.push(id);
          else if (activity.type === "sleep") sleepIds.push(id);
        }
      });

      // Delete each type separately
      await Promise.all([
        feedIds.length > 0 ? deleteFeeds(feedIds) : Promise.resolve(),
        diaperIds.length > 0 ? deleteDiapers(diaperIds) : Promise.resolve(),
        sleepIds.length > 0 ? deleteSleeps(sleepIds) : Promise.resolve(),
      ]);

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["activities"] });

      // Clear selection and close modal
      setSelectedIds(new Set());
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete activities:", error);
      alert("Failed to delete activities. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate stats from real data
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
  const todayActivities = data.filter((a) => a.date === today);
  const todayFeeds = todayActivities.filter((a) => a.type === "feed");
  const todayDiapers = todayActivities.filter((a) => a.type === "diaper");
  const todaySleeps = todayActivities.filter((a) => a.type === "sleep");

  // Total feeds count
  const totalFeedsCount = todayFeeds.length;

  // Total feeds volume (we need to fetch actual feeds data for amounts)
  const totalFeedsRecorded = data.filter((a) => a.type === "feed").length;

  // Total diapers count
  const totalDiapersCount = todayDiapers.length;

  // Total diapers recorded
  const totalDiapersRecorded = data.filter((a) => a.type === "diaper").length;

  // Total sleep hours (we need to calculate from sleep durations)
  const totalSleepLogs = todaySleeps.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <IconDashboard className="w-5 h-5" />
        </Link>
        <span>/</span>
        <span className="text-gray-900">Dashboard</span>
      </div>

      {/* Pending Invites */}
      <PendingInvites />

      {/* Notification Banners */}
      {showFeedReminder && (
        <NotificationBanner message={getFeedReminderMessage()} type="feed" />
      )}
      {showDiaperAlert && (
        <NotificationBanner message={getDiaperAlertMessage()} type="diaper" />
      )}

      <div className="space-y-1">
        {loadingProfile ? (
          <>
            <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 w-80 bg-gray-200 rounded-lg animate-pulse"></div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {fullName
                ? `Welcome back, ${fullName.split(" ")[0]}`
                : "Overview"}
            </h2>
            <p className="text-gray-500 text-base">
              Track and manage{" "}
              {selectedBaby ? `${selectedBaby.name}'s` : "your baby's"} daily
              activities
            </p>
          </>
        )}
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <Link
          to="/feed"
          className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 cursor-pointer ${
            colorScheme.id === "default"
              ? "bg-white border-gray-100"
              : `${colorScheme.cardBg} ${colorScheme.cardBgHover} border-transparent`
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
              colorScheme.id === "default"
                ? "bg-gray-50 border border-gray-100"
                : "bg-white/20"
            }`}
          >
            <IconBottle
              className={`w-7 h-7 ${
                colorScheme.id === "default" ? "text-gray-700" : "text-white"
              }`}
            />
          </div>
          <p
            className={`text-sm font-medium mb-2 ${
              colorScheme.id === "default" ? "text-gray-500" : "text-white/80"
            }`}
          >
            Total Feeds Today
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold tracking-tight ${
                colorScheme.id === "default" ? "text-gray-900" : "text-white"
              }`}
            >
              {totalFeedsCount}
            </span>
            <span
              className={`text-xl font-medium ${
                colorScheme.id === "default" ? "text-gray-400" : "text-white/70"
              }`}
            >
              Feeds
            </span>
          </div>
          <p
            className={`text-sm mt-2 ${
              colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
            }`}
          >
            {totalFeedsRecorded} feeds recorded total
          </p>
        </Link>

        {/* Card 2 */}
        <Link
          to="/diaper"
          className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 cursor-pointer ${
            colorScheme.id === "default"
              ? "bg-white border-gray-100"
              : `${colorScheme.cardBg} ${colorScheme.cardBgHover} border-transparent`
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
              colorScheme.id === "default"
                ? "bg-gray-50 border border-gray-100"
                : "bg-white/20"
            }`}
          >
            <IconDiaper
              className={`w-7 h-7 ${
                colorScheme.id === "default" ? "text-gray-700" : "text-white"
              }`}
            />
          </div>
          <p
            className={`text-sm font-medium mb-2 ${
              colorScheme.id === "default" ? "text-gray-500" : "text-white/80"
            }`}
          >
            Total Diapers Today
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold tracking-tight ${
                colorScheme.id === "default" ? "text-gray-900" : "text-white"
              }`}
            >
              {totalDiapersCount}
            </span>
            <span
              className={`text-xl font-medium ${
                colorScheme.id === "default" ? "text-gray-400" : "text-white/70"
              }`}
            >
              Changes
            </span>
          </div>
          <p
            className={`text-sm mt-2 ${
              colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
            }`}
          >
            {totalDiapersRecorded} diaper changes recorded total
          </p>
        </Link>

        {/* Card 3 */}
        <Link
          to="/sleep"
          className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 cursor-pointer ${
            colorScheme.id === "default"
              ? "bg-white border-gray-100"
              : `${colorScheme.cardBg} ${colorScheme.cardBgHover} border-transparent`
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
              colorScheme.id === "default"
                ? "bg-gray-50 border border-gray-100"
                : "bg-white/20"
            }`}
          >
            <IconMoon
              className={`w-7 h-7 ${
                colorScheme.id === "default" ? "text-gray-700" : "text-white"
              }`}
            />
          </div>
          <p
            className={`text-sm font-medium mb-2 ${
              colorScheme.id === "default" ? "text-gray-500" : "text-white/80"
            }`}
          >
            Total Sleep Today
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold tracking-tight ${
                colorScheme.id === "default" ? "text-gray-900" : "text-white"
              }`}
            >
              {totalSleepLogs}
            </span>
            <span
              className={`text-xl font-medium ${
                colorScheme.id === "default" ? "text-gray-400" : "text-white/70"
              }`}
            >
              Naps
            </span>
          </div>
          <p
            className={`text-sm mt-2 ${
              colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
            }`}
          >
            {todaySleeps.length} sleep logs today
          </p>
        </Link>
      </div>

      {/* List / Table Section */}
      <div className="space-y-6 pt-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search activity logs..."
              className="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-gray-100 outline-none shadow-sm placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => {
                setShowDateDropdown(!showDateDropdown);
                setShowTypeDropdown(false);
              }}
              className={`flex items-center gap-2 px-4 py-3 bg-white border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm ${
                dateFilter ? "border-gray-900" : "border-gray-200"
              }`}
            >
              <IconCalendar className="w-5 h-5 text-gray-400" />
              {dateFilter || "Show by date"}
            </button>
            {showDateDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={() => handleDateFilterChange("")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl"
                >
                  All dates
                </button>
                {uniqueDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateFilterChange(date)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-xl"
                  >
                    {date}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowDateDropdown(false);
              }}
              className={`flex items-center gap-2 px-4 py-3 bg-white border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm ${
                typeFilter ? "border-gray-900" : "border-gray-200"
              }`}
            >
              <IconFilter className="w-5 h-5 text-gray-400" />
              {typeFilter
                ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)
                : "Type"}
            </button>
            {showTypeDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => handleTypeFilterChange("")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl"
                >
                  All types
                </button>
                {["feed", "diaper", "sleep"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilterChange(type)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-xl capitalize"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Button + Table Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activities
          </h3>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete ({selectedIds.size})
              </button>
            )}
            <Link
              to="/activity/new"
              className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                colorScheme.id === "default"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
              }`}
            >
              <span className="text-lg leading-none">+</span>
              Add Activity
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-transparent">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200/60 mb-2">
            <div className="col-span-1"></div>
            <div className="col-span-2 flex items-center gap-2">Type</div>
            <div className="col-span-4 flex items-center gap-2">Details</div>
            <div className="col-span-3 flex items-center gap-2">Time</div>
            <div className="col-span-2 flex items-center gap-2">Caregiver</div>
          </div>

          <div className="space-y-2">
            {loadingActivities ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-pulse">Loading activities...</div>
              </div>
            ) : filteredData.length > 0 ? (
              paginatedData.map((item) => (
                <ActivityRow
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  detail={item.detail}
                  time={item.time}
                  user={item.user}
                  date={item.date}
                  selected={selectedIds.has(item.id)}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {data.length === 0
                  ? "No activities logged yet. Click 'Add Activity' to get started."
                  : "No activities match the selected filters"}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center pt-6 border-t border-gray-200/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? colorScheme.id === "default"
                              ? "bg-gray-900 text-white"
                              : `${colorScheme.cardBg} text-white`
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Activities
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "activity" : "activities"}? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
