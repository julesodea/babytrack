import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { BabyProvider } from "./contexts/BabyContext";
import { ColorSchemeProvider } from "./context/ColorSchemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { IconBottle } from "./components/icons";

// Eager load critical pages (public routes)
import { Login } from "./pages";
import { InviteAccept } from "./pages/InviteAccept";
import { Dashboard } from "./pages";
import { Search } from "./pages";

// Lazy load all other pages for code splitting
const ActivityDetail = lazy(() =>
  import("./pages").then((m) => ({ default: m.ActivityDetail }))
);
const ActivityNew = lazy(() =>
  import("./pages").then((m) => ({ default: m.ActivityNew }))
);
const Diaper = lazy(() =>
  import("./pages").then((m) => ({ default: m.Diaper }))
);
const DiaperNew = lazy(() =>
  import("./pages").then((m) => ({ default: m.DiaperNew }))
);
const Feed = lazy(() => import("./pages").then((m) => ({ default: m.Feed })));
const FeedNew = lazy(() =>
  import("./pages").then((m) => ({ default: m.FeedNew }))
);
const Preferences = lazy(() =>
  import("./pages").then((m) => ({ default: m.Preferences }))
);
const Sleep = lazy(() => import("./pages").then((m) => ({ default: m.Sleep })));
const SleepNew = lazy(() =>
  import("./pages").then((m) => ({ default: m.SleepNew }))
);
const BabyNew = lazy(() =>
  import("./pages/BabyNew").then((m) => ({ default: m.BabyNew }))
);
const BabyManage = lazy(() =>
  import("./pages/BabyManage").then((m) => ({ default: m.BabyManage }))
);
const Profile = lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.Profile }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BabyProvider>
          <ColorSchemeProvider>
            <Suspense
              fallback={
                <div 
                  className="fixed flex flex-col items-center justify-center bg-blue-400 z-50" 
                  style={{ 
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingTop: 'env(safe-area-inset-top)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    paddingLeft: 'env(safe-area-inset-left)',
                    paddingRight: 'env(safe-area-inset-right)'
                  }}
                >
                  <IconBottle className="w-16 h-16 text-white mb-4 animate-pulse" />
                  <h1 className="text-2xl font-semibold text-white">
                    Baby Track
                  </h1>
                </div>
              }
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/invites/accept" element={<InviteAccept />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/feed/new" element={<FeedNew />} />
                  <Route path="/diaper" element={<Diaper />} />
                  <Route path="/diaper/new" element={<DiaperNew />} />
                  <Route path="/sleep" element={<Sleep />} />
                  <Route path="/sleep/new" element={<SleepNew />} />
                  <Route path="/settings" element={<Preferences />} />
                  <Route path="/activity/new" element={<ActivityNew />} />
                  <Route path="/activity/:id" element={<ActivityDetail />} />
                  <Route path="/babies/new" element={<BabyNew />} />
                  <Route path="/babies/manage" element={<BabyManage />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Routes>
            </Suspense>
          </ColorSchemeProvider>
        </BabyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
