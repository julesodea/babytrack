import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { StrictMode } from "react";
import App from "./App";
import { ColorSchemeProvider } from "./context/ColorSchemeContext";
import "./index.css";

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <StrictMode>
    <BrowserRouter>
      <ColorSchemeProvider>
        <App />
      </ColorSchemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
