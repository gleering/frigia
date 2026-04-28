"use client";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { trackAddToCart } from "@/lib/analytics";
import type { ProductWithBrand } from "@/types";

interface Props {
  product: ProductWithBrand;
  showLabel?: boolean;
}

export function AddToCartButton({ product, showLabel = false }: Props) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      slug: product.slug,
      brand: product.brand.name,
      ml: product.ml,
      concentration: product.concentration,
    });
    trackAddToCart({ id: product.id, name: product.name, price: product.price, brand: product.brand.name });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
        added
          ? "bg-green-500 text-white scale-95"
          : "bg-frigia-deep text-white hover:bg-frigia-deep/90 active:scale-95"
      }`}
    >
      {added ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {showLabel && "¡Agregado!"}
          {!showLabel && "✓"}
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
          </svg>
          {showLabel ? "Agregar al carrito" : "Agregar"}
        </>
      )}
    </button>
  );
}
