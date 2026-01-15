import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { NavItem } from "./NavItem";
import { BabySelector } from "./BabySelector";
import { useColorScheme } from "../context/ColorSchemeContext";
import { useAuth } from "../contexts/AuthContext";
import {
  IconBottle,
  IconClose,
  IconDashboard,
  IconDiaper,
  IconFilter,
  IconMenu,
  IconMoon,
  IconSearch,
} from "./icons";

export function Layout() {
  const navigate = useNavigate();
  const { colorScheme } = useColorScheme();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  // Command+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        navigate("/search");
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg
            }`}
          >
            <IconBottle className="w-4 h-4" />
          </div>
          <h1 className="text-sm font-bold text-gray-900">Baby Track</h1>
        </Link>
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
        {/* Baby Selector */}
        <BabySelector />

        {/* Navigation Links */}
        <nav className="flex-1 px-2 space-y-1 py-4 overflow-y-auto">
          <NavItem
            to="/"
            icon={<IconDashboard className="w-5 h-5" />}
            label="Dashboard"
            onClick={() => setSidebarOpen(false)}
          />
          <NavItem
            to="/search"
            icon={<IconSearch className="w-5 h-5" />}
            label="Search"
            badge="⌘K"
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
            to="/profile"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
            label="Profile"
            onClick={() => setSidebarOpen(false)}
          />
          <NavItem
            to="/settings"
            icon={<IconFilter className="w-5 h-5" />}
            label="Preferences"
            onClick={() => setSidebarOpen(false)}
          />
        </nav>

        {/* User Profile Bottom */}
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {initials}
                </div>
              )}
              <div className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {displayName}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Sign out
            </button>
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
