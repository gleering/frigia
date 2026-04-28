"use client";

import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { CONCENTRATION_LABELS } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-6">🛒</p>
        <h1 className="font-display text-2xl font-bold text-frigia-dark mb-3">
          Tu carrito está vacío
        </h1>
        <p className="text-neutral-500 mb-8">
          Explorá nuestro catálogo y encontrá tu fragancia ideal.
        </p>
        <Link
          href="/catalogo"
          className="inline-block bg-frigia-deep text-white font-semibold px-8 py-3 rounded-full hover:bg-frigia-deep/90 transition-colors text-sm"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-frigia-dark mb-8">
        Tu carrito
        <span className="ml-3 text-base font-sans font-normal text-neutral-400">
          ({itemCount()} {itemCount() === 1 ? "producto" : "productos"})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 min-w-0 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-4"
            >
              {/* Image */}
              <div className="w-20 h-20 shrink-0 bg-frigia-cream rounded-lg overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🌸
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-frigia-dark truncate">
                  {item.name}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {item.brand} · {item.ml}ml ·{" "}
                  {CONCENTRATION_LABELS[item.concentration] ??
                    item.concentration}
                </p>
                <p className="text-sm font-semibold text-frigia-rose mt-1">
                  {formatPrice(item.price)}
                </p>

                {/* Qty controls */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="px-3 py-1.5 text-sm hover:bg-neutral-50 transition-colors text-neutral-600"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium border-x border-neutral-200 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="px-3 py-1.5 text-sm hover:bg-neutral-50 transition-colors text-neutral-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right shrink-0">
                <p className="font-semibold text-frigia-dark">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={clearCart}
              className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 sticky top-4">
            <h2 className="font-semibold text-frigia-dark mb-4">
              Resumen del pedido
            </h2>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-neutral-500 truncate mr-2">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="text-neutral-700 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-4 mb-5">
              <div className="flex justify-between">
                <span className="font-semibold text-frigia-dark">Total</span>
                <span className="font-bold text-lg text-frigia-dark">
                  {formatPrice(total())}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Envío a coordinar con el vendedor
              </p>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center bg-frigia-deep text-white font-semibold py-3 rounded-full hover:bg-frigia-deep/90 transition-colors text-sm"
            >
              Ir al checkout
            </Link>

            <div className="mt-3 text-center">
              <Link
                href="/catalogo"
                className="text-xs text-neutral-400 hover:text-frigia-deep transition-colors"
              >
                ← Seguir comprando
              </Link>
            </div>

            {/* WhatsApp fallback */}
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 text-center mb-2">
                ¿Preferís hablar con nosotros?
              </p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492364000000"}?text=${encodeURIComponent("Hola Frigia! Quiero hacer un pedido.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
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
