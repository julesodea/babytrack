import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard, Diaper, Feed, Sleep } from "./pages";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/diaper" element={<Diaper />} />
        <Route path="/sleep" element={<Sleep />} />
      </Route>
    </Routes>
  );
}

export default App;
