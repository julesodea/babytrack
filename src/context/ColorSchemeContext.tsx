import { createContext, useContext, useState, type ReactNode } from "react";

export interface ColorScheme {
  id: string;
  name: string;
  cardBg: string;
  cardBgHover: string;
}

export const colorSchemes: ColorScheme[] = [
  {
    id: "default",
    name: "Default (White)",
    cardBg: "bg-white",
    cardBgHover: "hover:bg-gray-50",
  },
  {
    id: "blue",
    name: "Blue",
    cardBg: "bg-blue-400",
    cardBgHover: "hover:bg-blue-500",
  },
  {
    id: "purple",
    name: "Purple",
    cardBg: "bg-purple-400",
    cardBgHover: "hover:bg-purple-500",
  },
  {
    id: "green",
    name: "Green",
    cardBg: "bg-green-400",
    cardBgHover: "hover:bg-green-500",
  },
  {
    id: "rose",
    name: "Rose",
    cardBg: "bg-rose-400",
    cardBgHover: "hover:bg-rose-500",
  },
  {
    id: "amber",
    name: "Amber",
    cardBg: "bg-amber-400",
    cardBgHover: "hover:bg-amber-500",
  },
  {
    id: "teal",
    name: "Teal",
    cardBg: "bg-teal-400",
    cardBgHover: "hover:bg-teal-500",
  },
  {
    id: "sage",
    name: "Sage",
    cardBg: "bg-[#A3B18A]",
    cardBgHover: "hover:bg-[#8a9a72]",
  },
  {
    id: "forest",
    name: "Forest",
    cardBg: "bg-[#588157]",
    cardBgHover: "hover:bg-[#4a6e49]",
  },
  {
    id: "dark",
    name: "Dark",
    cardBg: "bg-gray-900",
    cardBgHover: "hover:bg-gray-800",
  },
];

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(
  undefined
);

const STORAGE_KEY = "baby-tracker-color-scheme";

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = colorSchemes.find((s) => s.id === parsed.id);
      if (found) return found;
    }
    return colorSchemes[0];
  });

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: scheme.id }));
  };

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }
  return context;
}
