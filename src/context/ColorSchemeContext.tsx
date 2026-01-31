import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getProfile,
  updateColorScheme as updateColorSchemeAPI,
} from "../lib/api/profiles";

export interface ColorScheme {
  id: string;
  name: string;
  cardBg: string;
  cardBgHover: string;
}

// Map color scheme IDs to hex colors for meta theme-color
export const colorHexMap: Record<string, string> = {
  default: "#111827", // gray-900
  blue: "#60a5fa", // blue-400
  purple: "#c084fc", // purple-400
  green: "#4ade80", // green-400
  rose: "#fb7185", // rose-400
  amber: "#fbbf24", // amber-400
  teal: "#2dd4bf", // teal-400
  sage: "#A3B18A",
  forest: "#588157",
  dark: "#1f2937", // gray-800
};

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
    cardBgHover: "hover:bg-blue-400",
  },
  {
    id: "purple",
    name: "Purple",
    cardBg: "bg-purple-400",
    cardBgHover: "hover:bg-purple-400",
  },
  {
    id: "green",
    name: "Green",
    cardBg: "bg-green-400",
    cardBgHover: "hover:bg-green-400",
  },
  {
    id: "rose",
    name: "Rose",
    cardBg: "bg-rose-400",
    cardBgHover: "hover:bg-rose-400",
  },
  {
    id: "amber",
    name: "Amber",
    cardBg: "bg-amber-400",
    cardBgHover: "hover:bg-amber-400",
  },
  {
    id: "teal",
    name: "Teal",
    cardBg: "bg-teal-400",
    cardBgHover: "hover:bg-teal-400",
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
    cardBg: "bg-gray-800",
    cardBgHover: "hover:bg-gray-700",
  },
];

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(
  undefined
);

const CACHE_KEY = "baby-tracker-color-scheme";

// Helper to get cached color scheme from localStorage
function getCachedColorScheme(): ColorScheme {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const found = colorSchemes.find((s) => s.id === cached);
      if (found) return found;
    }
  } catch {
    // Ignore localStorage errors
  }
  return colorSchemes[0];
}

// Helper to cache color scheme to localStorage
function cacheColorScheme(schemeId: string) {
  try {
    localStorage.setItem(CACHE_KEY, schemeId);
  } catch {
    // Ignore localStorage errors
  }
}

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Initialize from localStorage cache for instant display
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getCachedColorScheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load color scheme from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadColorScheme();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Update theme-color meta tag when color scheme changes
  useEffect(() => {
    const themeColor = colorHexMap[colorScheme.id] || colorHexMap.default;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    }
  }, [colorScheme]);

  const loadColorScheme = async () => {
    if (!user) return;

    try {
      const profile = await getProfile(user.id);
      if (profile && profile.color_scheme) {
        const found = colorSchemes.find((s) => s.id === profile.color_scheme);
        if (found) {
          setColorSchemeState(found);
          cacheColorScheme(found.id); // Update cache with Supabase value
        }
      }
    } catch (error) {
      console.error("Failed to load color scheme from profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    // Optimistically update UI and cache
    setColorSchemeState(scheme);
    cacheColorScheme(scheme.id);

    // Save to Supabase
    if (user) {
      try {
        await updateColorSchemeAPI(user.id, scheme.id);
      } catch (error) {
        console.error("Failed to save color scheme to profile:", error);
      }
    }
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
