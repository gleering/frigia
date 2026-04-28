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
  notes: ProductNotes;
};

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
          {
            type: "image",
            source: { type: "url", url: imageUrl },
          },
          {
            type: "text",
            text: `Eres un experto en perfumería. Analiza la imagen de este perfume y devuelve un JSON con los siguientes campos:
- description: descripción evocadora y persuasiva en español (2-3 oraciones)
- fragranceFamily: familia olfativa principal (Floral, Oriental, Amaderado, Fresco, Cítrico, Gourmand, Acuático, etc.)
- notes: { top: string[], heart: string[], base: string[] } con las notas olfativas probables

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

// Usa la Batch API para enriquecer múltiples productos (50% más barato)
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
              text: `Experto en perfumería. Devuelve JSON: { description, fragranceFamily, notes: { top, heart, base } } para "${p.name}" de ${p.brand}. Solo JSON.`,
            },
          ],
        },
      ],
    },
  }));

  return anthropic.messages.batches.create({ requests });
}
