/**
 * Importa perfumes desde el CSV de Frigia (formato Articulos.csv).
 *
 * Uso:
 *   npx tsx scripts/seed-perfumes.ts ./Articulos.csv
 *
 * Requiere:
 *   - DATABASE_URL en .env.local
 *   - ANTHROPIC_API_KEY en .env.local
 *
 * Flujo:
 *   1. Parsea el CSV (sep=;, encoding latin-1)
 *   2. Filtra filas Grupo=PERFUMERIA o Rubro=PERFUME con stock > 0
 *   3. Limpia nombres, extrae ml y concentración del texto
 *   4. Envía al Batch API de Anthropic para enriquecer (description, family, notes)
 *   5. Hace polling hasta que el batch termina
 *   6. Upsert de brands y products en la DB
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/index.js";
import Anthropic from "@anthropic-ai/sdk";

// Load env vars
config({ path: path.resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── CSV parsing ─────────────────────────────────────────────────────────────

interface RawRow {
  codigo: string;
  sku: string;
  descripcion: string;
  grupo: string;
  rubro: string;
  marca: string;
  stock: number;
  precio: number;
}

function parseFrigiaCSV(filePath: string): RawRow[] {
  const buf = fs.readFileSync(filePath);
  // latin-1 decode
  const content = buf.toString("latin1");
  const lines = content.split(/\r?\n/).filter(Boolean);

  // header: Id;Código;SKU;Descripción;Grupo;Rubro;Marca;Otros;Stock total;...;Precio de venta;...
  // idx:    0  1      2   3           4     5     6     7     8           ...14

  const rows: RawRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";").map((c) => c.replace(/^"|"$/g, "").trim());
    if (cols.length < 15) continue;

    const grupo = cols[4] ?? "";
    const rubro = cols[5] ?? "";

    // Filter: perfumes only
    const isPerfume =
      grupo.toUpperCase().includes("PERFUM") ||
      rubro.toUpperCase().includes("PERFUME") ||
      rubro.toUpperCase().includes("PERFUM");

    if (!isPerfume) continue;

    const stock = parseFloat((cols[8] ?? "0").replace(",", "."));
    const precio = parseFloat((cols[14] ?? "0").replace(",", "."));

    if (stock <= 0 || precio <= 0) continue;

    const descripcion = cols[3]?.trim() ?? "";
    const marca = cols[6]?.trim() ?? "Sin marca";

    // Skip rows with no description
    if (!descripcion) continue;

    rows.push({
      codigo: cols[1]?.trim() ?? "",
      sku: cols[2]?.trim() || "",
      descripcion,
      grupo,
      rubro,
      marca,
      stock,
      precio,
    });
  }

  return rows;
}

// ─── Name / ml / concentration extraction ────────────────────────────────────

type Concentration = "EDP" | "EDT" | "EDC" | "EDP_INTENSE" | "PARFUM" | "BODY_MIST";

function extractMl(text: string): number {
  // Patterns: X100ML, X100, X 100, 100ML, 100 ML, 100ml, x50
  const match = text.match(/[Xx\s](\d{2,3})\s*[Mm][Ll]/) ||
                text.match(/[Xx]\s*(\d{2,3})\b/) ||
                text.match(/\b(\d{2,3})\s*[Mm][Ll]\b/) ||
                text.match(/\b(\d{2,3})\s*ML\b/i);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 15 && n <= 500) return n;
  }
  return 0; // unknown — AI will fill in
}

function extractConcentration(text: string): Concentration | null {
  const up = text.toUpperCase();
  if (up.includes("EDP") || up.includes("EAU DE PARFUM") || up.includes("EAU DE PERFUM") || up.includes("EUD DE PARFUM")) return "EDP";
  if (up.includes("EDT") || up.includes("EAU DE TOILETTE")) return "EDT";
  if (up.includes("EDC") || up.includes("EAU DE COLOGNE")) return "EDC";
  if (up.includes("COLONIA") && !up.includes("EDP")) return "EDC";
  if (up.includes("PARFUM") && !up.includes("EAU")) return "PARFUM";
  if (up.includes("BODY MIST") || up.includes("BODY SPLASH") || up.includes("MIST") || up.includes("SPLASH")) return "BODY_MIST";
  if (up.includes("ELIXIR") || up.includes("INTENSE")) return "EDP_INTENSE";
  return null;
}

function cleanName(raw: string, brand: string): string {
  // Remove brand from start if present
  let name = raw;
  const brandUpper = brand.toUpperCase();
  if (name.toUpperCase().startsWith(brandUpper)) {
    name = name.slice(brand.length).trim().replace(/^[-\s]+/, "");
  }
  // Remove trailing size patterns
  name = name.replace(/\s*[Xx]\s*\d{2,3}\s*[Mm][Ll]?\s*$/, "").trim();
  name = name.replace(/\s*\d{2,3}\s*[Mm][Ll]\s*$/, "").trim();
  // Remove trailing EDP/EDT tags
  name = name.replace(/\s+(EDP|EDT|EDC|EAU DE PARFUM|EAU DE TOILETTE)\s*$/i, "").trim();
  // Remove trailing FEM/MASC/WOMAN/MEN
  name = name.replace(/\s+(FEM|MASC|WOMAN|MEN|FOR WOMEN|FOR MEN)\s*$/i, "").trim();
  // Capitalize
  return name
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || raw;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── AI enrichment ────────────────────────────────────────────────────────────

interface AIData {
  description: string;
  fragranceFamily: string;
  concentration: Concentration;
  ml: number;
  notes: { top: string[]; heart: string[]; base: string[] };
}

function makePrompt(name: string, brand: string, rawName: string): string {
  return `Sos experto en perfumería argentina. Para la fragancia "${name}" de la marca ${brand} (descripción original del sistema: "${rawName}"), devolvé SOLO JSON válido:
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
Si la fragancia es conocida (ej: Miss Dior, CK One, etc.) usá notas reales. Si es local/desconocida, inferí del nombre. Solo JSON, sin markdown.`;
}

async function batchEnrich(
  items: Array<{ id: string; name: string; brand: string; rawName: string }>
): Promise<Map<string, AIData>> {
  console.log(`  Enviando ${items.length} productos al Batch API…`);

  const batch = await anthropic.messages.batches.create({
    requests: items.map((p) => ({
      custom_id: p.id,
      params: {
        model: "claude-haiku-4-5-20251001" as const,
        max_tokens: 512,
        messages: [{ role: "user" as const, content: makePrompt(p.name, p.brand, p.rawName) }],
      },
    })),
  });

  console.log(`  Batch ID: ${batch.id} — esperando resultados…`);

  // Poll
  const deadline = Date.now() + 10 * 60 * 1000; // 10 min max
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 6000));
    const status = await anthropic.messages.batches.retrieve(batch.id);
    const done = status.request_counts.processing === 0;
    process.stdout.write(
      `  [${new Date().toLocaleTimeString()}] succeeded=${status.request_counts.succeeded} processing=${status.request_counts.processing}\r`
    );
    if (done) break;
  }
  console.log("\n  Batch completado. Leyendo resultados…");

  const results = new Map<string, AIData>();
  for await (const result of await anthropic.messages.batches.results(batch.id)) {
    if (result.result.type !== "succeeded") continue;
    const text =
      result.result.message.content[0].type === "text"
        ? result.result.message.content[0].text
        : "{}";
    try {
      const clean = text.replace(/```json\n?|\n?```/g, "").trim();
      results.set(result.custom_id, JSON.parse(clean) as AIData);
    } catch {
      // skip
    }
  }
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Uso: npx tsx scripts/seed-perfumes.ts ./Articulos.csv");
    process.exit(1);
  }

  console.log("1. Parseando CSV…");
  const rows = parseFrigiaCSV(path.resolve(csvPath));
  console.log(`   ${rows.length} perfumes con stock encontrados.`);

  if (rows.length === 0) {
    console.log("   Nada para importar.");
    return;
  }

  // Build normalized product list
  const products = rows.map((r, i) => {
    const name = cleanName(r.descripcion, r.marca);
    const mlFromName = extractMl(r.descripcion);
    const concFromName = extractConcentration(r.descripcion);
    const sku = r.sku || r.codigo || `${slugify(r.marca)}-${slugify(name)}-${i}`;
    return { id: String(i), rawRow: r, name, mlFromName, concFromName, sku };
  });

  console.log("2. Enriqueciendo con IA (Batch API)…");
  const aiMap = await batchEnrich(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.rawRow.marca,
      rawName: p.rawRow.descripcion,
    }))
  );

  console.log(`   ${aiMap.size} / ${products.length} enriquecidos.`);

  // Ensure "Perfumes" category exists
  const perfumesCategory = await prisma.category.upsert({
    where: { slug: "perfumes" },
    update: {},
    create: { name: "Perfumes", slug: "perfumes" },
  });

  console.log("3. Insertando en la base de datos…");
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const p of products) {
    const ai = aiMap.get(p.id);
    const marca = p.rawRow.marca;

    // Upsert brand
    const brandSlug = slugify(marca);
    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      update: {},
      create: { name: marca, slug: brandSlug },
    });

    // Resolve ml and concentration
    const ml = p.mlFromName > 0 ? p.mlFromName : (ai?.ml ?? 100);
    const rawConc = p.concFromName ?? ai?.concentration ?? "EDT";
    const validConcs = new Set(["EDP", "EDT", "EDC", "EDP_INTENSE", "PARFUM", "BODY_MIST"]);
    const concentration = (validConcs.has(rawConc) ? rawConc : "EDT") as Concentration;

    const slug = slugify(`${p.name}-${ml}ml-${brandSlug}`);
    const existingBySlug = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existingBySlug ? `${slug}-${Date.now().toString(36)}` : slug;

    try {
      const existingBySku = await prisma.product.findUnique({ where: { sku: p.sku } });

      if (existingBySku) {
        await prisma.product.update({
          where: { sku: p.sku },
          data: { price: p.rawRow.precio, stock: p.rawRow.stock },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            name: p.name,
            slug: finalSlug,
            sku: p.sku,
            price: p.rawRow.precio,
            stock: Math.max(0, p.rawRow.stock),
            ml,
            concentration,
            fragranceFamily: ai?.fragranceFamily ?? "Floral",
            description: ai?.description ?? null,
            notes: ai?.notes ?? { top: [], heart: [], base: [] },
            images: [],
            active: true,
            featured: false,
            brandId: brand.id,
            categoryId: perfumesCategory.id,
          },
        });
        created++;
      }
    } catch (e) {
      console.error(`   ✗ ${p.name}: ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }

  console.log(`\n✓ Importación completa:`);
  console.log(`  Creados:     ${created}`);
  console.log(`  Actualizados: ${updated}`);
  console.log(`  Fallidos:    ${failed}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
