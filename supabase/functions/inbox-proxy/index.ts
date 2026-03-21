import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_BASE_URL = "https://api.db8intelligence.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function appendQuery(path: string, key: string, value: unknown) {
  if (value === undefined || value === null || value === "") return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
}

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

      if (json._method && json._path) {
        apiPath = json._path;
        method = json._method;
        const { _method, _path, workspace_id, ...rest } = json;

        if (workspace_id) {
          apiPath = appendQuery(apiPath, "workspace_id", workspace_id);
        }

        if (Object.keys(rest).length > 0) {
          body = JSON.stringify(rest);
        }
      } else {
        method = "POST";
        body = JSON.stringify(json);
      }
    }

    let finalPath = apiPath;
    if (method === "PATCH" && body) {
      const parsed = JSON.parse(body);
      if (parsed.status) {
        finalPath = appendQuery(finalPath, "status", parsed.status);
        delete parsed.status;
        body = Object.keys(parsed).length > 0 ? JSON.stringify(parsed) : undefined;
      }
    }

    if (method === "POST" && !body) {
      body = JSON.stringify({});
    }

    const fetchOptions: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) fetchOptions.body = body;

    const response = await fetch(`${API_BASE_URL}${finalPath}`, fetchOptions);
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
