import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, slug: true, images: true, brand: true },
          },
        },
      },
    },
  }).catch(() => null);

  if (!order) notFound();

  const address = order.shippingAddress as {
    street: string;
    number: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode: string;
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/pedidos"
          className="text-sm text-neutral-400 hover:text-frigia-deep transition-colors"
        >
          ← Volver a pedidos
        </Link>
        <div className="flex items-center gap-4 mt-3">
          <h1 className="text-2xl font-bold text-frigia-dark">
            Pedido #{order.id.slice(-8).toUpperCase()}
          </h1>
          <Badge variant={STATUS_VARIANTS[order.status]}>
            {STATUS_LABELS[order.status]}
          </Badge>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          {new Date(order.createdAt).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: items + total */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-frigia-dark">Productos</h2>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-frigia-dark">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {item.product.brand.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center text-neutral-600">
                      ×{item.quantity}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-frigia-dark">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-neutral-200 bg-neutral-50">
                  <td
                    colSpan={2}
                    className="px-5 py-4 font-semibold text-frigia-dark"
                  >
                    Total
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-frigia-dark text-base">
                    {formatPrice(Number(order.total))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Change status */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="font-semibold text-frigia-dark mb-4">
              Cambiar estado
            </h2>
            <div className="flex items-center gap-3">
              <OrderStatusSelect
                orderId={order.id}
                current={order.status}
              />
              <p className="text-xs text-neutral-400">
                El cambio se aplica inmediatamente
              </p>
            </div>
          </div>
        </div>

        {/* Right: customer + address + MP info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="font-semibold text-frigia-dark mb-3">Cliente</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-frigia-dark">{order.customerName}</p>
              <p className="text-neutral-500">{order.customerEmail}</p>
              {order.customerPhone && (
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-green-600 hover:text-green-700 text-xs font-medium"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                  </svg>
                  {order.customerPhone}
                </a>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="font-semibold text-frigia-dark mb-3">
              Dirección de envío
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {address.street} {address.number}
              {address.apartment ? `, ${address.apartment}` : ""}
              <br />
              {address.city}, {address.province}
              <br />
              CP {address.postalCode}
            </p>
          </div>

          {(order.mpPaymentId || order.mpPreferenceId) && (
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-frigia-dark mb-3">
                MercadoPago
              </h2>
              <div className="space-y-1 text-xs font-mono text-neutral-500">
                {order.mpPaymentId && (
                  <p>
                    <span className="text-neutral-400">Pago ID:</span>{" "}
                    {order.mpPaymentId}
                  </p>
                )}
                {order.mpPreferenceId && (
                  <p>
                    <span className="text-neutral-400">Preferencia:</span>{" "}
                    {order.mpPreferenceId}
                  </p>
                )}
              </div>
            </div>
          )}

          {order.notes && (
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-frigia-dark mb-2">
                Comentarios
              </h2>
              <p className="text-sm text-neutral-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
