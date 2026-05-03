import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const STATUS_VARIANTS: Record<
  OrderStatus,
  "default" | "success" | "warning" | "danger" | "info" | "gold"
> = {
  PENDING: "warning",
  PAID: "success",
  PROCESSING: "info",
  SHIPPED: "gold",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "default",
};

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as OrderStatus } : undefined,
    include: {
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  }).catch(() => []);

  const counts = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  }).catch(() => []);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  const filterLinks: { label: string; value: string | null; status?: OrderStatus }[] = [
    { label: "Todos", value: null },
    { label: "Pendientes", value: "PENDING", status: "PENDING" },
    { label: "Pagados", value: "PAID", status: "PAID" },
    { label: "En preparación", value: "PROCESSING", status: "PROCESSING" },
    { label: "Enviados", value: "SHIPPED", status: "SHIPPED" },
    { label: "Entregados", value: "DELIVERED", status: "DELIVERED" },
    { label: "Cancelados", value: "CANCELLED", status: "CANCELLED" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-frigia-dark">Pedidos</h1>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filterLinks.map((f) => {
          const isActive = (status ?? null) === f.value;
          const count = f.status ? (countMap[f.status] ?? 0) : undefined;
          return (
            <Link
              key={f.label}
              href={f.value ? `/admin/pedidos?status=${f.value}` : "/admin/pedidos"}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? "bg-frigia-deep text-white border-frigia-deep"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-frigia-deep/40"
              }`}
            >
              {f.label}
              {count !== undefined && (
                <span className="ml-1 opacity-70">({count})</span>
              )}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-400 text-sm">No hay pedidos todavía</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    #
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Productos
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Fecha
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-frigia-dark">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {order.customerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs max-w-[200px]">
                      <p className="truncate">
                        {order.items
                          .map((i) => `${i.product.name} ×${i.quantity}`)
                          .join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-frigia-dark">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-xs text-frigia-deep hover:underline font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-neutral-100 text-xs text-neutral-400">
            {orders.length} pedido{orders.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
