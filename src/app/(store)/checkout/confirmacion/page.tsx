import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { formatPrice } from "@/lib/utils";
import { PixelPurchaseEvent } from "@/components/analytics/PixelPurchaseEvent";

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  if (!orderId) {
    return <Redirect />;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return <Redirect />;
  }

  if (order.status === "PENDING") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    try {
      await sendOrderConfirmationEmail(order);
    } catch {
      // email failure is non-blocking
    }
  }

  const address = order.shippingAddress as {
    street: string;
    number: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode: string;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <PixelPurchaseEvent
        order={{
          id: order.id,
          total: Number(order.total),
          items: order.items.map((i) => ({
            id: i.productId,
            name: i.product.name,
            price: Number(i.price),
            quantity: i.quantity,
          })),
        }}
      />
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="font-display text-3xl font-bold text-frigia-dark mb-3">
        ¡Pedido confirmado!
      </h1>
      <p className="text-neutral-500 mb-8">
        Gracias {order.customerName}. Te enviamos la confirmación a{" "}
        <strong>{order.customerEmail}</strong>.
      </p>

      <div className="bg-white rounded-xl border border-neutral-200 p-5 text-left mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-frigia-dark">Detalle del pedido</h2>
          <span className="text-xs font-mono bg-frigia-cream px-2 py-1 rounded text-frigia-dark">
            #{order.id.slice(-8).toUpperCase()}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-neutral-600">
                {item.product.name} ×{item.quantity}
              </span>
              <span className="text-neutral-700 font-medium">
                {formatPrice(Number(item.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-100 pt-3 flex justify-between">
          <span className="font-semibold text-frigia-dark">Total pagado</span>
          <span className="font-bold text-frigia-dark">
            {formatPrice(Number(order.total))}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-5 text-left mb-8">
        <h2 className="font-semibold text-frigia-dark mb-3">
          Dirección de entrega
        </h2>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {address.street} {address.number}
          {address.apartment ? `, ${address.apartment}` : ""}
          <br />
          {address.city}, {address.province} ({address.postalCode})
        </p>
        <p className="text-xs text-neutral-400 mt-2">
          Nos vamos a contactar para coordinar el envío.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/catalogo"
          className="bg-frigia-deep text-white font-semibold px-8 py-3 rounded-full hover:bg-frigia-deep/90 transition-colors text-sm"
        >
          Seguir comprando
        </Link>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492364000000"}?text=${encodeURIComponent("Hola Frigia! Acabo de realizar un pedido y quería coordinar el envío.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-green-600 transition-colors text-sm"
        >
          Coordinar envío por WhatsApp
        </a>
      </div>
    </div>
  );
}

function Redirect() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-frigia-dark mb-4">
        Pedido no encontrado
      </h1>
      <Link href="/" className="text-frigia-deep hover:underline text-sm">
        Volver al inicio
      </Link>
    </div>
  );
}
