import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconBottle,
  IconCalendar,
  IconDashboard,
  IconFilter,
  IconSearch,
} from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";
import { Pagination } from "../components/Pagination";
import { NotificationBanner } from "../components/NotificationBanner";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { getFeeds, deleteFeeds } from "../lib/api/feeds";
import { getPreferences } from "../lib/api/preferences";

export function Feed() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { selectedBaby } = useBaby();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Get today's date for default stats view
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
  const [statsDate, setStatsDate] = useState<string>(today);
  const [showStatsDateDropdown, setShowStatsDateDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"stats" | "graph">("stats");

  // Query for user preferences
  const { data: preferences } = useQuery({
    queryKey: ["preferences", user?.id],
    queryFn: () => getPreferences(user!.id),
    enabled: !!user,
  });

  // Query for feeds
  const { data = [], isLoading: loading } = useQuery({
    queryKey: ["feeds", selectedBaby?.id],
    queryFn: () => getFeeds(selectedBaby!.id),
    enabled: !!selectedBaby,
  });

  // Mutation for deleting feeds
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteFeeds(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds", selectedBaby?.id] });
      queryClient.invalidateQueries({
        queryKey: ["activities", selectedBaby?.id],
      });
      setSelectedIds(new Set());
      setShowDeleteModal(false);
    },
  });

  // Check for overdue feeds
  const feedReminderEnabled = preferences?.feed_reminders ?? true;
  const feedReminderInterval = preferences?.feed_reminder_interval || 3;

  const mostRecentFeed = data.length > 0 ? data[0] : undefined;

  const getHoursSince = (feed: typeof mostRecentFeed) => {
    if (!feed) return Infinity;
    const now = new Date();
    const feedDate = new Date(`${feed.date}T${feed.time}`);
    return (now.getTime() - feedDate.getTime()) / (1000 * 60 * 60);
  };

  const hoursSinceLastFeed = getHoursSince(mostRecentFeed);
  const showFeedReminder =
    feedReminderEnabled && hoursSinceLastFeed >= feedReminderInterval;

  const getFeedReminderMessage = () => {
    const hours = Math.floor(hoursSinceLastFeed);
    if (hours === Infinity)
      return `${selectedBaby?.name || "Baby"
        } hasn't been fed yet. Please check!`;
    return `${selectedBaby?.name || "Baby"} hasn't been fed in ${hours} ${hours === 1 ? "hour" : "hours"
      }. Please check!`;
  };

  const filteredData = data.filter((item) => {
    const matchesDate = !dateFilter || item.date === dateFilter;
    const matchesType = !typeFilter || item.type === typeFilter;
    const matchesSearch =
      !searchQuery ||
      item.detail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caregiver?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.amount?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes &&
        item.notes.trim() &&
        item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDate && matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
    if (!selectedBaby) return;
    deleteMutation.mutate(Array.from(selectedIds));
  };

  // Calculate stats from real data for selected date
  const selectedDateFeeds = data.filter((f) => f.date === statsDate);
  const totalFeeds = selectedDateFeeds.length;
  const totalVolume = selectedDateFeeds.reduce(
    (sum, f) => sum + (parseInt(f.amount || "0") || 0),
    0
  );
  const lastFeed = selectedDateFeeds.length > 0 ? selectedDateFeeds[0] : null;

  const uniqueDates = [...new Set(data.map((f) => f.date))].sort().reverse();

  // Calculate last 7 days data for graph
  const getLast7DaysData = () => {
    const days = [];
    const counts = [];
    const volumes = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const dayFeeds = data.filter((f) => f.date === dateStr);
      const dayVolume = dayFeeds.reduce(
        (sum, f) => sum + (parseInt(f.amount || "0") || 0),
        0
      );

      days.push(dateStr.slice(5)); // MM-DD format
      counts.push(dayFeeds.length);
      volumes.push(dayVolume);
    }

    const maxCount = Math.max(...counts, 1);
    const nonZeroVols = volumes.filter((v) => v > 0);
    const minVolume = nonZeroVols.length > 0 ? Math.min(...nonZeroVols) : 0;
    const maxVolume = Math.max(...volumes, 1);

    return { days, counts, volumes, maxCount, minVolume, maxVolume };
  };

  const graphData = getLast7DaysData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full lg:-translate-y-16">
        <IconBottle className="w-8 h-8 text-gray-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Go to dashboard"
        >
          <IconDashboard className="w-5 h-5" />
        </Link>
        <span>/</span>
        <IconBottle className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Feed Logs</span>
      </div>

      {/* Notification Banner */}
      {showFeedReminder && (
        <NotificationBanner message={getFeedReminderMessage()} type="feed" />
      )}

      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Feed Logs
        </h2>
        <p className="text-gray-500 text-base">
          Track your baby's feeding schedule and amounts
        </p>
      </div>

      {/* Date Selector for Stats + View Toggle + Add Button */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-y-3">
        <div className="flex items-center gap-3">
          {viewMode === "stats" && (
            <div className="relative">
              <button
                onClick={() => setShowStatsDateDropdown(!showStatsDateDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 shadow-sm"
              >
                <IconCalendar className="w-4 h-4 text-gray-400" />
                {statsDate === today ? "Today" : statsDate}
              </button>
              {showStatsDateDropdown && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[180px] max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setStatsDate(today);
                      setShowStatsDateDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl ${statsDate === today ? "bg-gray-100 font-medium" : ""
                      }`}
                  >
                    Today ({today})
                  </button>
                  {uniqueDates
                    .filter((d) => d !== today)
                    .map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setStatsDate(date);
                          setShowStatsDateDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-xl ${statsDate === date ? "bg-gray-100 font-medium" : ""
                          }`}
                      >
                        {date}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("stats")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "stats"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Stats
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "graph"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Graph
            </button>
          </div>
        </div>
        <Link
          to="/feed/new"
          className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${colorScheme.id === "default"
            ? "bg-gray-900 hover:bg-gray-800"
            : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
            }`}
        >
          <span className="text-lg leading-none">+</span>
          Add Feed
        </Link>
      </div>

      {/* Cards Section */}
      {viewMode === "stats" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div
            className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${colorScheme.id === "default"
              ? "bg-white border-gray-100"
              : `${colorScheme.cardBg} ${colorScheme.cardBgHover} border-transparent`
              }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorScheme.id === "default"
                ? "bg-gray-50 border border-gray-100"
                : "bg-white/20"
                }`}
            >
              <IconBottle
                className={`w-7 h-7 ${colorScheme.id === "default" ? "text-gray-700" : "text-white"
                  }`}
              />
            </div>
            <p
              className={`text-sm font-medium mb-2 ${colorScheme.id === "default" ? "text-gray-500" : "text-white/80"
                }`}
            >
              Total Feeds {statsDate === today ? "Today" : `on ${statsDate}`}
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-semibold tracking-tight ${colorScheme.id === "default" ? "text-gray-900" : "text-white"
                  }`}
              >
                {totalFeeds}
              </span>
              <span
                className={`text-xl font-medium ${colorScheme.id === "default"
                  ? "text-gray-400"
                  : "text-white/70"
                  }`}
              >
                Feeds
              </span>
            </div>
            <p
              className={`text-sm mt-2 ${colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
                }`}
            >
              {totalVolume}ml Total Volume
            </p>
          </div>

          {/* Card 2 */}
          <div
            className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${colorScheme.id === "default"
              ? "bg-white border-gray-100"
              : `${colorScheme.cardBg} ${colorScheme.cardBgHover} border-transparent`
              }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorScheme.id === "default"
                ? "bg-gray-50 border border-gray-100"
                : "bg-white/20"
                }`}
            >
              <IconCalendar
                className={`w-7 h-7 ${colorScheme.id === "default" ? "text-gray-700" : "text-white"
                  }`}
              />
            </div>
            <p
              className={`text-sm font-medium mb-2 ${colorScheme.id === "default" ? "text-gray-500" : "text-white/80"
                }`}
            >
              Last Feed
            </p>
            {lastFeed ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-semibold tracking-tight ${colorScheme.id === "default"
                      ? "text-gray-900"
                      : "text-white"
                      }`}
                  >
                    {lastFeed.time.split(" ")[0]}
                  </span>
                  <span
                    className={`text-xl font-medium ${colorScheme.id === "default"
                      ? "text-gray-400"
                      : "text-white/70"
                      }`}
                  >
                    {lastFeed.time.split(" ")[1] || ""}
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${colorScheme.id === "default"
                    ? "text-gray-400"
                    : "text-white/60"
                    }`}
                >
                  {lastFeed.detail}
                </p>
              </>
            ) : (
              <p
                className={`text-lg ${colorScheme.id === "default"
                  ? "text-gray-400"
                  : "text-white/60"
                  }`}
              >
                No feeds logged yet
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graph Card 1: Volume */}
          <div
            className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${colorScheme.id === "default"
              ? "bg-white border-gray-100"
              : `${colorScheme.cardBg} border-transparent`
              }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <IconCalendar
                className={`w-6 h-6 ${colorScheme.id === "default" ? "text-gray-700" : "text-white"
                  }`}
              />
              <h3
                className={`text-base font-semibold ${colorScheme.id === "default" ? "text-gray-900" : "text-white"
                  }`}
              >
                Volume - 7 Days
              </h3>
            </div>
            <div className="space-y-3">
              {graphData.days.map((day, i) => (
                <div key={day} className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium w-12 ${colorScheme.id === "default"
                      ? "text-gray-500"
                      : "text-white/70"
                      }`}
                  >
                    {day}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1">
                      <div
                        className={`h-8 rounded-md transition-all ${colorScheme.id === "default"
                          ? "bg-gray-400"
                          : "bg-white/30"
                          }`}
                        style={{
                          width: (() => {
                            const v = graphData.volumes[i];
                            if (v === 0) return "0%";
                            const range = graphData.maxVolume - graphData.minVolume;
                            if (range === 0) return "100%";
                            return `${20 + ((v - graphData.minVolume) / range) * 80}%`;
                          })(),
                          minWidth: graphData.volumes[i] > 0 ? "24px" : "0px",
                        }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm font-semibold w-[52px] text-right ${colorScheme.id === "default"
                        ? "text-gray-900"
                        : "text-white"
                        }`}
                    >
                      {graphData.volumes[i]}ml
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Graph Card 2: Feed Count */}
          <div
            className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${colorScheme.id === "default"
              ? "bg-white border-gray-100"
              : `${colorScheme.cardBg} border-transparent`
              }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <IconBottle
                className={`w-6 h-6 ${colorScheme.id === "default" ? "text-gray-700" : "text-white"
                  }`}
              />
              <h3
                className={`text-base font-semibold ${colorScheme.id === "default" ? "text-gray-900" : "text-white"
                  }`}
              >
                Feed Count - 7 Days
              </h3>
            </div>
            <div className="space-y-3">
              {graphData.days.map((day, i) => (
                <div key={day} className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium w-12 ${colorScheme.id === "default"
                      ? "text-gray-500"
                      : "text-white/70"
                      }`}
                  >
                    {day}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1">
                      <div
                        className={`h-8 rounded-md transition-all ${colorScheme.id === "default"
                          ? "bg-gray-600"
                          : "bg-white/30"
                          }`}
                        style={{
                          width: `${(graphData.counts[i] / graphData.maxCount) * 100}%`,
                          minWidth: graphData.counts[i] > 0 ? "24px" : "0px",
                        }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm font-semibold w-6 text-right ${colorScheme.id === "default"
                        ? "text-gray-900"
                        : "text-white"
                        }`}
                    >
                      {graphData.counts[i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List / Table Section */}
      <div className="space-y-6 pt-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search feed logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white pl-12 pr-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-gray-100 outline-none shadow-sm placeholder-gray-400"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowTypeDropdown(false);
                }}
                className={`flex items-center gap-2 h-10 px-4 bg-white border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm ${dateFilter ? "border-gray-900" : "border-gray-200"
                  }`}
              >
                <IconCalendar className="w-5 h-5 text-gray-400" />
                {dateFilter || "Show by date"}
              </button>
              {showDateDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[160px]">
                  <button
                    onClick={() => {
                      setDateFilter("");
                      setShowDateDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl"
                  >
                    All dates
                  </button>
                  {uniqueDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => {
                        setDateFilter(date);
                        setShowDateDropdown(false);
                      }}
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
                className={`flex items-center gap-2 h-10 px-4 bg-white border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm ${typeFilter ? "border-gray-900" : "border-gray-200"
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
                    onClick={() => {
                      setTypeFilter("");
                      setShowTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl"
                  >
                    All types
                  </button>
                  {["bottle", "breast", "solid"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setTypeFilter(type);
                        setShowTypeDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-xl capitalize"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Feed History</h3>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-300 bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete ({selectedIds.size})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-transparent">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200/60 mb-2">
            <div className="col-span-1"></div>
            <div className="col-span-2 flex items-center gap-2">Type</div>
            <div className="col-span-3 flex items-center gap-2">Details</div>
            <div className="col-span-2 flex items-center gap-2">Date</div>
            <div className="col-span-2 flex items-center gap-2">Time</div>
            <div className="col-span-2 flex items-center gap-2">Caregiver</div>
          </div>

          <div className="space-y-2">
            {filteredData.length > 0 ? (
              paginatedData.map((item) => (
                <ActivityRow
                  key={item.id}
                  id={item.id}
                  type="feed"
                  detail={item.detail || ""}
                  time={item.time}
                  user={item.caregiver}
                  date={item.date}
                  selected={selectedIds.has(item.id)}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No feeds logged yet</p>
                <p className="text-sm">
                  Click "Add Feed" to log your first feeding session
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Feeds
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "feed" : "feeds"}? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-300 bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
