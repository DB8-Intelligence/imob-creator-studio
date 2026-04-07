import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initTracking } from "./services/analytics/trackingPixels";
import "./index.css";

// Initialize GA4 + Meta Pixel (no-op if env vars not set)
initTracking();

createRoot(document.getElementById("root")!).render(<App />);
