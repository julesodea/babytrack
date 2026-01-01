import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useColorScheme } from "../context/ColorSchemeContext";

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export function NavItem({ to, icon, label, onClick }: NavItemProps) {
  const location = useLocation();
  const { colorScheme } = useColorScheme();
  const isActive = location.pathname === to;

  const activeClasses =
    colorScheme.id === "default"
      ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-100"
      : `${colorScheme.cardBg} text-white shadow-sm`;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mx-2 ${
        isActive
          ? activeClasses
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <span
        className={
          isActive
            ? colorScheme.id === "default"
              ? "text-gray-800"
              : "text-white"
            : "text-gray-400 group-hover:text-gray-600"
        }
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
