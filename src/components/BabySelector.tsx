import { useState } from "react";
import { Link } from "react-router";
import { useBaby } from "../contexts/BabyContext";
import { IconChevronDown } from "./icons";
import { useColorScheme } from "../context/ColorSchemeContext";

export function BabySelector() {
  const { babies, selectedBaby, setSelectedBaby } = useBaby();
  const { colorScheme } = useColorScheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (babies.length === 0) {
    return (
      <div className="p-4">
        <Link
          to="/babies/new"
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed hover:bg-gray-50 transition-colors ${colorScheme.id === "default" ? "border-gray-300" : "border-gray-400"
            }`}
        >
          <span className="text-lg">+</span>
          <span className="text-sm font-medium">Add Your First Baby</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200 group"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-[100px] flex items-center justify-center text-white shadow-sm ${colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg
              }`}
          >
            {selectedBaby?.avatar_url ? (
              <img
                src={selectedBaby.avatar_url}
                alt={selectedBaby.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <span className="text-lg font-semibold">
                {selectedBaby?.name[0] || "?"}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 leading-tight text-left">
              {selectedBaby?.name || "Select Baby"}
            </h3>
          </div>
        </div>
        <IconChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            <div className="max-h-64 overflow-y-auto">
              {babies.map((baby) => (
                <button
                  key={baby.id}
                  onClick={() => {
                    setSelectedBaby(baby);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${baby.id === selectedBaby?.id ? "bg-gray-50" : ""
                    }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {baby.avatar_url ? (
                      <img
                        src={baby.avatar_url}
                        alt={baby.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      baby.name[0]
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {baby.name}
                    </div>
                    {baby.birth_date && (
                      <div className="text-xs text-gray-500">
                        Born {baby.birth_date}
                      </div>
                    )}
                  </div>
                  {baby.id === selectedBaby?.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 p-2">
              <Link
                to="/babies/new"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center justify-start gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                <span className="text-lg">+</span>
                Add New Baby
              </Link>
              <Link
                to="/babies/manage"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center justify-start gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Manage Babies & Sharing
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
