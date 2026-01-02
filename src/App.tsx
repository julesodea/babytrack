import { Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { ColorSchemeProvider } from "./context/ColorSchemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import {
  Account,
  ActivityDetail,
  ActivityNew,
  Dashboard,
  Diaper,
  DiaperNew,
  Feed,
  FeedNew,
  Login,
  Preferences,
  Sleep,
  SleepNew,
} from "./pages";

function App() {
  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/feed/new" element={<FeedNew />} />
            <Route path="/diaper" element={<Diaper />} />
            <Route path="/diaper/new" element={<DiaperNew />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/sleep/new" element={<SleepNew />} />
            <Route path="/settings" element={<Preferences />} />
            <Route path="/account" element={<Account />} />
            <Route path="/activity/new" element={<ActivityNew />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
          </Route>
        </Routes>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}

export default App;
