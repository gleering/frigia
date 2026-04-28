import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { CatalogFilters } from "@/components/store/CatalogFilters";
import type { ProductWithBrand } from "@/types";
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
  }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const { q, marca, concentracion, categoria, orden } = await searchParams;

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
      concentracion
        ? { concentration: concentracion as Concentration }
        : {},
      categoria ? { category: { slug: categoria } } : {},
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-frigia-dark mb-2">
          Catálogo de perfumes
        </h1>
        <p className="text-neutral-500 text-sm">
          {total} producto{total !== 1 ? "s" : ""}
          {activeFilters > 0 && " encontrados"}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="md:w-52 shrink-0">
          <Suspense>
            <CatalogFilters brands={brands} categories={categories} />
          </Suspense>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-5xl mb-4">🌸</p>
              <p className="text-neutral-500 text-lg mb-2">
                No encontramos resultados
              </p>
              <p className="text-neutral-400 text-sm">
                Probá con otros filtros o escribinos por WhatsApp
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
