"use client";
import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { formatPrice, CONCENTRATION_LABELS } from "@/lib/utils";
import type { ProductWithBrand } from "@/types";

interface Props {
  product: ProductWithBrand;
  whatsapp: string;
}

const TABS = ["Descripción", "Notas", "Envío"] as const;
type Tab = (typeof TABS)[number];

function GradDot() {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: "var(--frigia-grad)" }}
    />
  );
}

export function ProductTabs({ product, whatsapp }: Props) {
  const [tab, setTab] = useState<Tab>("Descripción");
  const notes = product.notes;
  const allNotes = [...notes.top, ...notes.heart, ...notes.base];
  const hasNotes = allNotes.length > 0;

  const waMsg = encodeURIComponent(
    `Hola Frigia! Me interesa ${product.name} (${product.ml}ml). ¿Tienen stock?`
  );
  const waMsgNoStock = encodeURIComponent(
    `Hola! Me interesa ${product.name} que figura sin stock. ¿Cuándo lo tendrían?`
  );

  return (
    <div>
      {/* ── Price block ── */}
      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-frigia-deep">
          {formatPrice(product.price)}
        </span>
      </div>
      <p className="text-[11px] text-frigia-mute mt-1">
        o 3 cuotas sin interés de {formatPrice(product.price / 3)}
      </p>

      {/* ── CTA ── */}
      <div className="mt-6 flex flex-col gap-2.5">
        {product.stock > 0 ? (
          <>
            <AddToCartButton product={product} full />
            <a
              href={`https://wa.me/${whatsapp}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-[#25d366] text-[#25d366] font-semibold py-3.5 rounded-full hover:bg-[#25d366]/5 transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
              </svg>
              Comprar por WhatsApp
            </a>
            <p className="text-[10px] text-frigia-mute text-center">
              {product.stock} unidad{product.stock !== 1 ? "es" : ""} disponible{product.stock !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <>
            <div className="text-center py-3.5 rounded-full bg-frigia-light text-frigia-mute text-sm font-medium">
              Sin stock disponible
            </div>
            <a
              href={`https://wa.me/${whatsapp}?text=${waMsgNoStock}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-[#25d366] text-[#25d366] font-medium py-3.5 rounded-full hover:bg-[#25d366]/5 transition-colors text-sm"
            >
              Consultar disponibilidad por WhatsApp
            </a>
          </>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="mt-8">
        {/* Tab bar */}
        <div
          className="flex gap-6 border-b"
          style={{ borderColor: "var(--color-frigia-light)" }}
        >
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-xs font-semibold tracking-wide transition-colors border-b-2 -mb-px ${
                  active
                    ? "text-frigia-deep border-frigia-deep"
                    : "text-frigia-mute border-transparent hover:text-frigia-deep"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="pt-5">
          {tab === "Descripción" && (
            <div className="space-y-4">
              {product.description ? (
                <p className="text-sm leading-relaxed text-frigia-graphite">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-frigia-mute italic">
                  {product.name} de {product.brand.name}. Una fragancia inconfundible.
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-frigia-cream text-[11px] font-medium text-frigia-graphite">
                  <GradDot />
                  {product.fragranceFamily}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-frigia-cream text-[11px] font-medium text-frigia-graphite">
                  <GradDot />
                  {product.ml} ml
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-frigia-cream text-[11px] font-medium text-frigia-graphite">
                  <GradDot />
                  {CONCENTRATION_LABELS[product.concentration] ?? product.concentration}
                </span>
              </div>
            </div>
          )}

          {tab === "Notas" && (
            <div className="space-y-5">
              {hasNotes ? (
                <>
                  {notes.top.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-frigia-mute mb-2.5">
                        Salida
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {notes.top.map((n) => (
                          <span
                            key={n}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-frigia-cream text-[11px] font-medium text-frigia-graphite"
                          >
                            <GradDot />
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {notes.heart.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-frigia-mute mb-2.5">
                        Corazón
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {notes.heart.map((n) => (
                          <span
                            key={n}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-frigia-cream text-[11px] font-medium text-frigia-graphite"
                          >
                            <GradDot />
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {notes.base.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold tracking-widest uppercase text-frigia-mute mb-2.5">
                        Fondo
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {notes.base.map((n) => (
                          <span
                            key={n}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-frigia-cream text-[11px] font-medium text-frigia-graphite"
                          >
                            <GradDot />
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-frigia-mute italic">
                  Notas olfativas no disponibles.
                </p>
              )}
            </div>
          )}

          {tab === "Envío" && (
            <div className="space-y-4">
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="11" height="10" rx="1"/><path d="M13 10h5l3 3v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
                    </svg>
                  ),
                  title: "Envío gratis a todo el país",
                  sub: "En compras mayores a $25.000",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 9v11M8 9c-2 0-3-3 0-3 2 0 4 3 4 3s2-3 4-3c3 0 2 3 0 3"/>
                    </svg>
                  ),
                  title: "3 muestras de regalo",
                  sub: "Incluidas con tu pedido",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 11l8-7 8 7v9H4v-9Z"/><path d="M9 20v-6h6v6"/>
                    </svg>
                  ),
                  title: "Retiro en local · Junín",
                  sub: "Av. República 732 — disponible hoy",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-frigia-cream flex items-center justify-center flex-shrink-0 text-frigia-graphite">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-frigia-deep">{item.title}</p>
                    <p className="text-[11px] text-frigia-mute">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
