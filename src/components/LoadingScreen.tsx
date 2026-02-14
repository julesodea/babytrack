import { IconBottle } from "./icons";
import { useColorScheme, colorHexMap } from "../context/ColorSchemeContext";

export function LoadingScreen() {
  const { colorScheme } = useColorScheme();
  const backgroundColor =
    colorScheme.id === "default"
      ? colorHexMap.blue
      : colorHexMap[colorScheme.id] || colorHexMap.default;

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
