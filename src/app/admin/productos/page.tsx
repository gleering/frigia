import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, CONCENTRATION_LABELS } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; marca?: string }>;
}) {
  const { q, marca } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { sku: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        marca ? { brand: { slug: marca } } : {},
      ],
    },
    include: { brand: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-frigia-dark">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-frigia-deep text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-frigia-deep/90 transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 mb-4 p-3">
        <form className="flex gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o SKU..."
            className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-frigia-rose/50"
          />
          <button
            type="submit"
            className="bg-frigia-deep text-white text-sm px-4 py-2 rounded-lg hover:bg-frigia-deep/90 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-400 text-sm">
            {q ? "No se encontraron resultados" : "Todavía no hay productos"}
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="mt-4 inline-block text-frigia-deep text-sm font-medium hover:underline"
          >
            Agregar el primer producto →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Producto
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    SKU
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Marca
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">
                    Precio
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Estado
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-frigia-dark">{p.name}</p>
                        <p className="text-xs text-neutral-400">
                          {p.ml}ml ·{" "}
                          {CONCENTRATION_LABELS[p.concentration] ??
                            p.concentration}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 font-mono text-xs">
                      {p.sku}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {p.brand.name}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-frigia-dark">
                      {formatPrice(Number(p.price))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          p.stock === 0
                            ? "text-red-500 font-medium"
                            : p.stock <= 3
                            ? "text-amber-600 font-medium"
                            : "text-neutral-600"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={p.active ? "success" : "default"}>
                          {p.active ? "Activo" : "Inactivo"}
                        </Badge>
                        {p.featured && (
                          <Badge variant="gold">Destacado</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <ToggleActiveButton id={p.id} active={p.active} />
                        <Link
                          href={`/admin/productos/${p.id}/editar`}
                          className="text-xs text-frigia-deep hover:underline font-medium"
                        >
                          Editar
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-neutral-100 text-xs text-neutral-400">
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
