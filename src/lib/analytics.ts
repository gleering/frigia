declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    _fbq?: unknown;
    dataLayer?: unknown[];
  }
}

export function pixelEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}

export function gtagEvent(
  action: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  }
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  brand: string;
  category?: string;
}) {
  pixelEvent("ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "ARS",
  });
  gtagEvent("view_item", {
    currency: "ARS",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_brand: product.brand,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  brand: string;
}) {
  pixelEvent("AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "ARS",
  });
  gtagEvent("add_to_cart", {
    currency: "ARS",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_brand: product.brand,
        price: product.price,
        quantity: 1,
      },
    ],
  });
}

export function trackPurchase(order: {
  id: string;
  total: number;
  items: { id: string; name: string; price: number; quantity: number }[];
}) {
  pixelEvent("Purchase", {
    content_ids: order.items.map((i) => i.id),
    content_type: "product",
    value: order.total,
    currency: "ARS",
    num_items: order.items.reduce((s, i) => s + i.quantity, 0),
  });
  gtagEvent("purchase", {
    transaction_id: order.id,
    currency: "ARS",
    value: order.total,
    items: order.items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}
