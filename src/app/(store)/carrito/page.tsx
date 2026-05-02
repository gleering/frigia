"use client";

import { useCart } from "@/store/cart";
import { formatPrice, CONCENTRATION_LABELS } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const FREE_SHIPPING_THRESHOLD = 25000;

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } =
    useCart();

  const subtotal = total();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 1800;
  const grandTotal = subtotal + shipping;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c9a96a"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-5 opacity-50"
        >
          <path d="M5 7h14l-1 13H6L5 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>
        </svg>
        <h1 className="font-display italic font-medium text-2xl text-frigia-deep mb-2">
          Tu bolsa está vacía
        </h1>
        <p className="text-sm text-frigia-mute mb-8">
          Explorá nuestro catálogo y encontrá tu fragancia ideal.
        </p>
        <Link
          href="/catalogo"
          className="inline-block bg-frigia-dark text-frigia-bone font-semibold px-8 py-3 rounded-full hover:bg-frigia-graphite transition-colors text-sm"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-frigia-mute mb-1">
          Tu bolsa
        </p>
        <h1 className="font-display italic font-medium text-4xl text-frigia-deep leading-none">
          {itemCount()}{" "}
          <span className="font-script text-frigia-gold-deep" style={{ fontSize: "0.8em" }}>
            {itemCount() === 1 ? "producto" : "productos"}
          </span>
        </h1>
      </div>

      {/* Free shipping progress */}
      <div
        className="rounded-2xl p-4 mb-6 border"
        style={{
          background: "var(--frigia-grad-soft)",
          borderColor: "rgba(230,59,122,0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="11" height="10" rx="1"/><path d="M13 10h5l3 3v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
          </svg>
          <span className="text-xs font-semibold text-frigia-deep">
            {shipping === 0
              ? "¡Envío gratis activado!"
              : `Te faltan ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} para envío gratis`}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-black/8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "var(--frigia-grad)" }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 min-w-0 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-2xl"
              style={{ background: "#faf7f1" }}
            >
              {/* Image */}
              <div className="w-20 aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-frigia-light">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={107}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a96a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <path d="M12 3s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-frigia-mute">
                      {item.brand}
                    </p>
                    <p className="font-display italic font-medium text-[15px] leading-tight text-frigia-deep mt-0.5 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-frigia-mute mt-0.5">
                      {item.ml}ml · {CONCENTRATION_LABELS[item.concentration] ?? item.concentration}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 p-1 text-frigia-mute hover:text-red-500 transition-colors"
                    aria-label="Eliminar"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6 6 18"/>
                    </svg>
                  </button>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between">
                  {/* Qty controls */}
                  <div
                    className="flex items-center rounded-full overflow-hidden"
                    style={{ border: "1px solid #e8e0d2" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-frigia-mute hover:text-frigia-deep transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M5 12h14"/>
                      </svg>
                    </button>
                    <span className="text-xs font-bold px-2 min-w-[24px] text-center text-frigia-deep">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-frigia-mute hover:text-frigia-deep transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm font-bold text-frigia-deep">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-1">
            <button
              onClick={clearCart}
              className="text-xs text-frigia-mute/70 hover:text-red-500 transition-colors"
            >
              Vaciar bolsa
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-72 shrink-0">
          <div
            className="rounded-2xl p-5 sticky top-20"
            style={{ background: "#faf7f1", border: "1px solid #e8e0d2" }}
          >
            <h2 className="font-display italic font-medium text-xl text-frigia-deep mb-5">
              Resumen
            </h2>

            {/* Line items */}
            <div className="space-y-2 mb-4 text-xs">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="text-frigia-mute truncate">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="text-frigia-deep font-medium shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider + totals */}
            <div
              className="border-t pt-4 mb-5 space-y-2"
              style={{ borderColor: "#e8e0d2" }}
            >
              <div className="flex justify-between text-xs text-frigia-mute">
                <span>Envío</span>
                <span className="font-medium">
                  {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between items-baseline mt-3">
                <span className="text-xs font-semibold tracking-widest uppercase text-frigia-deep">Total</span>
                <span className="font-display italic font-semibold text-2xl text-frigia-deep">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-frigia-dark text-frigia-bone font-semibold py-3.5 rounded-full hover:bg-frigia-graphite transition-colors text-sm"
            >
              Finalizar compra
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </Link>

            <Link
              href="/catalogo"
              className="block text-center mt-3 text-xs text-frigia-mute hover:text-frigia-deep transition-colors"
            >
              ← Seguir comprando
            </Link>

            {/* WhatsApp */}
            <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: "#e8e0d2" }}>
              <p className="text-[10px] text-frigia-mute mb-2">¿Preferís hablar con nosotros?</p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492364000000"}?text=${encodeURIComponent("Hola Frigia! Quiero hacer un pedido.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#25d366] hover:text-[#1ebe5d] font-semibold transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                </svg>
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
