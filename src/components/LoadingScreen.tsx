import { useMemo } from "react";
import { IconBottle } from "./icons";

// Color mapping for each scheme
const colorMap: Record<string, string> = {
  default: "#111827", // gray-900 (matches BabySelector)
  blue: "#60a5fa",
  purple: "#c084fc", // purple-400
  green: "#4ade80", // green-400
  rose: "#fb7185", // rose-400
  amber: "#fbbf24", // amber-400
  teal: "#2dd4bf", // teal-400
  sage: "#A3B18A",
  forest: "#588157",
  dark: "#1f2937", // gray-800
};

export function LoadingScreen() {
  // Compute background color during render, not at module load time
  const backgroundColor = useMemo(() => {
    try {
      const saved = localStorage.getItem("baby-tracker-color-scheme");
      console.log("LoadingScreen - localStorage value:", saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("LoadingScreen - parsed scheme id:", parsed.id);
        const color = colorMap[parsed.id] || colorMap.default;
        console.log("LoadingScreen - final color:", color);
        return color;
      }
    } catch (error) {
      console.error("Failed to read color scheme:", error);
    }
    console.log("LoadingScreen - using default color:", colorMap.default);
    return colorMap.default;
  }, []);

  return (
    <div
      className="fixed flex flex-col items-center justify-center z-50"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <IconBottle className="w-16 h-16 text-white mb-4 animate-pulse" />
      <h1 className="text-2xl font-semibold text-white">Baby Track</h1>
    </div>
  );
}
