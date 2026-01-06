import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { IconSearch } from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";
import { useBaby } from "../contexts/BabyContext";
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

export function Search() {
  const { selectedBaby } = useBaby();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
  }, [searchQuery, setSearchParams]);

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
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return dateTimeB.localeCompare(dateTimeA);
      });

      return allActivities;
    },
    enabled: !!selectedBaby,
  });

  const filteredData = activities.filter((item) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      item.detail.toLowerCase().includes(query) ||
      item.user.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.date.includes(query) ||
      item.time.includes(query)
    );
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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Search Activities
        </h2>
        <p className="text-gray-500 text-base">
          Find activities across all logs
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <IconSearch className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by activity, caregiver, type, date, or time..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none shadow-sm placeholder-gray-400"
        />
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {searchQuery ? (
              <>
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "result" : "results"} for "
                {searchQuery}"
              </>
            ) : (
              "Enter a search term to find activities"
            )}
          </h3>
          {selectedIds.size > 0 && (
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              Clear selection
            </Link>
          )}
        </div>

        {/* Table */}
        {searchQuery && (
          <div className="bg-transparent">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200/60 mb-2">
              <div className="col-span-1"></div>
              <div className="col-span-2 flex items-center gap-2">Type</div>
              <div className="col-span-3 flex items-center gap-2">Details</div>
              <div className="col-span-2 flex items-center gap-2">Date</div>
              <div className="col-span-2 flex items-center gap-2">Time</div>
              <div className="col-span-2 flex items-center gap-2">
                Caregiver
              </div>
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
                <div className="text-center py-12 text-gray-500">
                  <div className="mb-2">
                    <IconSearch className="w-12 h-12 mx-auto text-gray-300" />
                  </div>
                  <p className="text-sm">
                    No activities found matching "{searchQuery}"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && !loadingActivities && (
          <div className="text-center py-12 text-gray-500">
            <div className="mb-4">
              <IconSearch className="w-16 h-16 mx-auto text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-700 mb-2">
              Start searching
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Search across all your baby's activities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
