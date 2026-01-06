import { useColorScheme } from "../context/ColorSchemeContext";

interface UpdateModalProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateModal({ onUpdate, onDismiss }: UpdateModalProps) {
  const { colorScheme } = useColorScheme();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Update Available
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          A new version of the app is available. Would you like to update now?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Later
          </button>
          <button
            onClick={onUpdate}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
              colorScheme.id === "default"
                ? "bg-gray-900 hover:bg-gray-800"
                : `${colorScheme.cardBg} ${colorScheme.cardBgHover}`
            }`}
          >
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}
