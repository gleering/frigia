import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalProducts, activeProducts, totalOrders, pendingOrders, brands] =
    await Promise.all([
      prisma.product.count().catch(() => 0),
      prisma.product.count({ where: { active: true } }).catch(() => 0),
      prisma.order.count().catch(() => 0),
      prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.brand.count().catch(() => 0),
    ]);

  const stats = [
    { label: "Productos totales", value: totalProducts, href: "/admin/productos" },
    { label: "Productos activos", value: activeProducts, href: "/admin/productos" },
    { label: "Pedidos totales", value: totalOrders, href: "/admin/pedidos" },
    { label: "Pedidos pendientes", value: pendingOrders, href: "/admin/pedidos" },
    { label: "Marcas", value: brands, href: "/admin/productos" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-frigia-dark mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-3xl font-bold text-frigia-deep">{s.value}</p>
            <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/admin/productos/nuevo"
          className="bg-frigia-deep text-white rounded-xl p-6 hover:bg-frigia-deep/90 transition-colors"
        >
          <p className="text-2xl mb-2">+</p>
          <p className="font-semibold">Agregar producto</p>
          <p className="text-sm text-white/70 mt-1">Crear un nuevo perfume</p>
        </Link>
        <Link
          href="/admin/productos/importar"
          className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <p className="text-2xl mb-2">↑</p>
          <p className="font-semibold text-frigia-dark">Importar CSV</p>
          <p className="text-sm text-neutral-500 mt-1">
            Carga masiva con enriquecimiento IA
          </p>
        </Link>
      </div>
    </div>
  );
}
