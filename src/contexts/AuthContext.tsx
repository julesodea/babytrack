import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  ("🔵 AuthProvider initialized");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialSessionHandled = useRef(false);

  const fetchProfile = async (userId: string) => {
    // Set timeout to ensure loading doesn't hang forever
    const timeoutId = setTimeout(() => {
      console.warn(
        "⏱️ Profile fetch taking longer than 10s, setting loading to false anyway"
      );
      setLoading(false);
    }, 10000);

    try {
      ("🔍 About to call supabase.from(profiles)...");

      const query = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      ("🔍 Query constructed, awaiting result...");

      const result = await query;
      const { data, error } = result;

      clearTimeout(timeoutId);

      if (error) {
        console.error("❌ Error fetching profile:", error.message || JSON.stringify(error));
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("💥 Exception in fetchProfile:", err instanceof Error ? err.message : String(err));
      setProfile(null);
    }
  };

  useEffect(() => {
    ("🟢 useEffect running");

    // Listen for auth changes (this also fires initially with the current session)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      session?.user?.id, "handled:", initialSessionHandled.current;

      if (!initialSessionHandled.current) {
        initialSessionHandled.current = true;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Don't await - let it run in background
          fetchProfile(session.user.id)
            .then(() => {
              ("✅ fetchProfile completed, setting loading to false");
              setLoading(false);
            })
            .catch((err) => {
              console.error("❌ fetchProfile failed:", err instanceof Error ? err.message : String(err));
              setLoading(false);
            });
        } else {
          setProfile(null);
          ("✅ No user, setting loading to false");
          setLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    // Use pkce flow for better PWA compatibility on iOS
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        skipBrowserRedirect: false,
        // PKCE flow works better in standalone PWA mode
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
