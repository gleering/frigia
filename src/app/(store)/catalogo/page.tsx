import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { CatalogFilters } from "@/components/store/CatalogFilters";
import type { Prisma, Concentration } from "@/generated/prisma/client";
import { Suspense } from "react";
import { mapProduct } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Catálogo de Perfumes",
  description:
    "Descubrí nuestra colección de perfumes originales en Junín, Buenos Aires.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    marca?: string;
    concentracion?: string;
    categoria?: string;
    orden?: string;
    destacado?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const { q, marca, concentracion, categoria, orden, destacado } = await searchParams;

  const where: Prisma.ProductWhereInput = {
    active: true,
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { brand: { name: { contains: q, mode: "insensitive" } } },
              { fragranceFamily: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      marca ? { brand: { slug: marca } } : {},
      concentracion ? { concentration: concentracion as Concentration } : {},
      categoria ? { category: { slug: categoria } } : {},
      destacado === "1" ? { featured: true } : {},
    ],
  };

  type OrderByClause = Prisma.ProductOrderByWithRelationInput;
  const orderBy: OrderByClause =
    orden === "precio_asc"
      ? { price: "asc" }
      : orden === "precio_desc"
      ? { price: "desc" }
      : orden === "nombre_asc"
      ? { name: "asc" }
      : { createdAt: "desc" };

  const [products, brands, categories, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy,
      take: 48,
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.count({ where }),
  ]);

  const activeFilters = [q, marca, concentracion, categoria].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-frigia-mute mb-1">
          Catálogo
        </p>
        <h1 className="font-display italic font-medium text-4xl md:text-5xl text-frigia-deep leading-none">
          Perfumes{" "}
          <span className="font-script text-frigia-gold-deep" style={{ fontSize: "0.7em" }}>
            &amp; fragancias
          </span>
        </h1>
        <p className="text-sm text-frigia-mute mt-3">
          {total} producto{total !== 1 ? "s" : ""}
          {activeFilters > 0 && " encontrados"}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-52 shrink-0">
          <Suspense>
            <CatalogFilters brands={brands} categories={categories} />
          </Suspense>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c9a96a"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4 opacity-50"
              >
                <path d="M12 3s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/>
              </svg>
              <p className="font-display italic text-xl text-frigia-mute mb-1">
                Sin resultados
              </p>
              <p className="text-sm text-frigia-mute/70">
                Probá con otros filtros o escribinos por WhatsApp
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={mapProduct(p)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
