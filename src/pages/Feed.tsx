import { Link } from "react-router";
import {
  IconBottle,
  IconCalendar,
  IconFilter,
  IconSearch,
} from "../components/icons";
import { ActivityRow } from "../components/ActivityRow";

export function Feed() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <IconBottle className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Feed Logs</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Feed Logs
        </h2>
        <p className="text-gray-500 text-base">
          Track your baby's feeding schedule and amounts
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
              6
            </span>
            <span className="text-xl text-gray-400 font-medium">feeds</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">850ml total volume</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-shadow duration-300">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
            <IconCalendar className="w-7 h-7 text-gray-700" />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">
            Last Feed
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">
              2:30
            </span>
            <span className="text-xl text-gray-400 font-medium">PM</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">180ml Formula</p>
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
              placeholder="Search feed logs..."
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

        {/* Create Button + Table Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Feed History</h3>
          <Link
            to="/feed/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Add Feed
          </Link>
        </div>

        {/* Table */}
        <div className="bg-transparent">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-200/60 mb-2">
            <div className="col-span-6 flex items-center gap-2">
              <span className="w-4 h-4 border border-gray-300 rounded mx-1"></span>
              Feed Details
            </div>
            <div className="col-span-3 flex items-center gap-2">Time</div>
            <div className="col-span-3 flex items-center gap-2">Caregiver</div>
          </div>

          <div className="space-y-2">
            <ActivityRow
              id="f1"
              title="Morning Feed"
              detail="150ml Formula - Bottle"
              time="06:30 AM"
              user="Mom"
            />
            <ActivityRow
              id="f2"
              title="Mid-Morning Feed"
              detail="120ml Breast Milk"
              time="09:15 AM"
              user="Mom"
            />
            <ActivityRow
              id="f3"
              title="Lunch Feed"
              detail="180ml Formula - Bottle"
              time="12:00 PM"
              user="Dad"
            />
            <ActivityRow
              id="f4"
              title="Afternoon Feed"
              detail="150ml Formula - Bottle"
              time="02:30 PM"
              user="Nanny"
            />
            <ActivityRow
              id="f5"
              title="Evening Feed"
              detail="180ml Formula - Bottle"
              time="06:00 PM"
              user="Mom"
            />
            <ActivityRow
              id="f6"
              title="Night Feed"
              detail="120ml Breast Milk"
              time="09:30 PM"
              user="Mom"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
