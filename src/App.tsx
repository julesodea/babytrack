import { Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { BabyProvider } from "./contexts/BabyContext";
import { ColorSchemeProvider } from "./context/ColorSchemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import {
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
import { BabyNew } from "./pages/BabyNew";
import { BabyManage } from "./pages/BabyManage";
import { InviteAccept } from "./pages/InviteAccept";

function App() {
  return (
    <AuthProvider>
      <BabyProvider>
        <ColorSchemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/invites/accept" element={<InviteAccept />} />
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
              <Route path="/activity/new" element={<ActivityNew />} />
              <Route path="/activity/:id" element={<ActivityDetail />} />
              <Route path="/babies/new" element={<BabyNew />} />
              <Route path="/babies/manage" element={<BabyManage />} />
            </Route>
          </Routes>
        </ColorSchemeProvider>
      </BabyProvider>
    </AuthProvider>
  );
}

export default App;
