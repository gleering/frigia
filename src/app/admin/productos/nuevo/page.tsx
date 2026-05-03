import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nuevo Producto" };

export default async function NuevoProductoPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    prisma.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-frigia-dark mb-6">
        Nuevo producto
      </h1>
      <ProductForm brands={brands} categories={categories} />
    </div>
  );
}
