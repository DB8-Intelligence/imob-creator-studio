/**
 * apiLogBuffer — monkey-patch global de window.fetch pra manter um ring
 * buffer das últimas N requisições HTTP (inclui Supabase postgrest/auth/
 * functions/storage + qualquer fetch direto da app).
 *
 * Usado pelo BugReporterWidget pra anexar contexto automaticamente ao
 * bug report: o dev vê exatamente que chamadas falharam antes do bug.
 */
import type { ApiLogEntry } from "@/types/bug-report";

const MAX_ENTRIES = 15;
const buffer: ApiLogEntry[] = [];

let installed = false;

/** Instala o interceptor uma única vez. Chame no bootstrap. */
export function installApiLogInterceptor(): void {
  if (installed) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startedAt = Date.now();
    const method = (init?.method || "GET").toUpperCase();
    let pathForLog = "";

    try {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      // Encurta URL absoluta pra só o caminho (+host)
      try {
        const parsed = new URL(url, window.location.origin);
        pathForLog =
          parsed.origin === window.location.origin
            ? parsed.pathname + parsed.search
            : parsed.host + parsed.pathname;
      } catch {
        pathForLog = url;
      }
    } catch {
      pathForLog = "(url parse failed)";
    }

    try {
      const res = await originalFetch(input, init);
      record({
        method,
        path: pathForLog,
        status: res.status,
        timestamp: new Date().toISOString(),
        duration_ms: Date.now() - startedAt,
      });
      return res;
    } catch (err) {
      record({
        method,
        path: pathForLog,
        status: 0, // network-level failure
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        duration_ms: Date.now() - startedAt,
      });
      throw err;
    }
  };
}

function record(entry: ApiLogEntry): void {
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) {
    buffer.splice(0, buffer.length - MAX_ENTRIES);
  }
}

/** Retorna snapshot (cópia) do ring buffer atual. */
export function getApiLog(): ApiLogEntry[] {
  return [...buffer];
}

/** Limpa o buffer (útil em testes). */
export function clearApiLog(): void {
  buffer.length = 0;
}
