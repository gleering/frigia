"use server";

import { prisma } from "@/lib/prisma";
import { preference } from "@/lib/mercadopago";
import type { CheckoutFormData } from "@/types";
import type { CartItem } from "@/store/cart";

export type CreateOrderResult =
  | { orderId: string; initPoint: string }
  | { error: string };

export async function createOrder(
  formData: CheckoutFormData,
  items: CartItem[]
): Promise<CreateOrderResult> {
  if (!items.length) return { error: "El carrito está vacío" };

  const productIds = items.map((i) => i.id);
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  for (const item of items) {
    const dbProduct = dbProducts.find((p) => p.id === item.id);
    if (!dbProduct) return { error: `Producto no disponible: ${item.name}` };
    if (dbProduct.stock < item.quantity)
      return { error: `Stock insuficiente: ${item.name} (disponible: ${dbProduct.stock})` };
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      shippingAddress: formData.shippingAddress,
      notes: formData.notes,
      total,
      items: {
        create: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const mpPreference = await preference.create({
    body: {
      external_reference: order.id,
      items: items.map((i) => ({
        id: i.id,
        title: `${i.name} ${i.ml}ml`,
        quantity: i.quantity,
        unit_price: i.price,
        currency_id: "ARS" as const,
      })),
      payer: {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone
          ? { number: formData.customerPhone }
          : undefined,
      },
      back_urls: {
        success: `${baseUrl}/checkout/confirmacion?order=${order.id}`,
        pending: `${baseUrl}/checkout/pendiente?order=${order.id}`,
        failure: `${baseUrl}/checkout/fallo?order=${order.id}`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "FRIGIA PERFUMERIA",
    },
  });

  const initPoint = mpPreference.init_point;
  if (!initPoint) return { error: "No se pudo crear la preferencia de pago" };

  await prisma.order.update({
    where: { id: order.id },
    data: { mpPreferenceId: mpPreference.id },
  });

  return { orderId: order.id, initPoint };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  mpPaymentId?: string
) {
  const validStatuses = [
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ] as const;

  type ValidStatus = (typeof validStatuses)[number];

  if (!validStatuses.includes(status as ValidStatus)) return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as ValidStatus,
      ...(mpPaymentId ? { mpPaymentId } : {}),
    },
  });
}
