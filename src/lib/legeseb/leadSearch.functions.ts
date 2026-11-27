import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface FoundBusiness { placeId: string; name: string; address: string; phone: string; website: string; mapsUrl: string }

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

/** Searches public Google Maps business listings. Signed-in users only, max 20 results per search. */
export const searchLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ industry: z.string().trim().min(2).max(80), location: z.string().trim().min(2).max(120) }).parse(d))
  .handler(async ({ data }): Promise<{ results: FoundBusiness[]; error?: string }> => {
    const lovable = process.env["LOVABLE_API_KEY"];
    const key = process.env["GOOGLE_MAPS_API_KEY"];
    if (!lovable || !key) return { results: [], error: "Lead search isn't connected yet." };
    const res = await fetch(`${GATEWAY}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovable}`,
        "X-Connection-Api-Key": key,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri",
      },
      body: JSON.stringify({ textQuery: `${data.industry} in ${data.location}`, pageSize: 20 }),
    });
    if (!res.ok) {
      console.error(`Places search failed [${res.status}]: ${await res.text()}`);
      if (res.status === 429) return { results: [], error: "Daily search limit reached. Try again later." };
      return { results: [], error: "The business search is unavailable right now." };
    }
    const body = (await res.json()) as { places?: { id: string; displayName?: { text?: string }; formattedAddress?: string; nationalPhoneNumber?: string; websiteUri?: string; googleMapsUri?: string }[] };
    return {
      results: (body.places ?? []).map((p) => ({
        placeId: p.id, name: p.displayName?.text ?? "Unnamed business", address: p.formattedAddress ?? "",
        phone: p.nationalPhoneNumber ?? "", website: p.websiteUri ?? "", mapsUrl: p.googleMapsUri ?? "",
      })),
    };
  });
