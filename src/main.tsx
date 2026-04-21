import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initTracking } from "./services/analytics/trackingPixels";
import { installApiLogInterceptor } from "./lib/apiLogBuffer";
import "./index.css";

// Initialize GA4 + Meta Pixel (no-op if env vars not set)
initTracking();

// Installa monkey-patch de fetch pra ring buffer do BugReporter
installApiLogInterceptor();

createRoot(document.getElementById("root")!).render(<App />);
