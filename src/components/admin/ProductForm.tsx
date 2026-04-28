"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { createProduct, updateProduct, ProductInput } from "@/app/actions/products";
import type { Brand, Category, Product } from "@/generated/prisma/client";
import { CONCENTRATION_LABELS } from "@/lib/utils";

const CONCENTRATIONS = Object.keys(CONCENTRATION_LABELS);

interface ProductFormProps {
  brands: Brand[];
  categories: Category[];
  product?: Product;
}

function tagsToString(arr: string[]): string {
  return arr.join(", ");
}
function stringToTags(s: string): string[] {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ProductForm({ brands, categories, product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  const notes = (product?.notes as { top: string[]; heart: string[]; base: string[] }) || {
    top: [],
    heart: [],
    base: [],
  };

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [notesTop, setNotesTop] = useState(tagsToString(notes.top));
  const [notesHeart, setNotesHeart] = useState(tagsToString(notes.heart));
  const [notesBase, setNotesBase] = useState(tagsToString(notes.base));

  function buildInput(formEl: HTMLFormElement): ProductInput {
    const fd = new FormData(formEl);
    return {
      name: fd.get("name") as string,
      brandId: fd.get("brandId") as string,
      categoryId: (fd.get("categoryId") as string) || null,
      sku: fd.get("sku") as string,
      price: parseFloat(fd.get("price") as string),
      stock: parseInt(fd.get("stock") as string) || 0,
      ml: parseInt(fd.get("ml") as string),
      concentration: fd.get("concentration") as ProductInput["concentration"],
      fragranceFamily: fd.get("fragranceFamily") as string,
      description: fd.get("description") as string,
      images,
      notes: {
        top: stringToTags(notesTop),
        heart: stringToTags(notesHeart),
        base: stringToTags(notesBase),
      },
      featured: fd.get("featured") === "on",
      active: product ? fd.get("active") === "on" : true,
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = buildInput(e.currentTarget);

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, data)
        : await createProduct(data);

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold text-frigia-dark mb-4">
          Información básica
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              name="name"
              label="Nombre del perfume"
              defaultValue={product?.name}
              required
              placeholder="Ej: Chanel N°5"
            />
          </div>

          <Select
            name="brandId"
            label="Marca"
            defaultValue={product?.brandId}
            required
            placeholder="Seleccionar marca"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>

          <Select
            name="categoryId"
            label="Categoría"
            defaultValue={product?.categoryId ?? ""}
            placeholder="Sin categoría"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Input
            name="sku"
            label="SKU"
            defaultValue={product?.sku}
            required
            placeholder="Ej: CHAN-N5-100"
            hint="Código único del producto"
          />

          <Select
            name="concentration"
            label="Concentración"
            defaultValue={product?.concentration}
            required
            placeholder="Seleccionar..."
          >
            {CONCENTRATIONS.map((c) => (
              <option key={c} value={c}>
                {CONCENTRATION_LABELS[c]}
              </option>
            ))}
          </Select>

          <Input
            name="ml"
            label="Mililitros (ml)"
            type="number"
            defaultValue={product?.ml}
            required
            min={1}
            placeholder="Ej: 100"
          />

          <Input
            name="fragranceFamily"
            label="Familia olfativa"
            defaultValue={product?.fragranceFamily}
            required
            placeholder="Ej: Floral amaderado"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold text-frigia-dark mb-4">
          Precio y stock
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="price"
            label="Precio (ARS)"
            type="number"
            defaultValue={product ? Number(product.price) : undefined}
            required
            min={0}
            step={1}
            placeholder="Ej: 15000"
          />
          <Input
            name="stock"
            label="Stock"
            type="number"
            defaultValue={product?.stock ?? 0}
            required
            min={0}
            placeholder="Ej: 10"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold text-frigia-dark mb-4">
          Notas olfativas
        </h2>
        <p className="text-xs text-neutral-500 mb-4">
          Separar con comas. Ej: &quot;bergamota, limón, mandarina&quot;
        </p>
        <div className="flex flex-col gap-4">
          <Input
            label="Notas de salida (top)"
            value={notesTop}
            onChange={(e) => setNotesTop(e.target.value)}
            placeholder="bergamota, limón, mandarina"
          />
          <Input
            label="Notas de corazón (heart)"
            value={notesHeart}
            onChange={(e) => setNotesHeart(e.target.value)}
            placeholder="rosa, jazmín, iris"
          />
          <Input
            label="Notas de fondo (base)"
            value={notesBase}
            onChange={(e) => setNotesBase(e.target.value)}
            placeholder="sándalo, almizcle, vainilla"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold text-frigia-dark mb-4">Descripción</h2>
        <Textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={4}
          placeholder="Descripción del perfume (puede generarse con IA en el proceso de importación)"
        />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <ImageUpload value={images} onChange={setImages} />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold text-frigia-dark mb-4">Opciones</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="h-4 w-4 rounded border-neutral-300 text-frigia-rose focus:ring-frigia-rose/50"
            />
            <span className="text-sm text-frigia-dark">
              Destacado en la página principal
            </span>
          </label>
          {product && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product.active}
                className="h-4 w-4 rounded border-neutral-300 text-frigia-rose focus:ring-frigia-rose/50"
              />
              <span className="text-sm text-frigia-dark">Activo (visible en la tienda)</span>
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isPending} size="lg">
          {product ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
