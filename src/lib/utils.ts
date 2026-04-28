export function cn(...classes: (string | undefined | null | false | 0)[]) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(price: number | string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price));
}

import type { ProductWithBrand } from "@/types";

// Converts Prisma Decimal price to number for client use
export function mapProduct(p: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: { toNumber(): number } | number;
  stock: number;
  ml: number;
  concentration: string;
  fragranceFamily: string;
  notes: unknown;
  images: string[];
  active: boolean;
  featured: boolean;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string } | null;
}): ProductWithBrand {
  return {
    ...p,
    price:
      typeof p.price === "number" ? p.price : (p.price as { toNumber(): number }).toNumber(),
    notes: p.notes as { top: string[]; heart: string[]; base: string[] },
  };
}

export const CONCENTRATION_LABELS: Record<string, string> = {
  EDP: "Eau de Parfum",
  EDT: "Eau de Toilette",
  EDC: "Eau de Cologne",
  EDP_INTENSE: "EDP Intenso",
  PARFUM: "Parfum",
  BODY_MIST: "Body Mist",
};
