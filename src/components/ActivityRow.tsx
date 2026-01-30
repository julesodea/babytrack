import { Link } from "react-router";

interface ActivityRowProps {
  id: string;
  type: string;
  detail: string;
  time: string;
  user: string;
  date: string;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export function ActivityRow({
  id,
  type,
  detail,
  time,
  user,
  date,
  selected = false,
  onSelect,
}: ActivityRowProps) {
  // Get day of week and formatted date
  const getDayOfWeek = (dateString: string): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // Parse date components directly to avoid timezone issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
  };

  const formatDate = (dateString: string): string => {
    const [_year, month, day] = dateString.split("-").map(Number);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[month - 1]} ${day}`;
  };

  const dayOfWeek = getDayOfWeek(date);
  const formattedDate = formatDate(date);
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(id, !selected);
  };

  const Checkbox = () => (
    <div
      onClick={handleCheckboxClick}
      className={`group/checkbox w-5 h-5 border rounded flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
        selected
          ? "bg-gray-900 border-gray-900 text-white"
          : "border-gray-300 bg-gray-50 text-transparent hover:text-gray-400"
      }`}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
      </svg>
    </div>
  );

  return (
    <Link
      to={`/activity/${id}?type=${type}`}
      className="group block bg-white rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Mobile Layout */}
      <div className="sm:hidden px-3 py-[18px] flex items-center gap-2 overflow-hidden">
        <Checkbox />
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 capitalize shrink-0">
          {type}
        </span>
        <p className="text-xs text-gray-900 truncate flex-1 min-w-0">{detail}</p>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 shrink-0">
          {dayOfWeek}
        </span>
        <div className="text-[10px] text-gray-600 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 shrink-0">
          {time}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-4 items-center">
        <div className="col-span-1 flex items-center">
          <Checkbox />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize">
            {type}
          </span>
        </div>
        <div className="col-span-3">
          <p className="text-sm text-gray-900">{detail}</p>
        </div>
        <div className="col-span-2 flex items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
            {dayOfWeek} {formattedDate}
          </span>
        </div>
        <div className="col-span-2 flex items-center">
          <div className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-100 whitespace-nowrap">
            {time}
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-semibold">
            {user.charAt(0)}
          </div>
          <span className="text-sm text-gray-700">{user}</span>
        </div>
      </div>
    </Link>
  );
}
