import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  IconCalendar,
  IconFilter,
  IconMoon,
  IconSearch,
} from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getSleeps, deleteSleeps } from "../lib/api/sleeps";
import type { Sleep as SleepType } from "../types/database";

export function Sleep() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const [data, setData] = useState<SleepType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadSleeps();
    }
  }, [user]);

  const loadSleeps = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const sleeps = await getSleeps(user.id);
      setData(sleeps);
    } catch (error) {
      console.error("Failed to load sleeps:", error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueDates = [...new Set(data.map((s) => s.date))];

  const filteredData = data.filter((item) => {
    const matchesDate = !dateFilter || item.date === dateFilter;
    const matchesType = !typeFilter || item.type === typeFilter;
    const matchesSearch = !searchQuery ||
      item.detail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caregiver?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.duration?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesType && matchesSearch;
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

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteSleeps(Array.from(selectedIds));
      setData((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Failed to delete sleeps:", error);
    }
  };

  // Calculate stats from real data
  const today = new Date().toISOString().split("T")[0];
  const todaySleeps = data.filter((s) => s.date === today);
  const napCount = todaySleeps.filter((s) => s.type === "nap").length;
  const overnightCount = todaySleeps.filter(
    (s) => s.type === "overnight"
  ).length;

  // Calculate total sleep hours (simplified - just count the entries for now)
  const totalSleeps = napCount + overnightCount;
  const lastSleep = data.length > 0 ? data[0] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading sleep logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconMoon className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Sleep Logs</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Sleep Logs
        </h2>
        <p className="text-gray-500 text-base">
          Track your baby's sleep patterns and duration
        </p>
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
            Sleep Sessions Today
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold tracking-tight ${
                colorScheme.id === "default" ? "text-gray-900" : "text-white"
              }`}
            >
              {totalSleeps}
            </span>
            <span
              className={`text-xl font-medium ${
                colorScheme.id === "default" ? "text-gray-400" : "text-white/70"
              }`}
            >
              Sessions
            </span>
          </div>
          <p
            className={`text-sm mt-2 ${
              colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
            }`}
          >
            {napCount} Naps + {overnightCount} Overnight
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
            <IconCalendar
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
            Last Sleep
          </p>
          {lastSleep ? (
            <>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    colorScheme.id === "default"
                      ? "text-gray-900"
                      : "text-white"
                  }`}
                >
                  {lastSleep.start_time?.split(" ")[0] || "-"}
                </span>
                <span
                  className={`text-xl font-medium ${
                    colorScheme.id === "default"
                      ? "text-gray-400"
                      : "text-white/70"
                  }`}
                >
                  {lastSleep.start_time?.split(" ")[1] || ""}
                </span>
              </div>
              <p
                className={`text-sm mt-2 ${
                  colorScheme.id === "default"
                    ? "text-gray-400"
                    : "text-white/60"
                }`}
              >
                {lastSleep.type} - {lastSleep.duration}
              </p>
            </>
          ) : (
            <p
              className={`text-lg ${
                colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
              }`}
            >
              No sleeps logged yet
            </p>
          )}
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
              placeholder="Search sleep logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {["nap", "overnight"].map((type) => (
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
          <h3 className="text-lg font-semibold text-gray-900">Sleep History</h3>
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
              to="/sleep/new"
              className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                colorScheme.id === "default"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
              }`}
            >
              <span className="text-lg leading-none">+</span>
              Add Sleep
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-transparent">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200/60 mb-2">
            <div className="col-span-6 flex items-center gap-2">
              Sleep Details
            </div>
            <div className="col-span-3 flex items-center gap-2">Time</div>
            <div className="col-span-3 flex items-center gap-2">Caregiver</div>
          </div>

          <div className="space-y-2">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <ActivityRow
                  key={item.id}
                  id={item.id}
                  type="sleep"
                  detail={item.detail || ""}
                  time={
                    item.start_time && item.end_time
                      ? `${item.start_time} - ${item.end_time}`
                      : item.start_time || "-"
                  }
                  user={item.caregiver}
                  selected={selectedIds.has(item.id)}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No sleep logs yet</p>
                <p className="text-sm">
                  Click "Add Sleep" to log your first sleep session
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
