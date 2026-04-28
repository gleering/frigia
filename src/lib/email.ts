import { resend, FROM } from "@/lib/resend";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem, Product } from "@/types";

type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export async function sendOrderConfirmationEmail(order: OrderWithItems) {
  const address = order.shippingAddress as {
    street: string;
    number: string;
    apartment?: string;
    city: string;
    province: string;
    postalCode: string;
  };

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8e4;">${item.product.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8e4;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8e4;text-align:right;">${formatPrice(Number(item.price))}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#faf6f2;font-family:sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:#2c1810;padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">FRIGIA</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;">PERFUMERÍA</p>
    </div>

    <div style="padding:40px;">
      <h2 style="color:#2c1810;margin:0 0 8px;">¡Gracias por tu compra!</h2>
      <p style="color:#666;margin:0 0 24px;">Hola ${order.customerName}, recibimos tu pedido correctamente.</p>

      <div style="background:#faf6f2;border-radius:8px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;color:#b8966e;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Número de pedido</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#2c1810;font-family:monospace;">${order.id.slice(-8).toUpperCase()}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #f0e8e4;color:#666;font-size:12px;font-weight:600;text-transform:uppercase;">Producto</th>
            <th style="text-align:center;padding:8px 0;border-bottom:2px solid #f0e8e4;color:#666;font-size:12px;font-weight:600;text-transform:uppercase;">Cant.</th>
            <th style="text-align:right;padding:8px 0;border-bottom:2px solid #f0e8e4;color:#666;font-size:12px;font-weight:600;text-transform:uppercase;">Precio</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0 0;font-weight:700;color:#2c1810;">Total</td>
            <td style="padding:12px 0 0;text-align:right;font-weight:700;color:#2c1810;font-size:18px;">${formatPrice(Number(order.total))}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#faf6f2;border-radius:8px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-weight:600;color:#2c1810;">Dirección de envío</p>
        <p style="margin:0;color:#666;line-height:1.6;">
          ${address.street} ${address.number}${address.apartment ? `, ${address.apartment}` : ""}<br>
          ${address.city}, ${address.province} (${address.postalCode})
        </p>
      </div>

      <p style="color:#666;font-size:14px;margin:0 0 24px;">
        Nos vamos a comunicar con vos para coordinar el envío.
        Si tenés preguntas, respondé este email o contactanos por WhatsApp.
      </p>

      <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492364000000"}"
         style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 24px;border-radius:24px;font-weight:600;font-size:14px;">
        Consultar por WhatsApp
      </a>
    </div>

    <div style="background:#faf6f2;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#999;font-size:12px;">
        Frigia Perfumería · Av. República 732, Junín, Buenos Aires<br>
        @frigiaperfumeria
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Pedido confirmado #${order.id.slice(-8).toUpperCase()} — Frigia Perfumería`,
    html,
  });
}
