export type { Product, Brand, Category, Order, OrderItem, OrderStatus, Concentration } from "@/generated/prisma/client";

export type ProductWithBrand = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  ml: number;
  concentration: string;
  fragranceFamily: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  images: string[];
  active: boolean;
  featured: boolean;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string } | null;
};

export type ShippingAddress = {
  street: string;
  number: string;
  city: string;
  province: string;
  postalCode: string;
  apartment?: string;
};

export type CheckoutFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  notes?: string;
};
