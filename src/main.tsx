import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  // DSN configurado via variável de ambiente (VITE_SENTRY_DSN)
  // Para ativar: defina VITE_SENTRY_DSN no .env ou no painel de deploy
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Captura apenas em produção — desativa em desenvolvimento local
  enabled: import.meta.env.PROD,

  environment: import.meta.env.MODE,

  // Rastreia performance (requisições, navegação, React renders)
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Não captura inputs de senha/dados sensíveis
      maskAllInputs: true,
      blockAllMedia: false,
    }),
  ],

  // 10% das transações rastreadas para performance (ajustar conforme volume)
  tracesSampleRate: 0.1,

  // 5% das sessões gravadas para replay
  replaysSessionSampleRate: 0.05,

  // 100% das sessões com erro gravadas
  replaysOnErrorSampleRate: 1.0,
});

createRoot(document.getElementById("root")!).render(<App />);
