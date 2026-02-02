import { useState, useEffect, useRef } from "react";
import { IconClock, IconChevronDown } from "./icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import { parseTimeString, formatTimeString } from "../utils/dateTime";

interface TimePickerProps {
  value: string; // HH:MM (24-hour)
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export function TimePicker({
  value,
  onChange,
  required = false,
  disabled = false,
  id,
}: TimePickerProps) {
  const { colorScheme } = useColorScheme();
  const { hour, minute, period } = parseTimeString(value);
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(period);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update local state when value prop changes
  useEffect(() => {
    const parsed = parseTimeString(value);
    setSelectedHour(parsed.hour);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
  }, [value]);

  // Handle hour change
  const handleHourChange = (newHour: number) => {
    setSelectedHour(newHour);
    onChange(formatTimeString(newHour, selectedMinute, selectedPeriod));
  };

  // Handle minute change
  const handleMinuteChange = (newMinute: number) => {
    setSelectedMinute(newMinute);
    onChange(formatTimeString(selectedHour, newMinute, selectedPeriod));
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setSelectedPeriod(newPeriod);
    onChange(formatTimeString(selectedHour, selectedMinute, newPeriod));
  };

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate minute options (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Format display value
  const displayValue = `${selectedHour}:${String(selectedMinute).padStart(2, "0")} ${selectedPeriod}`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2.5 pl-10 border border-gray-200 rounded-lg text-sm transition-all ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-500"
            : "bg-white hover:border-gray-300 cursor-pointer"
        } ${isOpen ? "ring-2 ring-gray-200 border-gray-300" : ""}`}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <IconClock className="w-4 h-4 text-gray-400" />
        </div>
        <span className="flex-1 text-left text-gray-900">{displayValue}</span>
        <IconChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
            <div className="space-y-3">
              {/* Hour Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Hour
                </label>
                <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHourChange(h)}
                      className={`px-2 py-2 text-sm text-center rounded-md transition-colors ${
                        selectedHour === h
                          ? `${colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg} text-white`
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Minute
                </label>
                <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMinuteChange(m)}
                      className={`py-2 text-xs text-center rounded-md transition-colors ${
                        selectedMinute === m
                          ? `${colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg} text-white`
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Period
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePeriodChange("AM")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      selectedPeriod === "AM"
                        ? `${colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg} text-white`
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodChange("PM")}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      selectedPeriod === "PM"
                        ? `${colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg} text-white`
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Done button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`w-full mt-3 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                colorScheme.id === "default"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
              }`}
            >
              Done
            </button>
          </div>
        </>
      )}

      {id && <input type="hidden" id={id} value={value} required={required} />}
    </div>
  );
}
