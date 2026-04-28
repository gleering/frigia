import { NextRequest, NextResponse } from "next/server";
import { payment } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { OrderStatus } from "@/generated/prisma/client";

const MP_STATUS_MAP: Record<string, OrderStatus> = {
  approved: "PAID",
  pending: "PENDING",
  in_process: "PENDING",
  rejected: "CANCELLED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
  charged_back: "REFUNDED",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || body.type !== "payment" || !body.data?.id) {
    return NextResponse.json({ received: true });
  }

  try {
    const paymentData = await payment.get({ id: body.data.id });

    const externalRef = paymentData.external_reference;
    if (!externalRef) return NextResponse.json({ received: true });

    const order = await prisma.order.findUnique({
      where: { id: externalRef },
      include: { items: { include: { product: true } } },
    });

    if (!order) return NextResponse.json({ received: true });

    const newStatus = MP_STATUS_MAP[paymentData.status ?? ""] ?? "PENDING";

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        mpPaymentId: String(paymentData.id),
      },
    });

    if (newStatus === "PAID" && order.status !== "PAID") {
      try {
        await sendOrderConfirmationEmail(order);
      } catch {
        // non-blocking
      }

      // Descontar stock
      await Promise.all(
        order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );
    }
  } catch (err) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
