import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  IconBottle,
  IconCalendar,
  IconDashboard,
  IconFilter,
  IconMoon,
  IconSearch,
} from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";
import { PendingInvites } from "../components/PendingInvites";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBaby } from "../contexts/BabyContext";
import { getProfile } from "../lib/api/profiles";
import { getFeeds } from "../lib/api/feeds";
import { getDiapers } from "../lib/api/diapers";
import { getSleeps } from "../lib/api/sleeps";

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
  const [fullName, setFullName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [data, setData] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBaby) {
      loadActivities();
    }
  }, [selectedBaby]);

  const loadProfile = async () => {
    if (!user) return;

    setLoadingProfile(true);
    try {
      const profile = await getProfile(user.id);
      if (profile && profile.full_name) {
        setFullName(profile.full_name);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadActivities = async () => {
    if (!selectedBaby) return;

    setLoadingActivities(true);
    try {
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

      // Combine all activities and sort by created_at timestamp (most recent first)
      const allActivities = [
        ...feedActivities,
        ...diaperActivities,
        ...sleepActivities,
      ];
      allActivities.sort((a, b) => b.created_at.localeCompare(a.created_at));

      setData(allActivities);
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const uniqueDates = [...new Set(data.map((a) => a.date))];

  const filteredData = data.filter((item) => {
    const matchesDate = !dateFilter || item.date === dateFilter;
    const matchesType = !typeFilter || item.type === typeFilter;
    return matchesDate && matchesType;
  });

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

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  };

  // Calculate stats from real data
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayActivities = data.filter((a) => a.date === today);
  const todayFeeds = todayActivities.filter((a) => a.type === "feed");
  const todaySleeps = todayActivities.filter((a) => a.type === "sleep");

  // Total feeds count
  const totalFeedsCount = todayFeeds.length;

  // Total feeds volume (we need to fetch actual feeds data for amounts)
  const totalFeedsRecorded = data.filter((a) => a.type === "feed").length;

  // Total sleep hours (we need to calculate from sleep durations)
  const totalSleepLogs = todaySleeps.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconDashboard className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Dashboard</span>
      </div>

      {/* Pending Invites */}
      <PendingInvites />

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
              Track and manage {selectedBaby ? `${selectedBaby.name}'s` : "your baby's"} daily activities
            </p>
          </>
        )}
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div
          className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${
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
        </div>

        {/* Card 2 */}
        <div
          className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${
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
        </div>
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
                  onClick={() => {
                    setTypeFilter("");
                    setShowTypeDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl"
                >
                  All types
                </button>
                {["feed", "diaper", "sleep"].map((type) => (
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

        {/* Create Button + Table Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activities
          </h3>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleDelete}
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
            <div className="col-span-6 flex items-center gap-2">
              Activity Name
            </div>
            <div className="col-span-3 flex items-center gap-2">Time</div>
            <div className="col-span-3 flex items-center gap-2">Caregiver</div>
          </div>

          <div className="space-y-2">
            {loadingActivities ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-pulse">Loading activities...</div>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
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
        </div>
      </div>
    </div>
  );
}
