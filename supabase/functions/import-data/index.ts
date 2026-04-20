import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: workspace } = await supabaseAdmin
    .from("workspaces").select("id").eq("owner_user_id", user.id).maybeSingle();
  if (!workspace) return json({ error: "Workspace not found" }, 404);

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const body = await req.json().catch(() => ({}));

  switch (action) {
    case "parse": {
      const { file_url, file_type, source_platform } = body;

      const { data: fileData } = await supabaseAdmin.storage
        .from("imports").download(file_url);
      if (!fileData) return json({ error: "File not found" }, 404);

      const content = await fileData.text();
      const records = file_type === "xml" ? parseVRSyncXML(content) : parseCSV(content);

      const { data: job } = await supabaseAdmin.from("import_jobs").insert({
        workspace_id: workspace.id,
        type: detectType(file_type, records),
        source_platform: source_platform ?? "generic",
        file_url,
        status: "pending",
        total_records: records.length,
        preview_data: records.slice(0, 5),
      }).select().maybeSingle();

      return json({ job_id: job?.id, total: records.length, preview: records.slice(0, 5) });
    }

    case "confirm": {
      const { job_id } = body;
      const { data: job } = await supabaseAdmin
        .from("import_jobs").select("*").eq("id", job_id).maybeSingle();
      if (!job) return json({ error: "Job not found" }, 404);

      processImport(job, workspace.id, supabaseAdmin);

      await supabaseAdmin.from("import_jobs")
        .update({ status: "processing", confirmed: true }).eq("id", job_id);

      return json({ ok: true, job_id });
    }

    case "status": {
      const { job_id } = body;
      const { data } = await supabaseAdmin
        .from("import_jobs").select("*").eq("id", job_id).maybeSingle();
      return json(data);
    }

    default:
      return new Response("Action not found", { status: 404 });
  }
});

function parseVRSyncXML(xml: string): Record<string, unknown>[] {
  const listings: Record<string, unknown>[] = [];
  const listingRegex = /<Listing>([\s\S]*?)<\/Listing>/gi;
  let match;

  while ((match = listingRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string) => {
      const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(block);
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : null;
    };

    const photoRegex = /<Item[^>]*medium="image"[^>]*>([\s\S]*?)<\/Item>/gi;
    const photos: string[] = [];
    let photoMatch;
    while ((photoMatch = photoRegex.exec(block)) !== null) {
      const photoUrl = photoMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      if (photoUrl) photos.push(photoUrl);
    }

    listings.push({
      reference: get("ListingID"),
      title: get("Title"),
      type: get("PropertyType"),
      pretension: get("TransactionType") === "For Sale" ? "venda" : "locacao",
      price: parseFloat(get("ListPrice") ?? "0") || null,
      bedrooms: parseInt(get("Bedrooms") ?? "0") || null,
      suites: parseInt(get("Suites") ?? "0") || null,
      parking: parseInt(get("Garages") ?? "0") || null,
      area_built: parseFloat(get("TotalFloorArea") ?? "0") || null,
      description: get("Description"),
      address: {
        rua: get("Address"),
        bairro: get("Neighborhood"),
        cidade: get("City"),
        uf: get("State"),
      },
      lat: parseFloat(get("Latitude") ?? "0") || null,
      lng: parseFloat(get("Longitude") ?? "0") || null,
      photos,
    });
  }
  return listings;
}

function parseCSV(content: string): Record<string, unknown>[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function detectType(fileType: string, records: unknown[]): string {
  if (fileType === "xml") return "properties";
  const first = records[0] as Record<string, unknown>;
  if (!first) return "clients";
  const keys = Object.keys(first).map((k) => k.toLowerCase());
  if (keys.some((k) => k.includes("imovel") || k.includes("property"))) return "properties";
  if (keys.some((k) => k.includes("lead") || k.includes("interesse"))) return "leads";
  return "clients";
}

async function processImport(
  job: Record<string, unknown>,
  workspaceId: string,
  supabase: ReturnType<typeof createClient>
) {
  try {
    const { data: fileData } = await supabase.storage
      .from("imports").download(job.file_url as string);
    if (!fileData) throw new Error("File not found");

    const content = await fileData.text();
    const records = (job.file_url as string).endsWith(".xml")
      ? parseVRSyncXML(content) : parseCSV(content);

    let imported = 0;
    const errors: unknown[] = [];

    for (const record of records) {
      try {
        if (job.type === "properties") {
          const prop = record as Record<string, unknown>;
          await supabase.from("properties").insert({
            workspace_id: workspaceId,
            reference: prop.reference,
            type: prop.type,
            pretension: prop.pretension,
            price: prop.price,
            bedrooms: prop.bedrooms,
            suites: prop.suites,
            parking: prop.parking,
            area_built: prop.area_built,
            description: prop.description,
            address: prop.address,
            lat: prop.lat,
            lng: prop.lng,
            photos: prop.photos,
            status: "active",
            source: "upload",
          });
        } else if (job.type === "clients") {
          const c = record as Record<string, string>;
          await supabase.from("clients").insert({
            workspace_id: workspaceId,
            name: c.name || c.nome || c.Nome,
            email: c.email || c.Email,
            phone_mobile: c.phone || c.telefone || c.celular,
            first_contact_source: "import",
          });
        } else if (job.type === "leads") {
          const l = record as Record<string, string>;
          await supabase.from("leads").insert({
            workspace_id: workspaceId,
            name: l.name || l.nome,
            email: l.email,
            phone: l.phone || l.telefone,
            source: "import",
            source_detail: job.source_platform as string,
            status: "new",
          });
        }
        imported++;
      } catch (e) {
        errors.push({ record: (record as Record<string, unknown>).reference, error: String(e) });
      }
    }

    await supabase.from("import_jobs").update({
      status: "done",
      imported_records: imported,
      failed_records: errors.length,
      errors,
    }).eq("id", job.id);
  } catch (e) {
    await supabase.from("import_jobs").update({
      status: "error",
    }).eq("id", job.id);
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
