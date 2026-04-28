import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, CONCENTRATION_LABELS } from "@/lib/utils";
import type { ProductWithBrand } from "@/types";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: ProductWithBrand;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492364000000";
  const waMsg = encodeURIComponent(
    `Hola! Me interesa el perfume ${product.name} (${product.ml}ml). ¿Tienen disponibilidad?`
  );

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-lg hover:border-frigia-rose/30 transition-all duration-300">
      <Link href={`/catalogo/${product.slug}`} className="block">
        <div className="relative aspect-square bg-frigia-light overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl opacity-30">🌸</span>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-neutral-500 bg-white px-3 py-1 rounded-full border">
                Sin stock
              </span>
            </div>
          )}

          {product.featured && product.stock > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="gold">Destacado</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-frigia-gold font-medium uppercase tracking-wide mb-1">
          {product.brand.name}
        </p>
        <Link href={`/catalogo/${product.slug}`}>
          <h3 className="font-semibold text-frigia-dark text-sm leading-snug hover:text-frigia-deep transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-neutral-400 mt-1">
          {product.ml}ml ·{" "}
          {CONCENTRATION_LABELS[product.concentration] ?? product.concentration}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="font-bold text-frigia-dark text-base">
            {formatPrice(product.price)}
          </p>

          {product.stock > 0 ? (
            <AddToCartButton product={product} />
          ) : (
            <a
              href={`https://wa.me/${whatsapp}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
            >
              Consultar
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
