import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { StrictMode, useState, useEffect } from "react";
import App from "./App";
import { UpdateModal } from "./components/UpdateModal";
import "./index.css";

// Register service worker for PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // Dispatch custom event to show update modal
                window.dispatchEvent(new CustomEvent("sw-update-available"));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });

  // Handle service worker updates when they take control
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

function AppWithUpdateModal() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShowUpdateModal(true);
    };

    window.addEventListener("sw-update-available", handleUpdate);
    return () => window.removeEventListener("sw-update-available", handleUpdate);
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdateModal(false);
  };

  return (
    <>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {showUpdateModal && (
        <UpdateModal onUpdate={handleUpdate} onDismiss={handleDismiss} />
      )}
    </>
  );
}

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <StrictMode>
    <AppWithUpdateModal />
  </StrictMode>
);
