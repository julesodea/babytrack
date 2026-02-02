import { useState, useEffect, useRef } from "react";
import { IconCalendar, IconChevronDown } from "./icons";
import { useColorScheme } from "../context/ColorSchemeContext";
import {
  parseDateString,
  formatDateString,
  getDaysInMonth,
  MONTH_NAMES,
} from "../utils/dateTime";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  required = false,
  id,
}: DatePickerProps) {
  const { colorScheme } = useColorScheme();
  const { month, day, year } = parseDateString(value);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedDay, setSelectedDay] = useState(day);
  const [selectedYear, setSelectedYear] = useState(year);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update local state when value prop changes
  useEffect(() => {
    const parsed = parseDateString(value);
    setSelectedMonth(parsed.month);
    setSelectedDay(parsed.day);
    setSelectedYear(parsed.year);
  }, [value]);

  // Get days for the selected month/year
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  // Handle month change
  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    const maxDays = getDaysInMonth(newMonth, selectedYear);
    const adjustedDay = selectedDay > maxDays ? maxDays : selectedDay;
    setSelectedDay(adjustedDay);
    onChange(formatDateString(newMonth, adjustedDay, selectedYear));
  };

  // Handle day change
  const handleDayChange = (newDay: number) => {
    setSelectedDay(newDay);
    onChange(formatDateString(selectedMonth, newDay, selectedYear));
  };

  // Handle year change
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    const maxDays = getDaysInMonth(selectedMonth, newYear);
    const adjustedDay = selectedDay > maxDays ? maxDays : selectedDay;
    setSelectedDay(adjustedDay);
    onChange(formatDateString(selectedMonth, adjustedDay, newYear));
  };

  // Generate year options (current year - 1 to current year + 1)
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  // Generate day options
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Format display value
  const displayValue = `${MONTH_NAMES[selectedMonth - 1]} ${selectedDay}, ${selectedYear}`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 pl-10 border border-gray-200 rounded-lg text-sm transition-all bg-white hover:border-gray-300 cursor-pointer ${
          isOpen ? "ring-2 ring-gray-200 border-gray-300" : ""
        }`}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <IconCalendar className="w-4 h-4 text-gray-400" />
        </div>
        <span className="flex-1 text-left text-gray-900">{displayValue}</span>
        <IconChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
            <div className="space-y-3">
              {/* Month Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Month
                </label>
                <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                  {MONTH_NAMES.map((monthName, index) => (
                    <button
                      key={index + 1}
                      type="button"
                      onClick={() => handleMonthChange(index + 1)}
                      className={`px-3 py-2 text-sm text-center rounded-md transition-colors ${
                        selectedMonth === index + 1
                          ? `${colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg} text-white`
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {monthName.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Day
                </label>
                <div className="grid grid-cols-7 gap-1 max-h-32 overflow-y-auto">
                  {days.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDayChange(d)}
                      className={`px-2 py-2 text-sm text-center rounded-md transition-colors ${
                        selectedDay === d
                          ? `${colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg} text-white`
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Year
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleYearChange(y)}
                      className={`px-3 py-2 text-sm text-center rounded-md transition-colors ${
                        selectedYear === y
                          ? `${colorScheme.id === "default" ? "bg-gray-900" : colorScheme.cardBg} text-white`
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
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
