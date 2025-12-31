import { Routes, Route } from "react-router";
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
  Preferences,
  Sleep,
  SleepNew,
} from "./pages";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
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
  );
}

export default App;
