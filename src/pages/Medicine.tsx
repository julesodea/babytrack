import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconPill,
  IconCalendar,
  IconDashboard,
  IconSearch,
} from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";
import { Pagination } from "../components/Pagination";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useBaby } from "../contexts/BabyContext";
import { getMedicines, deleteMedicines } from "../lib/api/medicines";

export function Medicine() {
  const { colorScheme } = useColorScheme();
  const { selectedBaby } = useBaby();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
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

  // Query for medicines
  const { data = [], isLoading: loading } = useQuery({
    queryKey: ["medicines", selectedBaby?.id],
    queryFn: () => getMedicines(selectedBaby!.id),
    enabled: !!selectedBaby,
  });

  // Mutation for deleting medicines
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteMedicines(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines", selectedBaby?.id] });
      queryClient.invalidateQueries({
        queryKey: ["activities", selectedBaby?.id],
      });
      setSelectedIds(new Set());
      setShowDeleteModal(false);
    },
  });

  const filteredData = data.filter((item) => {
    const matchesDate = !dateFilter || item.date === dateFilter;
    const matchesSearch =
      !searchQuery ||
      item.medicine_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dosage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caregiver?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes &&
        item.notes.trim() &&
        item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDate && matchesSearch;
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
  const selectedDateMedicines = data.filter((m) => m.date === statsDate);
  const totalMedicines = selectedDateMedicines.length;
  const lastMedicine = selectedDateMedicines.length > 0 ? selectedDateMedicines[0] : null;

  const uniqueDates = [...new Set(data.map((m) => m.date))].sort().reverse();

  // Calculate last 7 days data for graph
  const getLast7DaysData = () => {
    const days = [];
    const counts = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const dayMedicines = data.filter((m) => m.date === dateStr);

      days.push(dateStr.slice(5)); // MM-DD format
      counts.push(dayMedicines.length);
    }

    const maxCount = Math.max(...counts, 1);

    return { days, counts, maxCount };
  };

  const graphData = getLast7DaysData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full lg:-translate-y-16">
        <IconPill className="w-8 h-8 text-gray-400 animate-pulse" />
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
        <IconPill className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Medicine Logs</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Medicine Logs
        </h2>
        <p className="text-gray-500 text-base">
          Track medicine administered to your baby
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
          to="/medicine/new"
          className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${colorScheme.id === "default"
              ? "bg-gray-900 hover:bg-gray-800"
              : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
            }`}
        >
          <span className="text-lg leading-none">+</span>
          Add Medicine
        </Link>
      </div>

      {/* Cards Section */}
      {viewMode === "stats" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 - Total Medicines */}
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
              <IconPill
                className={`w-7 h-7 ${colorScheme.id === "default" ? "text-gray-700" : "text-white"
                  }`}
              />
            </div>
            <p
              className={`text-sm font-medium mb-2 ${colorScheme.id === "default" ? "text-gray-500" : "text-white/80"
                }`}
            >
              Total Medicines {statsDate === today ? "Today" : `on ${statsDate}`}
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-semibold tracking-tight ${colorScheme.id === "default" ? "text-gray-900" : "text-white"
                  }`}
              >
                {totalMedicines}
              </span>
              <span
                className={`text-xl font-medium ${colorScheme.id === "default"
                    ? "text-gray-400"
                    : "text-white/70"
                  }`}
              >
                Doses
              </span>
            </div>
            {selectedDateMedicines.length > 0 && (
              <div className={`text-sm mt-3 space-y-1 ${colorScheme.id === "default" ? "text-gray-400" : "text-white/60"}`}>
                {selectedDateMedicines.slice(0, 3).map((m) => (
                  <p key={m.id}>{m.medicine_name} - {m.dosage}</p>
                ))}
                {selectedDateMedicines.length > 3 && (
                  <p>+{selectedDateMedicines.length - 3} more</p>
                )}
              </div>
            )}
          </div>

          {/* Card 2 - Last Medicine */}
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
              Last Medicine
            </p>
            {lastMedicine ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-semibold tracking-tight ${colorScheme.id === "default"
                        ? "text-gray-900"
                        : "text-white"
                      }`}
                  >
                    {lastMedicine.time.split(" ")[0]}
                  </span>
                  <span
                    className={`text-xl font-medium ${colorScheme.id === "default"
                        ? "text-gray-400"
                        : "text-white/70"
                      }`}
                  >
                    {lastMedicine.time.split(" ")[1] || ""}
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${colorScheme.id === "default"
                      ? "text-gray-400"
                      : "text-white/60"
                    }`}
                >
                  {lastMedicine.medicine_name} - {lastMedicine.dosage}
                </p>
              </>
            ) : (
              <p
                className={`text-lg ${colorScheme.id === "default"
                    ? "text-gray-400"
                    : "text-white/60"
                  }`}
              >
                No medicines logged yet
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Graph Card: Medicine Count */}
          <div
            className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${colorScheme.id === "default"
                ? "bg-white border-gray-100"
                : `${colorScheme.cardBg} border-transparent`
              }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <IconPill
                className={`w-6 h-6 ${colorScheme.id === "default" ? "text-gray-700" : "text-white"
                  }`}
              />
              <h3
                className={`text-base font-semibold ${colorScheme.id === "default" ? "text-gray-900" : "text-white"
                  }`}
              >
                Medicine Count - 7 Days
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
                    <div
                      className={`h-8 rounded-md transition-all ${colorScheme.id === "default"
                          ? "bg-gray-600"
                          : "bg-white/30"
                        }`}
                      style={{
                        width: `${(graphData.counts[i] / graphData.maxCount) * 100
                          }%`,
                        minWidth: graphData.counts[i] > 0 ? "24px" : "0px",
                      }}
                    ></div>
                    <span
                      className={`text-sm font-semibold min-w-[24px] ${colorScheme.id === "default"
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
              placeholder="Search medicine logs..."
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
          </div>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medicine History</h3>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete ({selectedIds.size})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-transparent">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200/60 mb-2">
            <div className="col-span-1"></div>
            <div className="col-span-3 flex items-center gap-2">Medicine</div>
            <div className="col-span-2 flex items-center gap-2">Dosage</div>
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
                  type="medicine"
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
                <p className="text-lg font-medium mb-2">No medicines logged yet</p>
                <p className="text-sm">
                  Click "Add Medicine" to log your first medicine entry
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
              Delete Medicines
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "medicine" : "medicines"}? This action cannot be
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
