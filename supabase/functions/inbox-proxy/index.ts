import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_BASE_URL = "https://automacao.db8intelligence.com.br/webhook";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let apiPath = "/properties";
    let method = "GET";
    let body: string | undefined;

    if (req.method === "POST") {
      const json = await req.json();
      // Support proxied PATCH via _method/_path
      if (json._method === "PATCH" && json._path) {
        apiPath = json._path;
        method = "PATCH";
        const { _method, _path, ...rest } = json;
        body = JSON.stringify(rest);
      } else {
        method = "POST";
        body = JSON.stringify(json);
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) fetchOptions.body = body;

    const response = await fetch(`${API_BASE_URL}${apiPath}`, fetchOptions);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
