/**
 * Importa los 100 perfumes más vendibles del CSV de Frigia.
 *
 * Uso:
 *   npx tsx scripts/seed-top100.ts ./Articulos.csv
 *
 * Requiere en .env.local:
 *   DATABASE_URL, ANTHROPIC_API_KEY
 *
 * Categorías creadas: Para Ella, Para Él, Unisex, Body Splash
 * Top 20 internacionales quedan como featured=true
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/index.js";
import Anthropic from "@anthropic-ai/sdk";

config({ path: path.resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Categorías ────────────────────────────────────────────────────────────────

const CATEGORIES_DEF = [
  { name: "Para Ella",   slug: "para-ella"   },
  { name: "Para Él",     slug: "para-el"     },
  { name: "Unisex",      slug: "unisex"      },
  { name: "Body Splash", slug: "body-splash" },
];

// Marcas internacionales de lujo → featured=true
const LUXURY_BRANDS = new Set([
  "DIOR", "CHANEL", "GIVENCHY", "ARMANI", "GIORGIO ARMANI",
  "DOLCE Y GABBANA", "VERSACE", "PACO RABANNE", "LANCOME",
  "HUGO BOSS", "MUGLER", "KENZO", "CALVIN KLEIN", "CACHAREL",
  "PIGMENTO S.A", "DIFFUPAR LUJO S.A", "JULERIAQUE LUXURY",
  "CDIMEX LUXE", "HARAMAIN", "ARABE", "ARMAF ", "ARMAF",
  "PUIG", "ADOLFO DOMINGUEZ", "BANDERAS", "BENETTON",
]);

// ─── CSV ────────────────────────────────────────────────────────────────────────

interface RawRow {
  codigo: string;
  sku: string;
  descripcion: string;
  marca: string;
  stock: number;
  precio: number;
}

function parseFrigiaCSV(filePath: string): RawRow[] {
  const content = fs.readFileSync(filePath).toString("latin1");
  const lines = content.split(/\r?\n/).filter(Boolean);
  const rows: RawRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";").map((c) => c.replace(/^"|"$/g, "").trim());
    if (cols.length < 15) continue;

    const grupo = cols[4] ?? "";
    const rubro = cols[5] ?? "";
    const desc  = cols[3]?.trim() ?? "";
    const marca = cols[6]?.trim() ?? "Sin marca";
    const up    = desc.toUpperCase();

    const isPerfume =
      grupo.toUpperCase().includes("PERFUM") ||
      rubro.toUpperCase().includes("PERFUM") ||
      up.includes("EDP") || up.includes("EDT") ||
      up.includes("EAU DE") || up.includes("PARFUM") ||
      up.includes("BODY MIST") || up.includes("BODY SPLASH") || up.includes("SPLASH");

    if (!isPerfume || !desc) continue;

    const stock  = parseFloat((cols[8]  ?? "0").replace(",", "."));
    const precio = parseFloat((cols[14] ?? "0").replace(",", "."));

    if (stock <= 0 || precio <= 100) continue;

    rows.push({
      codigo: cols[1]?.trim() ?? "",
      sku:    cols[2]?.trim() || "",
      descripcion: desc,
      marca,
      stock,
      precio,
    });
  }
  return rows;
}

// ─── Extracción ────────────────────────────────────────────────────────────────

type Concentration = "EDP" | "EDT" | "EDC" | "EDP_INTENSE" | "PARFUM" | "BODY_MIST";
type CategorySlug  = "para-ella" | "para-el" | "unisex" | "body-splash";

function extractMl(text: string): number {
  const m = text.match(/[Xx\s](\d{2,3})\s*[Mm][Ll]/) ||
            text.match(/[Xx]\s*(\d{2,3})\b/)          ||
            text.match(/\b(\d{2,3})\s*[Mm][Ll]\b/i);
  if (m) { const n = parseInt(m[1], 10); if (n >= 15 && n <= 500) return n; }
  return 0;
}

function extractConcentration(text: string): Concentration | null {
  const up = text.toUpperCase();
  if (up.includes("EDP INTENSE") || up.includes("EDP INTENS")) return "EDP_INTENSE";
  if (up.includes("BODY MIST") || up.includes("BODY SPLASH") || up.includes("SPLASH")) return "BODY_MIST";
  if (up.includes("EDP") || up.includes("EAU DE PARFUM")) return "EDP";
  if (up.includes("EDT") || up.includes("EAU DE TOILETTE")) return "EDT";
  if (up.includes("EDC") || up.includes("EAU DE COLOGNE")) return "EDC";
  if (up.includes("PARFUM") && !up.includes("EAU")) return "PARFUM";
  return null;
}

function extractCategory(desc: string, conc: Concentration | null): CategorySlug {
  if (conc === "BODY_MIST") return "body-splash";
  const up = desc.toUpperCase();
  const isFem = /\b(FEM|MUJER|WOMAN|GIRL|FEMME|LADY|DAMA|F\/W)\b/.test(up);
  const isMas = /\b(MEN|HOMBRE|MAN|BOY|HOMME|P\/H|FOR HIM)\b/.test(up);
  if (isFem && !isMas) return "para-ella";
  if (isMas && !isFem) return "para-el";
  return "unisex";
}

function cleanName(raw: string, brand: string): string {
  let name = raw;
  const brandUp = brand.toUpperCase();
  if (name.toUpperCase().startsWith(brandUp)) {
    name = name.slice(brand.length).replace(/^[-\s]+/, "");
  }
  name = name.replace(/\s*[Xx]?\s*\d{2,3}\s*[Mm][Ll]?\s*/g, " ").trim();
  name = name.replace(/\s+(EDP\s*INTENSE|EDP|EDT|EDC|EAU DE PARFUM|EAU DE TOILETTE|PARFUM)\s*/gi, " ").trim();
  name = name.replace(/\s+(FEM|MASC|WOMAN|MEN|FOR WOMEN|FOR MEN|F\/W|P\/H|VAP|C\/VAP|RECARGABLE|COFRE\s+DDM\s+\d+)\s*/gi, " ").trim();
  name = name.replace(/\s+/g, " ").trim();
  return name
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || raw;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function scoreProduct(row: RawRow): number {
  let score = 0;
  const up = row.marca.toUpperCase();
  if (row.precio > 200000) score += 5;
  else if (row.precio > 100000) score += 3;
  else if (row.precio > 50000) score += 2;
  else if (row.precio > 20000) score += 1;
  if (LUXURY_BRANDS.has(up)) score += 4;
  const nacionales = ["CANNON", "PAULVIC", "CHER", "CIEL", "SARKANY", "SHAKIRA",
    "BENITO FERNANDEZ", "RAPSODIA", "LOVAL S.A", "ADOLFO DOMINGUEZ",
    "LA PASIONARIA", "IDI", "JACTANS", "ACTIVE COSMETIC S.A", "CDIMEX S.A",
    "PASMANTER R.S.A.", "BOOS", "GIESSO", "WELLINGTON", "BENSIMON"];
  if (nacionales.some((n) => up.includes(n))) score += 2;
  if (row.stock >= 5) score += 2;
  else if (row.stock >= 2) score += 1;
  return score;
}

// ─── AI enrichment (Batch API) ─────────────────────────────────────────────────

interface AIData {
  description: string;
  fragranceFamily: string;
  concentration: Concentration;
  ml: number;
  notes: { top: string[]; heart: string[]; base: string[] };
}

function makePrompt(name: string, brand: string, rawName: string): string {
  return `Sos experto en perfumería. Para la fragancia "${name}" de ${brand} (texto original: "${rawName}"), devolvé SOLO JSON:
{
  "description": "descripción evocadora en español, 2-3 oraciones",
  "fragranceFamily": "una de: Floral, Oriental, Amaderado, Fresco, Cítrico, Gourmand, Acuático, Chipre, Fougère",
  "concentration": "una de: EDP, EDT, EDC, EDP_INTENSE, PARFUM, BODY_MIST",
  "ml": 100,
  "notes": { "top": ["nota1","nota2"], "heart": ["nota1","nota2"], "base": ["nota1","nota2"] }
}
Si la marca es conocida (Dior, CK, Givenchy, etc.) usá notas reales. Solo JSON, sin markdown.`;
}

async function batchEnrich(items: Array<{ id: string; name: string; brand: string; rawName: string }>): Promise<Map<string, AIData>> {
  console.log(`\n  Enviando ${items.length} productos al Batch API de Claude…`);
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

  console.log(`  Batch ${batch.id} — esperando…`);
  const deadline = Date.now() + 12 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 6000));
    const s = await anthropic.messages.batches.retrieve(batch.id);
    process.stdout.write(`  ✓${s.request_counts.succeeded} ⏳${s.request_counts.processing}\r`);
    if (s.request_counts.processing === 0) break;
  }
  console.log("\n  Batch completo.");

  const results = new Map<string, AIData>();
  for await (const r of await anthropic.messages.batches.results(batch.id)) {
    if (r.result.type !== "succeeded") continue;
    const text = r.result.message.content[0].type === "text" ? r.result.message.content[0].text : "{}";
    try {
      results.set(r.custom_id, JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim()) as AIData);
    } catch { /* skip */ }
  }
  return results;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Uso: npx tsx scripts/seed-top100.ts ./Articulos.csv");
    process.exit(1);
  }

  console.log("1. Parseando CSV…");
  const rows = parseFrigiaCSV(path.resolve(csvPath));
  console.log(`   ${rows.length} perfumes con stock encontrados.`);

  // Deduplicar por descripción normalizada
  const seen = new Set<string>();
  const deduped = rows.filter((r) => {
    const key = slugify(r.descripcion.slice(0, 40));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Puntuar y tomar top 100
  const scored = deduped
    .map((r) => ({ ...r, score: scoreProduct(r) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);

  console.log(`   Top 100 seleccionados.`);

  // Normalizar
  const products = scored.map((r, i) => {
    const name  = cleanName(r.descripcion, r.marca);
    const ml    = extractMl(r.descripcion);
    const conc  = extractConcentration(r.descripcion);
    const cat   = extractCategory(r.descripcion, conc);
    const sku   = r.sku || r.codigo || `${slugify(r.marca)}-${slugify(name)}-${i}`;
    const featured = LUXURY_BRANDS.has(r.marca.toUpperCase()) && r.precio > 150000;
    return { id: String(i), rawRow: r, name, ml, conc, cat, sku, featured };
  });

  console.log("2. Enriqueciendo con IA (Batch API)…");
  const aiMap = await batchEnrich(
    products.map((p) => ({ id: p.id, name: p.name, brand: p.rawRow.marca, rawName: p.rawRow.descripcion }))
  );
  console.log(`   ${aiMap.size}/${products.length} enriquecidos.`);

  console.log("3. Creando categorías…");
  const catMap = new Map<string, string>();
  for (const c of CATEGORIES_DEF) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
    catMap.set(c.slug, cat.id);
    console.log(`   ✓ ${c.name}`);
  }

  console.log("4. Insertando productos…");
  let created = 0, updated = 0, failed = 0;

  for (const p of products) {
    const ai    = aiMap.get(p.id);
    const marca = p.rawRow.marca.trim();

    const brandSlug = slugify(marca);
    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      update: {},
      create: { name: marca, slug: brandSlug },
    });

    const validConcs = new Set(["EDP", "EDT", "EDC", "EDP_INTENSE", "PARFUM", "BODY_MIST"]);
    const rawConc    = p.conc ?? ai?.concentration ?? "EDT";
    const conc       = (validConcs.has(rawConc) ? rawConc : "EDT") as Concentration;
    const ml         = p.ml > 0 ? p.ml : (ai?.ml ?? 100);
    const catId      = catMap.get(p.cat) ?? catMap.get("unisex")!;

    const slug = slugify(`${p.name}-${ml}ml-${brandSlug}`);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    const finalSlug    = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug;

    try {
      const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
      if (existing) {
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
            sku:  p.sku,
            price: p.rawRow.precio,
            stock: Math.max(0, Math.round(p.rawRow.stock)),
            ml,
            concentration: conc,
            fragranceFamily: ai?.fragranceFamily ?? "Floral",
            description:     ai?.description    ?? null,
            notes:           ai?.notes          ?? { top: [], heart: [], base: [] },
            images:  [],
            active:  true,
            featured: p.featured,
            brandId:    brand.id,
            categoryId: catId,
          },
        });
        created++;
      }
      process.stdout.write(`  [${created + updated}/${products.length}] ${p.name.slice(0, 40)}\r`);
    } catch (e) {
      console.error(`\n  ✗ ${p.name}: ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }

  console.log(`\n\n✓ Seed completo:`);
  console.log(`  Creados:      ${created}`);
  console.log(`  Actualizados: ${updated}`);
  console.log(`  Fallidos:     ${failed}`);

  const catStats = await Promise.all(
    CATEGORIES_DEF.map(async (c) => ({
      name: c.name,
      count: await prisma.product.count({ where: { category: { slug: c.slug } } }),
    }))
  );
  console.log("\n  Por categoría:");
  catStats.forEach((c) => console.log(`    ${c.name}: ${c.count}`));

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
