"use client";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { trackAddToCart } from "@/lib/analytics";
import type { ProductWithBrand } from "@/types";

interface Props {
  product: ProductWithBrand;
  /** Full CTA button — used on product detail page */
  full?: boolean;
}

export function AddToCartButton({ product, full = false }: Props) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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

  if (full) {
    return (
      <button
        onClick={handleAdd}
        className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-200 ${
          added ? "bg-green-500 text-white" : "bg-frigia-dark text-frigia-bone hover:bg-frigia-graphite active:scale-95"
        }`}
      >
        {added ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            ¡Agregado!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7h14l-1 13H6L5 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>
            </svg>
            Agregar al carrito
          </>
        )}
      </button>
    );
  }

  /* Compact circular button for product cards */
  return (
    <button
      onClick={handleAdd}
      aria-label="Agregar al carrito"
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
        added ? "bg-green-500" : "bg-frigia-dark hover:bg-frigia-graphite"
      }`}
    >
      {added ? (
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-frigia-bone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      )}
    </button>
  );
}
