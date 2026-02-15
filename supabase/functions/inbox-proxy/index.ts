import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_BASE_URL = "https://db8-agent-production.up.railway.app";

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
    let apiPath = "/webhook/properties";
    let method = "GET";
    let body: string | undefined;

    if (req.method === "POST") {
      const json = await req.json();

      if (json._method && json._path) {
        apiPath = `/webhook${json._path}`;
        method = json._method;
        const { _method, _path, ...rest } = json;
        if (Object.keys(rest).length > 0) {
          body = JSON.stringify(rest);
        }
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
