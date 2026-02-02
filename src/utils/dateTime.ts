// Month names for date picker
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Get current time in HH:MM format (24-hour)
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Get current date in YYYY-MM-DD format (local timezone)
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse date string (YYYY-MM-DD) into components
export function parseDateString(dateStr: string): {
  month: number;
  day: number;
  year: number;
} {
  if (!dateStr || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Invalid format, return current date
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      day: now.getDate(),
      year: now.getFullYear(),
    };
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  return { month, day, year };
}

// Format date components into YYYY-MM-DD string
export function formatDateString(
  month: number,
  day: number,
  year: number
): string {
  const monthStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}-${monthStr}-${dayStr}`;
}

// Get number of days in a given month/year
export function getDaysInMonth(month: number, year: number): number {
  // Month is 1-indexed (1 = January, 12 = December)
  return new Date(year, month, 0).getDate();
}

// Check if a date is valid
export function isValidDate(
  month: number,
  day: number,
  year: number
): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const daysInMonth = getDaysInMonth(month, year);
  return day <= daysInMonth;
}

// Parse time string (HH:MM in 24-hour) into 12-hour components
export function parseTimeString(timeStr: string): {
  hour: number;
  minute: number;
  period: "AM" | "PM";
} {
  if (!timeStr || !timeStr.match(/^\d{2}:\d{2}$/)) {
    // Invalid format, return current time
    const now = new Date();
    const hour24 = now.getHours();
    const minute = now.getMinutes();
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return { hour, minute, period };
  }

  const [hour24, minute] = timeStr.split(":").map(Number);

  // Convert 24-hour to 12-hour
  let hour: number;
  let period: "AM" | "PM";

  if (hour24 === 0) {
    // Midnight (00:xx = 12:xx AM)
    hour = 12;
    period = "AM";
  } else if (hour24 < 12) {
    // Morning (01:xx - 11:xx = 1:xx AM - 11:xx AM)
    hour = hour24;
    period = "AM";
  } else if (hour24 === 12) {
    // Noon (12:xx = 12:xx PM)
    hour = 12;
    period = "PM";
  } else {
    // Afternoon/Evening (13:xx - 23:xx = 1:xx PM - 11:xx PM)
    hour = hour24 - 12;
    period = "PM";
  }

  return { hour, minute, period };
}

// Format time components (12-hour) into HH:MM string (24-hour)
export function formatTimeString(
  hour: number,
  minute: number,
  period: "AM" | "PM"
): string {
  let hour24: number;

  if (period === "AM") {
    // AM: 12:xx AM = 00:xx, 1:xx AM - 11:xx AM = 01:xx - 11:xx
    hour24 = hour === 12 ? 0 : hour;
  } else {
    // PM: 12:xx PM = 12:xx, 1:xx PM - 11:xx PM = 13:xx - 23:xx
    hour24 = hour === 12 ? 12 : hour + 12;
  }

  const hourStr = String(hour24).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");
  return `${hourStr}:${minuteStr}`;
}
