/**
 * Shared CORS helper para Edge Functions do ImobCreatorAI.
 *
 * Em vez de Access-Control-Allow-Origin: "*", valida a origem
 * da requisição contra a lista de domínios permitidos.
 * Isso evita que outros sites chamem as APIs autenticadas do sistema.
 *
 * Em produção: apenas imobcreatorai.com.br
 * Em desenvolvimento: localhost:5173 e localhost:3000
 */

const ALLOWED_ORIGINS = [
  "https://imobcreatorai.com.br",
  "https://www.imobcreatorai.com.br",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

/**
 * Retorna os headers CORS com a origem exata da requisição (se permitida).
 * Adiciona Vary: Origin para que caches HTTP não reutilizem a resposta com origem errada.
 */
export function buildCorsHeaders(
  req: Request,
  extraHeaders: Record<string, string> = {},
): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]; // fallback para produção

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, " +
      "x-supabase-client-platform, x-supabase-client-platform-version, " +
      "x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Vary": "Origin",
    ...extraHeaders,
  };
}
