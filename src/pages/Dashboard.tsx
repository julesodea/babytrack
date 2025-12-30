import {
  IconBottle,
  IconCalendar,
  IconDashboard,
  IconFilter,
  IconMoon,
  IconSearch,
} from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";

export function Dashboard() {
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
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-shadow duration-300">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
            <IconBottle className="w-7 h-7 text-gray-700" />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">
            Total Feeds Today
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">
              850
            </span>
            <span className="text-xl text-gray-400 font-medium">ml</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">123 feeds recorded total</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-shadow duration-300">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
            <IconMoon className="w-7 h-7 text-gray-700" />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">
            Total Sleep Today
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">
              14
            </span>
            <span className="text-xl text-gray-400 font-medium">hrs</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">12 sleep logs total</p>
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
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <IconCalendar className="w-5 h-5 text-gray-400" />
            Show by date
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <IconFilter className="w-5 h-5 text-gray-400" />
            Type
          </button>
        </div>

        {/* Table */}
        <div className="bg-transparent">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200/60 mb-2">
            <div className="col-span-6 flex items-center gap-2">
              <span className="w-4 h-4 border border-gray-300 rounded mx-1"></span>
              Activity Name
            </div>
            <div className="col-span-3 flex items-center gap-2">Time</div>
            <div className="col-span-3 flex items-center gap-2">Caregiver</div>
          </div>

          <div className="space-y-2">
            <ActivityRow
              title="Morning Feed"
              detail="150ml Formula"
              time="08:30 AM"
              user="Mom"
            />
            <ActivityRow
              title="Diaper Change"
              detail="Wet"
              time="10:15 AM"
              user="Dad"
            />
            <ActivityRow
              title="Afternoon Nap"
              detail="2 hours"
              time="01:00 PM"
              user="Nanny"
            />
            <ActivityRow
              title="Evening Feed"
              detail="180ml Formula"
              time="06:45 PM"
              user="Mom"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
