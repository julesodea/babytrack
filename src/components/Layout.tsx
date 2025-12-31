import { useState } from "react";
import { Outlet } from "react-router";
import { NavItem } from "./NavItem";
import {
  IconBottle,
  IconChevronDown,
  IconClose,
  IconDashboard,
  IconDiaper,
  IconFilter,
  IconMenu,
  IconMoon,
  IconSearch,
  IconUser,
} from "./icons";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <IconBottle className="w-4 h-4" />
          </div>
          <h1 className="text-sm font-bold text-gray-900">Baby Tracker</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? (
            <IconClose className="w-6 h-6 text-gray-600" />
          ) : (
            <IconMenu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- Sidebar --- */}
      <aside
        className={`w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full z-40 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Profile / Account Switcher */}
        <div className="p-4 lg:mt-0">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white shadow-sm">
                <IconBottle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">
                  Baby Tracker
                </h3>
                <p className="text-xs text-gray-500 group-hover:text-gray-700">
                  Free Account
                </p>
              </div>
            </div>
            <IconChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Sidebar Search */}
        <div className="px-4 mb-2">
          <div className="relative">
            <IconSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search anything"
              className="w-full bg-gray-50 text-sm pl-9 pr-8 py-2 rounded-lg border-none focus:ring-2 focus:ring-gray-200 outline-none text-gray-600 placeholder-gray-400 transition-all hover:bg-gray-100 focus:bg-white"
            />
            <span className="hidden sm:block absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold border border-gray-200 rounded px-1">
              ⌘K
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 space-y-1 py-4 overflow-y-auto">
          <NavItem
            to="/"
            icon={<IconDashboard className="w-5 h-5" />}
            label="Dashboard"
            onClick={() => setSidebarOpen(false)}
          />
          <NavItem
            to="/feed"
            icon={<IconBottle className="w-5 h-5" />}
            label="Feed Logs"
            onClick={() => setSidebarOpen(false)}
          />
          <NavItem
            to="/diaper"
            icon={<IconDiaper className="w-5 h-5" />}
            label="Diaper"
            onClick={() => setSidebarOpen(false)}
          />
          <NavItem
            to="/sleep"
            icon={<IconMoon className="w-5 h-5" />}
            label="Sleep"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="pt-6 pb-2 px-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Settings
            </p>
          </div>
          <NavItem
            to="/settings"
            icon={<IconFilter className="w-5 h-5" />}
            label="Preferences"
            onClick={() => setSidebarOpen(false)}
          />
          <NavItem
            to="/account"
            icon={<IconUser className="w-5 h-5" />}
            label="Account"
            onClick={() => setSidebarOpen(false)}
          />
        </nav>

        {/* User Profile Bottom */}
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              JP
            </div>
            <div className="text-sm font-medium text-gray-700">John Parent</div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-72 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
