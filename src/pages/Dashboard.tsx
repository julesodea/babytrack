import { useState } from "react";
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
import { useColorScheme } from "../context/ColorSchemeContext";

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  user: string;
  type: "feed" | "diaper" | "sleep";
  date: string;
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    title: "Morning Feed",
    detail: "150ml Formula",
    time: "08:30 AM",
    user: "Mum",
    type: "feed",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Diaper Change",
    detail: "Wet",
    time: "10:15 AM",
    user: "Dad",
    type: "diaper",
    date: "2024-01-15",
  },
  {
    id: "3",
    title: "Afternoon Nap",
    detail: "2 hours",
    time: "01:00 PM",
    user: "Other",
    type: "sleep",
    date: "2024-01-15",
  },
  {
    id: "4",
    title: "Evening Feed",
    detail: "180ml Formula",
    time: "06:45 PM",
    user: "Mum",
    type: "feed",
    date: "2024-01-14",
  },
];

export function Dashboard() {
  const { colorScheme } = useColorScheme();
  const [data, setData] = useState<ActivityItem[]>(activityData);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconDashboard className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Dashboard</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Overview
        </h2>
        <p className="text-gray-500 text-base">
          Track and manage your baby's daily activities
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
              850
            </span>
            <span
              className={`text-xl font-medium ${
                colorScheme.id === "default" ? "text-gray-400" : "text-white/70"
              }`}
            >
              ml
            </span>
          </div>
          <p
            className={`text-sm mt-2 ${
              colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
            }`}
          >
            123 feeds recorded total
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
              14
            </span>
            <span
              className={`text-xl font-medium ${
                colorScheme.id === "default" ? "text-gray-400" : "text-white/70"
              }`}
            >
              hrs
            </span>
          </div>
          <p
            className={`text-sm mt-2 ${
              colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
            }`}
          >
            12 sleep logs total
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
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <ActivityRow
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  detail={item.detail}
                  time={item.time}
                  user={item.user}
                  selected={selectedIds.has(item.id)}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activities match the selected filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
