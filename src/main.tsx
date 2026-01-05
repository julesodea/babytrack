import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.log('Service worker registration failed:', error);
    });
  });
}

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
