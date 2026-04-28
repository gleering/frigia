import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { formatPrice, CONCENTRATION_LABELS } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { PixelProductEvents } from "@/components/analytics/PixelProductEvents";
import type { ProductWithBrand } from "@/types";

export const revalidate = 3600;

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
    where: {
      active: true,
      brandId: product.brandId,
      id: { not: product.id },
    },
    include: { brand: true, category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const notes = product.notes as {
    top: string[];
    heart: string[];
    base: string[];
  };

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492364000000";
  const waMsg = encodeURIComponent(
    `Hola Frigia! Me interesa el ${product.name} (${product.ml}ml). ¿Tienen stock?`
  );

  const productForCart: ProductWithBrand = {
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
    notes: notes,
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
    <div className="max-w-6xl mx-auto px-4 py-10">
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
      {/* Breadcrumb */}
      <nav className="text-xs text-neutral-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-frigia-deep transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <Link
          href="/catalogo"
          className="hover:text-frigia-deep transition-colors"
        >
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-frigia-dark">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div>
          {product.images.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-frigia-light">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.slice(1).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-lg overflow-hidden bg-frigia-light border border-neutral-200"
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 2}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-2xl bg-frigia-light flex items-center justify-center">
              <span className="text-8xl opacity-30">🌸</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-frigia-gold text-sm font-semibold uppercase tracking-wider mb-2">
            {product.brand.name}
          </p>
          <h1 className="font-display text-3xl font-bold text-frigia-dark mb-1">
            {product.name}
          </h1>
          <p className="text-neutral-500 text-sm mb-4">
            {product.ml}ml ·{" "}
            {CONCENTRATION_LABELS[product.concentration] ??
              product.concentration}
            {product.category && ` · ${product.category.name}`}
          </p>

          <p className="text-3xl font-bold text-frigia-dark mb-6">
            {formatPrice(Number(product.price))}
          </p>

          {product.stock > 0 ? (
            <div className="flex flex-col gap-3 mb-6">
              <AddToCartButton product={productForCart} showLabel />
              <a
                href={`https://wa.me/${whatsapp}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                </svg>
                Comprar por WhatsApp
              </a>
              <p className="text-xs text-neutral-400 text-center">
                Stock disponible: {product.stock} unidades
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-neutral-100 text-neutral-500 text-center py-3 rounded-xl text-sm font-medium mb-3">
                Sin stock disponible
              </div>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  `Hola! Me interesa ${product.name} que figura sin stock. ¿Cuándo lo tendrían?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-green-500 text-green-600 font-medium py-3 px-6 rounded-xl hover:bg-green-50 transition-colors text-sm"
              >
                Consultar disponibilidad
              </a>
            </div>
          )}

          {/* Fragrance family */}
          <div className="bg-frigia-light rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Familia olfativa
            </p>
            <p className="text-frigia-dark font-medium">{product.fragranceFamily}</p>
          </div>

          {/* Notes */}
          {(notes.top.length > 0 ||
            notes.heart.length > 0 ||
            notes.base.length > 0) && (
            <div className="bg-white border border-neutral-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Pirámide olfativa
              </p>
              <div className="flex flex-col gap-2 text-sm">
                {notes.top.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-frigia-gold">
                      Salida:{" "}
                    </span>
                    <span className="text-neutral-600">
                      {notes.top.join(", ")}
                    </span>
                  </div>
                )}
                {notes.heart.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-frigia-rose">
                      Corazón:{" "}
                    </span>
                    <span className="text-neutral-600">
                      {notes.heart.join(", ")}
                    </span>
                  </div>
                )}
                {notes.base.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-frigia-dark font-semibold">
                      Fondo:{" "}
                    </span>
                    <span className="text-neutral-600">
                      {notes.base.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-xl font-bold text-frigia-dark mb-3">
            Descripción
          </h2>
          <p className="text-neutral-600 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-frigia-dark mb-6">
            Más de {product.brand.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/catalogo/${p.slug}`}
                className="group bg-white rounded-2xl border border-neutral-100 hover:shadow-lg transition-shadow p-4"
              >
                <p className="text-xs text-frigia-gold font-medium mb-1">
                  {p.brand.name}
                </p>
                <p className="text-sm font-semibold text-frigia-dark group-hover:text-frigia-deep transition-colors line-clamp-2">
                  {p.name}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {p.ml}ml
                </p>
                <p className="text-sm font-bold text-frigia-dark mt-2">
                  {formatPrice(Number(p.price))}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
