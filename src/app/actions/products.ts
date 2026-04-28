"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Concentration } from "@/generated/prisma/client";
import { slugify } from "@/lib/utils";

export interface ProductInput {
  name: string;
  brandId: string;
  categoryId: string | null;
  sku: string;
  price: number;
  stock: number;
  ml: number;
  concentration: Concentration;
  fragranceFamily: string;
  description: string;
  images: string[];
  notes: { top: string[]; heart: string[]; base: string[] };
  featured: boolean;
  active?: boolean;
}

export async function createProduct(
  data: ProductInput
): Promise<{ error?: string }> {
  try {
    const slug = slugify(`${data.name}-${data.ml}ml`);

    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    await prisma.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        ml: data.ml,
        concentration: data.concentration,
        fragranceFamily: data.fragranceFamily,
        description: data.description || null,
        images: data.images,
        notes: data.notes,
        featured: data.featured,
        brandId: data.brandId,
        categoryId: data.categoryId || null,
      },
    });

    revalidatePath("/catalogo");
    revalidatePath("/admin/productos");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    if (msg.includes("Unique constraint") && msg.includes("sku")) {
      return { error: "El SKU ya está en uso" };
    }
    return { error: msg };
  }

  redirect("/admin/productos");
}

export async function updateProduct(
  id: string,
  data: ProductInput
): Promise<{ error?: string }> {
  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        ml: data.ml,
        concentration: data.concentration,
        fragranceFamily: data.fragranceFamily,
        description: data.description || null,
        images: data.images,
        notes: data.notes,
        featured: data.featured,
        active: data.active ?? true,
        brandId: data.brandId,
        categoryId: data.categoryId || null,
      },
    });

    revalidatePath("/catalogo");
    revalidatePath("/admin/productos");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return { error: msg };
  }

  redirect("/admin/productos");
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/catalogo");
    revalidatePath("/admin/productos");
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error al eliminar" };
  }
}

export async function toggleProductActive(
  id: string,
  active: boolean
): Promise<void> {
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}

export async function bulkUpdatePrices(
  percentage: number,
  categoryId?: string
): Promise<{ updated: number; error?: string }> {
  try {
    const where = categoryId ? { categoryId } : {};
    const products = await prisma.product.findMany({
      where,
      select: { id: true, price: true },
    });

    const factor = 1 + percentage / 100;
    await Promise.all(
      products.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { price: Math.round(Number(p.price) * factor) },
        })
      )
    );

    revalidatePath("/catalogo");
    revalidatePath("/admin/productos");
    return { updated: products.length };
  } catch (e: unknown) {
    return {
      updated: 0,
      error: e instanceof Error ? e.message : "Error al actualizar precios",
    };
  }
}

export async function createBrand(
  name: string
): Promise<{ id: string; error?: string }> {
  try {
    const slug = slugify(name);
    const brand = await prisma.brand.create({ data: { name, slug } });
    revalidatePath("/admin/productos");
    return { id: brand.id };
  } catch (e: unknown) {
    return { id: "", error: e instanceof Error ? e.message : "Error" };
  }
}

export async function createCategory(
  name: string
): Promise<{ id: string; error?: string }> {
  try {
    const slug = slugify(name);
    const cat = await prisma.category.create({ data: { name, slug } });
    revalidatePath("/admin/productos");
    return { id: cat.id };
  } catch (e: unknown) {
    return { id: "", error: e instanceof Error ? e.message : "Error" };
  }
}
