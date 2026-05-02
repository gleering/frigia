import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type ProductNotes = {
  top: string[];
  heart: string[];
  base: string[];
};

export type ProductAIData = {
  description: string;
  fragranceFamily: string;
  concentration: string;
  ml: number;
  notes: ProductNotes;
};

const ENRICH_PROMPT = (name: string, brand: string, rawName?: string) => `
Sos experto en perfumería. Para la fragancia "${name}" de la marca ${brand}${rawName ? ` (descripción original: "${rawName}")` : ""}, devolvé SOLO un JSON válido:
{
  "description": "descripción evocadora y persuasiva en español (2-3 oraciones)",
  "fragranceFamily": "una de: Floral, Oriental, Amaderado, Fresco, Cítrico, Gourmand, Acuático, Chipre, Fougère",
  "concentration": "una de: EDP, EDT, EDC, EDP_INTENSE, PARFUM, BODY_MIST",
  "ml": 100,
  "notes": {
    "top": ["nota1", "nota2", "nota3"],
    "heart": ["nota1", "nota2"],
    "base": ["nota1", "nota2"]
  }
}
Si la fragancia es conocida usá notas reales; si no, inferí de nombre/marca. Solo JSON, sin markdown.`.trim();

/** Single product enrichment (used for ≤10 items) */
export async function enrichProductText(
  name: string,
  brand: string,
  rawName?: string
): Promise<ProductAIData> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: ENRICH_PROMPT(name, brand, rawName) }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean) as ProductAIData;
  } catch {
    return {
      description: `${name} de ${brand}. Una fragancia inconfundible.`,
      fragranceFamily: "Floral",
      concentration: "EDT",
      ml: 100,
      notes: { top: ["Bergamota"], heart: ["Rosa"], base: ["Sándalo"] },
    };
  }
}

/** Batch enrichment for >10 products (50% cheaper via Batch API) */
export async function enrichProductsBatchText(
  products: Array<{ id: string; name: string; brand: string; rawName?: string }>
) {
  const requests = products.map((p) => ({
    custom_id: p.id,
    params: {
      model: "claude-haiku-4-5-20251001" as const,
      max_tokens: 512,
      messages: [
        {
          role: "user" as const,
          content: ENRICH_PROMPT(p.name, p.brand, p.rawName),
        },
      ],
    },
  }));

  return anthropic.messages.batches.create({ requests });
}

/** Poll a batch until it finishes. Resolves with a map id→ProductAIData */
export async function pollBatchResults(
  batchId: string,
  intervalMs = 5000,
  maxWaitMs = 600_000
): Promise<Map<string, ProductAIData>> {
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    const batch = await anthropic.messages.batches.retrieve(batchId);
    if (batch.processing_status === "ended") break;
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  const results = new Map<string, ProductAIData>();
  for await (const result of await anthropic.messages.batches.results(batchId)) {
    if (result.result.type !== "succeeded") continue;
    const msg = result.result.message;
    const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
    try {
      const clean = text.replace(/```json\n?|\n?```/g, "").trim();
      results.set(result.custom_id, JSON.parse(clean) as ProductAIData);
    } catch {
      // skip malformed
    }
  }
  return results;
}

// ─── Legacy image-based functions kept for compatibility ───

export async function enrichProductFromImage(
  imageUrl: string,
  productName: string,
  brand: string
): Promise<ProductAIData> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          {
            type: "text",
            text: `Eres un experto en perfumería. Analiza la imagen de este perfume y devuelve un JSON con los siguientes campos:
- description: descripción evocadora y persuasiva en español (2-3 oraciones)
- fragranceFamily: familia olfativa principal
- concentration: EDP, EDT, EDC, EDP_INTENSE, PARFUM o BODY_MIST
- ml: número entero
- notes: { top: string[], heart: string[], base: string[] }

Perfume: ${productName} de ${brand}

Responde SOLO con el JSON, sin markdown ni explicaciones.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  return JSON.parse(text) as ProductAIData;
}

export async function enrichProductsBatch(
  products: Array<{ imageUrl: string; name: string; brand: string; id: string }>
) {
  const requests = products.map((p) => ({
    custom_id: p.id,
    params: {
      model: "claude-sonnet-4-6" as const,
      max_tokens: 1024,
      messages: [
        {
          role: "user" as const,
          content: [
            { type: "image" as const, source: { type: "url" as const, url: p.imageUrl } },
            {
              type: "text" as const,
              text: `Experto en perfumería. Devuelve JSON: { description, fragranceFamily, concentration, ml, notes: { top, heart, base } } para "${p.name}" de ${p.brand}. Solo JSON.`,
            },
          ],
        },
      ],
    },
  }));

  return anthropic.messages.batches.create({ requests });
}
