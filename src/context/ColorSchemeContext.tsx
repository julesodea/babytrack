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

const STORAGE_KEY = "baby-tracker-color-scheme";
const SESSION_LOADED_KEY = "baby-tracker-loaded-from-supabase";

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [hasLoadedFromSupabase, setHasLoadedFromSupabase] = useState(() => {
    return sessionStorage.getItem(SESSION_LOADED_KEY) === "true";
  });
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    // Try localStorage first for immediate UI
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = colorSchemes.find((s) => s.id === parsed.id);
      if (found) return found;
    }
    return colorSchemes[0];
  });

  // Load color scheme from Supabase when user logs in (only once)
  useEffect(() => {
    if (user && !hasLoadedFromSupabase) {
      loadColorScheme();
    }
  }, [user, hasLoadedFromSupabase]);

  const loadColorScheme = async () => {
    if (!user) return;

    try {
      const profile = await getProfile(user.id);
      if (profile && profile.color_scheme) {
        const found = colorSchemes.find((s) => s.id === profile.color_scheme);
        if (found) {
          // Only update if different from current localStorage value
          const saved = localStorage.getItem(STORAGE_KEY);
          const currentId = saved ? JSON.parse(saved).id : null;

          if (currentId !== found.id) {
            setColorSchemeState(found);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: found.id }));
          }
        }
      }
      setHasLoadedFromSupabase(true);
      sessionStorage.setItem(SESSION_LOADED_KEY, "true");
    } catch (error) {
      console.error("Failed to load color scheme from profile:", error);
      setHasLoadedFromSupabase(true);
      sessionStorage.setItem(SESSION_LOADED_KEY, "true");
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: scheme.id }));
    setHasLoadedFromSupabase(true); // Prevent overwriting this change
    sessionStorage.setItem(SESSION_LOADED_KEY, "true");

    // Save to Supabase if user is logged in
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
