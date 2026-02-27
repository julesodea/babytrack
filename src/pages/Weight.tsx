import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconScale,
  IconCalendar,
  IconDashboard,
  IconSearch,
} from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";
import { Pagination } from "../components/Pagination";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useBaby } from "../contexts/BabyContext";
import { getWeights, deleteWeights } from "../lib/api/weights";

export function Weight() {
  const { colorScheme } = useColorScheme();
  const { selectedBaby } = useBaby();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"stats" | "graph">("stats");
  const itemsPerPage = 24;

  const { data = [], isLoading: loading } = useQuery({
    queryKey: ["weights", selectedBaby?.id],
    queryFn: () => getWeights(selectedBaby!.id),
    enabled: !!selectedBaby,
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteWeights(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weights", selectedBaby?.id] });
      setSelectedIds(new Set());
      setShowDeleteModal(false);
    },
  });

  // Sort chronologically (oldest first) for stats and graph
  const chronological = [...data].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.time < b.time ? -1 : 1;
  });

  const latestEntry = chronological[chronological.length - 1] ?? null;
  const totalGain =
    chronological.length >= 2
      ? (() => {
          const first = chronological[0];
          const last = chronological[chronological.length - 1];
          if (first.unit === last.unit) {
            return {
              value: parseFloat(last.value) - parseFloat(first.value),
              unit: last.unit,
            };
          }
          return null;
        })()
      : null;

  // Graph: up to last 10 entries with the same unit as the latest
  const graphEntries = latestEntry
    ? chronological
        .filter((e) => e.unit === latestEntry.unit)
        .slice(-10)
    : [];

  const graphValues = graphEntries.map((e) => parseFloat(e.value));
  const minVal = graphValues.length > 0 ? Math.min(...graphValues) : 0;
  const maxVal = graphValues.length > 0 ? Math.max(...graphValues) : 1;
  const range = maxVal - minVal;

  const barHeightPct = (val: number) => {
    if (range === 0) return 70;
    return 15 + ((val - minVal) / range) * 80;
  };

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.value.toLowerCase().includes(q) ||
      item.unit.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(Array.from(selectedIds));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full lg:-translate-y-16">
        <IconScale className="w-8 h-8 text-gray-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
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
        <IconScale className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Weight</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Weight
        </h2>
        <p className="text-gray-500 text-base">
          Track your baby's weight and growth over time
        </p>
      </div>

      {/* View Toggle + Add Button */}
      <div className="flex items-center justify-between flex-wrap gap-y-3">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("stats")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "stats"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setViewMode("graph")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "graph"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Graph
          </button>
        </div>
        <Link
          to="/weight/new"
          className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
            colorScheme.id === "default"
              ? "bg-gray-900 hover:bg-gray-800"
              : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
          }`}
        >
          <span className="text-lg leading-none">+</span>
          Add Weight
        </Link>
      </div>

      {/* Stats Cards */}
      {viewMode === "stats" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latest Weight */}
          <div
            className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${
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
              <IconScale
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
              Latest Weight
            </p>
            {latestEntry ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-semibold tracking-tight ${
                      colorScheme.id === "default" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {latestEntry.value}
                  </span>
                  <span
                    className={`text-xl font-medium ${
                      colorScheme.id === "default" ? "text-gray-400" : "text-white/70"
                    }`}
                  >
                    {latestEntry.unit}
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${
                    colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
                  }`}
                >
                  {latestEntry.name} &mdash; {latestEntry.date}
                </p>
              </>
            ) : (
              <p
                className={`text-lg ${
                  colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
                }`}
              >
                No entries yet
              </p>
            )}
          </div>

          {/* Total Gain */}
          <div
            className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${
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
              Total Gain
            </p>
            {totalGain ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-semibold tracking-tight ${
                      colorScheme.id === "default" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {totalGain.value >= 0 ? "+" : ""}
                    {totalGain.value.toFixed(3).replace(/\.?0+$/, "")}
                  </span>
                  <span
                    className={`text-xl font-medium ${
                      colorScheme.id === "default" ? "text-gray-400" : "text-white/70"
                    }`}
                  >
                    {totalGain.unit}
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${
                    colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
                  }`}
                >
                  Since {chronological[0]?.name} ({chronological[0]?.date})
                </p>
              </>
            ) : (
              <p
                className={`text-lg ${
                  colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
                }`}
              >
                {data.length < 2 ? "Add more entries to see gain" : "Mixed units"}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Graph View */
        <div
          className={`p-8 rounded-3xl border shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] transition-all duration-300 ${
            colorScheme.id === "default"
              ? "bg-white border-gray-100"
              : `${colorScheme.cardBg} border-transparent`
          }`}
        >
          <div className="flex items-center gap-3 mb-8">
            <IconScale
              className={`w-6 h-6 ${
                colorScheme.id === "default" ? "text-gray-700" : "text-white"
              }`}
            />
            <h3
              className={`text-base font-semibold ${
                colorScheme.id === "default" ? "text-gray-900" : "text-white"
              }`}
            >
              Weight Over Time{latestEntry ? ` (${latestEntry.unit})` : ""}
            </h3>
          </div>

          {graphEntries.length > 0 ? (
            <div className="flex items-end gap-2 h-48">
              {graphEntries.map((entry) => {
                const pct = barHeightPct(parseFloat(entry.value));
                return (
                  <div
                    key={entry.id}
                    className="flex-1 flex flex-col items-center justify-end gap-1 h-full min-w-0"
                  >
                    <span
                      className={`text-[10px] font-semibold leading-none ${
                        colorScheme.id === "default" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {entry.value}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        colorScheme.id === "default" ? "bg-gray-600" : "bg-white/30"
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                    <span
                      className={`text-[10px] truncate w-full text-center leading-none pt-1 ${
                        colorScheme.id === "default" ? "text-gray-500" : "text-white/70"
                      }`}
                    >
                      {entry.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p
              className={`text-lg ${
                colorScheme.id === "default" ? "text-gray-400" : "text-white/60"
              }`}
            >
              No entries to display
            </p>
          )}
        </div>
      )}

      {/* List Section */}
      <div className="space-y-6 pt-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search weight entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white pl-12 pr-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-gray-100 outline-none shadow-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Weight History</h3>
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
                  type="weight"
                  detail={`${item.name} · ${item.value} ${item.unit}`}
                  time={item.time}
                  user="—"
                  date={item.date}
                  selected={selectedIds.has(item.id)}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium mb-2">No weight entries yet</p>
                <p className="text-sm">
                  Click "Add Weight" to log your first entry
                </p>
              </div>
            )}
          </div>

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
              Delete Entries
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "entry" : "entries"}? This action cannot
              be undone.
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
