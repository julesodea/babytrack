import { Link } from "react-router";

interface NotificationBannerProps {
  message: string;
  type: "feed" | "diaper";
  onDismiss?: () => void;
}

export function NotificationBanner({
  message,
  type,
  onDismiss,
}: NotificationBannerProps) {
  const bgColor = type === "feed" ? "bg-blue-50" : "bg-orange-50";
  const borderColor = type === "feed" ? "border-blue-200" : "border-orange-200";
  const textColor = type === "feed" ? "text-blue-800" : "text-orange-800";
  const iconColor = type === "feed" ? "text-blue-600" : "text-orange-600";

  return (
    <Link to={type === "feed" ? "/feed" : "/diaper"}
      className={`${bgColor} ${borderColor} border rounded-lg p-4 flex items-start gap-3 mb-6`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <svg
          className={`w-5 h-5 ${iconColor}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </Link>
  );
}
