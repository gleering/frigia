import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichProductText, enrichProductsBatchText, pollBatchResults } from "@/lib/ai";
import { slugify } from "@/lib/utils";
import type { Concentration } from "@/generated/prisma/client";

const VALID_CONCENTRATIONS = new Set([
  "EDP", "EDT", "EDC", "EDP_INTENSE", "PARFUM", "BODY_MIST",
]);

function parseConcentration(raw: string): Concentration {
  const up = raw.toUpperCase().trim();
  if (VALID_CONCENTRATIONS.has(up)) return up as Concentration;
  return "EDT";
}

interface CsvRow {
  name: string;
  brand: string;
  sku: string;
  price: number;
  stock: number;
  ml: number;
  concentration: string;
}

function parseCsv(raw: string): CsvRow[] {
  const lines = raw.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (col: string) => header.indexOf(col);

  return lines.slice(1).flatMap((line) => {
    const cols = line.split(",");
    const name = cols[idx("name")]?.trim() ?? "";
    const brand = cols[idx("brand")]?.trim() ?? "";
    const sku = cols[idx("sku")]?.trim() ?? `${slugify(brand)}-${slugify(name)}-${Date.now()}`;
    const price = parseFloat(cols[idx("price")]?.trim() ?? "0");
    const stock = parseInt(cols[idx("stock")]?.trim() ?? "0", 10);
    const ml = parseInt(cols[idx("ml")]?.trim() ?? "100", 10);
    const concentration = cols[idx("concentration")]?.trim() ?? "EDT";

    if (!name || !brand) return [];
    return [{ name, brand, sku, price, stock, ml, concentration }];
  });
}

export async function POST(req: NextRequest) {
  try {
    const { csv } = (await req.json()) as { csv?: string };
    if (!csv?.trim()) {
      return NextResponse.json({ error: "CSV vacío" }, { status: 400 });
    }

    const rows = parseCsv(csv);
    if (rows.length === 0) {
      return NextResponse.json({ error: "No se encontraron filas válidas" }, { status: 400 });
    }

    // Get or create a "Perfumes" category
    const perfumeCategory = await prisma.category.upsert({
      where: { slug: "perfumes" },
      update: {},
      create: { name: "Perfumes", slug: "perfumes" },
    });

    // Enrich with AI — Batch API for >10 items, individual for ≤10
    const enriched = new Map<string, Awaited<ReturnType<typeof enrichProductText>>>();

    if (rows.length > 10) {
      const batchItems = rows.map((r, i) => ({
        id: String(i),
        name: r.name,
        brand: r.brand,
      }));
      const batch = await enrichProductsBatchText(batchItems);
      const results = await pollBatchResults(batch.id);
      results.forEach((data, id) => enriched.set(id, data));
    } else {
      await Promise.all(
        rows.map(async (r, i) => {
          const data = await enrichProductText(r.name, r.brand);
          enriched.set(String(i), data);
        })
      );
    }

    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const ai = enriched.get(String(i));

      // Upsert brand
      const brandSlug = slugify(row.brand);
      const brand = await prisma.brand.upsert({
        where: { slug: brandSlug },
        update: {},
        create: { name: row.brand, slug: brandSlug },
      });

      const slug = slugify(`${row.name}-${row.ml}ml`);
      const existing = await prisma.product.findUnique({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

      // Pick concentration: prefer AI's if CSV has none, validate both
      const rawConc = ai?.concentration ?? row.concentration;
      const concentration = parseConcentration(rawConc);
      const ml = row.ml > 0 ? row.ml : (ai?.ml ?? 100);

      try {
        await prisma.product.upsert({
          where: { sku: row.sku },
          update: {
            price: row.price,
            stock: row.stock,
          },
          create: {
            name: row.name,
            slug: finalSlug,
            sku: row.sku,
            price: row.price,
            stock: row.stock,
            ml,
            concentration,
            fragranceFamily: ai?.fragranceFamily ?? "Floral",
            description: ai?.description ?? null,
            notes: ai?.notes ?? { top: [], heart: [], base: [] },
            images: [],
            active: true,
            featured: false,
            brandId: brand.id,
            categoryId: perfumeCategory.id,
          },
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({ imported, skipped });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
