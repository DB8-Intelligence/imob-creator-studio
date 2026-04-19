import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  const url = new URL(req.url);
  const wsSlug = url.searchParams.get("workspace");

  if (!wsSlug) return new Response("workspace required", { status: 400 });

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("slug", wsSlug)
    .maybeSingle();
  if (!workspace) return new Response("Not found", { status: 404 });

  const { data: siteConfig } = await supabase
    .from("site_config")
    .select("*")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  // Estratégia: property_portals (explicit per-portal config) tem prioridade.
  // Se não houver config explícita pra este portal, cai pro legacy portals_feed=true.
  const portalSlug = url.searchParams.get("portal");

  const { data: explicitRows } = portalSlug
    ? await supabase
        .from("property_portals")
        .select("property_id, is_featured")
        .eq("portal_slug", portalSlug)
        .in("status", ["pending", "sent"])
    : { data: [] };

  const explicitIds = new Set((explicitRows ?? []).map((r) => (r as { property_id: string }).property_id));
  const featuredMap = new Map<string, boolean>();
  for (const r of (explicitRows ?? []) as Array<{ property_id: string; is_featured: boolean }>) {
    featuredMap.set(r.property_id, r.is_featured);
  }

  let properties: Record<string, unknown>[] = [];
  if (explicitIds.size > 0) {
    // Usa config explícita pra este portal
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("workspace_id", workspace.id)
      .eq("status", "active")
      .in("id", Array.from(explicitIds))
      .order("created_at", { ascending: false });
    properties = (data as Record<string, unknown>[]) ?? [];
  } else {
    // Fallback legacy: portals_feed=true global
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("workspace_id", workspace.id)
      .eq("portals_feed", true)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    properties = (data as Record<string, unknown>[]) ?? [];
  }

  // Anota is_featured em cada property (default false)
  properties = properties.map((p) => ({
    ...p,
    __is_featured: featuredMap.get(p.id as string) ?? false,
  }));

  const xml = generateXML(
    properties,
    siteConfig as Record<string, string> | null,
    workspace.name
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});

function generateXML(
  properties: Record<string, unknown>[],
  config: Record<string, string> | null,
  workspaceName: string
): string {
  const companyPhone = config?.phone1 ?? "";
  const companyEmail = config?.email ?? "";
  const companyName = config?.company_name ?? workspaceName;

  const listings = properties
    .map((p) => {
      const addr = (p.address as Record<string, string>) ?? {};
      const photos = ((p.photos as string[]) ?? [])
        .slice(0, 20)
        .map(
          (photoUrl: string, i: number) =>
            `<Item medium="image" caption="Foto ${i + 1}"><![CDATA[${photoUrl}]]></Item>`
        )
        .join("");

      const featured = p.__is_featured === true;
      return `
    <Listing>
      <ListingID>${p.reference}</ListingID>
      ${featured ? "<PublicationType>SUPER_PREMIUM</PublicationType>" : ""}
      <Title><![CDATA[${p.type ?? "Imóvel"} - ${addr.bairro ?? ""} - ${addr.cidade ?? ""}]]></Title>
      <TransactionType>${p.pretension === "venda" ? "For Sale" : "For Rent"}</TransactionType>
      <PropertyType>${p.type ?? "Residential"}</PropertyType>
      <Details>
        <ListPrice currency="BRL">${p.price ?? 0}</ListPrice>
        <CondoFee currency="BRL">0</CondoFee>
        <YearlyTax currency="BRL">0</YearlyTax>
        <Bedrooms>${p.bedrooms ?? 0}</Bedrooms>
        <Suites>${p.suites ?? 0}</Suites>
        <Garages>${p.parking ?? 0}</Garages>
        <TotalFloorArea unit="square metres">${p.area_built ?? 0}</TotalFloorArea>
        <Description><![CDATA[${p.description ?? ""}]]></Description>
      </Details>
      <Location displayAddress="true">
        <Country>BR</Country>
        <State>${addr.uf ?? "BA"}</State>
        <City><![CDATA[${addr.cidade ?? ""}]]></City>
        <Neighborhood><![CDATA[${addr.bairro ?? ""}]]></Neighborhood>
        <Address><![CDATA[${addr.rua ?? ""}]]></Address>
        <Longitude>${p.lng ?? 0}</Longitude>
        <Latitude>${p.lat ?? 0}</Latitude>
      </Location>
      <Media>${photos}</Media>
      <ContactInfo>
        <Name><![CDATA[${companyName}]]></Name>
        <Email>${companyEmail}</Email>
        <Telephone>${companyPhone}</Telephone>
      </ContactInfo>
    </Listing>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync
  http://xml.vivareal.com/vrsync.xsd">
  <Header>
    <Provider><![CDATA[ImobCreator AI]]></Provider>
    <Email>${companyEmail}</Email>
    <ContactName><![CDATA[${companyName}]]></ContactName>
  </Header>
  <Listings>${listings}
  </Listings>
</ListingDataFeed>`;
}
