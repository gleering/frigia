import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice, CONCENTRATION_LABELS } from "@/lib/utils";
import { ProductTabs } from "@/components/store/ProductTabs";
import { ProductCard } from "@/components/store/ProductCard";
import { PixelProductEvents } from "@/components/analytics/PixelProductEvents";
import { mapProduct } from "@/lib/utils";
import type { ProductWithBrand } from "@/types";

export const revalidate = 3600;

/* Misma paleta suave que ProductCard */
const ACCENTS = [
  "#f3ede4", "#e8e4f0", "#e4ede8", "#f0e8e4",
  "#e4e8f0", "#f0ede4", "#e8f0ec", "#f0e4ec",
];
function accentForId(id: string): string {
  return ACCENTS[id.charCodeAt(id.length - 1) % ACCENTS.length];
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true },
    take: 50,
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true },
  });
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: `${product.name} ${product.ml}ml | ${product.brand.name}`,
    description:
      product.description ??
      `${product.name} ${CONCENTRATION_LABELS[product.concentration]} ${product.ml}ml de ${product.brand.name}`,
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: { brand: true, category: true },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, brandId: product.brandId, id: { not: product.id } },
    include: { brand: true, category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const notes = product.notes as { top: string[]; heart: string[]; base: string[] };
  const accent = accentForId(product.id);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492364000000";

  const productForClient: ProductWithBrand = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    ml: product.ml,
    concentration: product.concentration,
    fragranceFamily: product.fragranceFamily,
    notes,
    images: product.images,
    active: product.active,
    featured: product.featured,
    brand: product.brand,
    category: product.category,
  };

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://frigiaperfumeria.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "ARS",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${base}/catalogo/${product.slug}`,
    },
    ...(product.images[0] ? { image: product.images[0] } : {}),
  };

  return (
    <div className="bg-frigia-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PixelProductEvents
        product={{
          id: product.id,
          name: product.name,
          price: Number(product.price),
          brand: product.brand.name,
          category: product.category?.name,
        }}
      />

      {/* ── Hero image — tinted background ── */}
      <div
        className="relative w-full"
        style={{ background: accent, minHeight: 360 }}
      >
        {product.images[0] ? (
          <div className="relative max-w-lg mx-auto" style={{ aspectRatio: "3/4", maxHeight: 480 }}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center" style={{ minHeight: 360 }}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c9a96a"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-30"
            >
              <path d="M12 3s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12Z" />
            </svg>
          </div>
        )}

        {/* Thumbnail strip for multiple images */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((img, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/60"
                style={{ background: accent }}
              >
                <Image src={img} alt="" width={40} height={40} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Content sheet ── */}
      <div
        className="relative bg-frigia-paper rounded-t-3xl -mt-5 z-10 max-w-6xl mx-auto px-4 pt-6 pb-16"
      >
        {/* Breadcrumb */}
        <nav className="text-[10px] text-frigia-mute flex items-center gap-2 mb-5">
          <Link href="/" className="hover:text-frigia-deep transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-frigia-deep transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-frigia-deep truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left col: brand + name + meta */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-frigia-mute">
              {product.brand.name}
            </p>
            <h1 className="font-display italic font-medium text-[clamp(28px,5vw,40px)] leading-tight text-frigia-deep mt-1">
              {product.name}
            </h1>
            <p className="text-xs text-frigia-mute mt-2">
              {product.fragranceFamily} · {product.ml} ml ·{" "}
              {CONCENTRATION_LABELS[product.concentration] ?? product.concentration}
            </p>

            {/* Price — visible on mobile above tabs, hidden md (shown in right col) */}
            <div className="md:hidden mt-5">
              <span className="text-3xl font-bold text-frigia-deep">
                {formatPrice(Number(product.price))}
              </span>
              <p className="text-[11px] text-frigia-mute mt-0.5">
                o 3 cuotas sin interés de {formatPrice(Number(product.price) / 3)}
              </p>
            </div>

            {/* Fragrance family pill — desktop accent */}
            <div className="hidden md:flex flex-wrap gap-2 mt-5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-frigia-graphite"
                style={{ background: accent }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--frigia-grad)" }}
                />
                {product.fragranceFamily}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-frigia-graphite"
                style={{ background: accent }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--frigia-grad)" }}
                />
                {product.ml} ml
              </span>
            </div>

            {/* Description — desktop only in left col */}
            {product.description && (
              <p className="hidden md:block text-sm leading-relaxed text-frigia-graphite mt-6">
                {product.description}
              </p>
            )}
          </div>

          {/* Right col: tabs + CTA */}
          <div>
            <ProductTabs product={productForClient} whatsapp={whatsapp} />
          </div>
        </div>
      </div>

      {/* ── Productos relacionados ── */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="border-t border-frigia-light pt-10 mb-6 flex items-baseline justify-between">
            <h2 className="font-display italic font-medium text-2xl text-frigia-deep">
              Más de {product.brand.name}
            </h2>
            <Link
              href={`/catalogo?marca=${product.brand.slug}`}
              className="text-[10px] font-semibold tracking-widest uppercase text-frigia-mute hover:text-frigia-deep transition-colors"
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={mapProduct(p)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
