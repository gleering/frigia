import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, CONCENTRATION_LABELS } from "@/lib/utils";
import type { ProductWithBrand } from "@/types";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: ProductWithBrand;
}

const ACCENTS = [
  "#f3ede4", "#e8e4f0", "#e4ede8", "#f0e8e4",
  "#e4e8f0", "#f0ede4", "#e8f0ec", "#f0e4ec",
];

function accentForId(id: string): string {
  return ACCENTS[id.charCodeAt(id.length - 1) % ACCENTS.length];
}

function ProductPlaceholder({ brand, accent }: { brand: string; accent: string }) {
  const initial = brand.charAt(0).toUpperCase();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: accent }}>
      <span
        className="font-display italic font-medium select-none"
        style={{ fontSize: "5rem", color: "#c9a96a", opacity: 0.22, lineHeight: 1 }}
      >
        {initial}
      </span>
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c9a96a"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.35, marginTop: -6 }}
      >
        <path d="M12 3s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/>
        <path d="M10 8c0 0-1 2-1 4" strokeWidth="0.6"/>
      </svg>
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const accent = accentForId(product.id);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492364000000";
  const waMsg = encodeURIComponent(
    `Hola! Me interesa el perfume ${product.name} (${product.ml}ml). ¿Tienen disponibilidad?`
  );

  return (
    <article className="group" style={{ width: "100%" }}>
      <Link href={`/catalogo/${product.slug}`} className="block">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ background: accent, aspectRatio: "3/4" }}
        >
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <ProductPlaceholder brand={product.brand.name} accent={accent} />
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-frigia-mute bg-white/90 px-3 py-1 rounded-full">
                Sin stock
              </span>
            </div>
          )}

          {product.featured && product.stock > 0 && (
            <div className="absolute top-2.5 left-2.5">
              <Badge variant="dark">Destacado</Badge>
            </div>
          )}

          {/* Heart — solo en hover en desktop */}
          <button
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
            style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)" }}
            aria-label="Guardar"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>
            </svg>
          </button>

          {/* Add / Consultar — siempre visible en mobile, hover en desktop */}
          {product.stock > 0 ? (
            <div className="absolute bottom-2.5 right-2.5 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
              <AddToCartButton product={product} />
            </div>
          ) : (
            <a
              href={`https://wa.me/${whatsapp}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
              style={{ background: "#25d366" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
              </svg>
            </a>
          )}
        </div>
      </Link>

      <div className="pt-3 px-0.5">
        <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-frigia-mute">
          {product.brand.name}
        </p>
        <Link href={`/catalogo/${product.slug}`}>
          <h3 className="font-display italic font-medium text-[17px] leading-tight text-frigia-deep mt-1 hover:text-frigia-graphite transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] text-frigia-mute mt-0.5">
          {product.fragranceFamily} · {product.ml} ml
          {" · "}{CONCENTRATION_LABELS[product.concentration] ?? product.concentration}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-bold text-frigia-deep">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
