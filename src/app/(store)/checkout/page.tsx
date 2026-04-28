"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { createOrder } from "@/app/actions/orders";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    number: "",
    apartment: "",
    city: "",
    province: "Buenos Aires",
    postalCode: "",
    notes: "",
  });

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-6">🛒</p>
        <h1 className="font-display text-2xl font-bold text-frigia-dark mb-3">
          Tu carrito está vacío
        </h1>
        <Link
          href="/catalogo"
          className="inline-block bg-frigia-deep text-white font-semibold px-8 py-3 rounded-full hover:bg-frigia-deep/90 transition-colors text-sm"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerName.trim()) return setError("Ingresá tu nombre");
    if (!form.customerEmail.trim() || !form.customerEmail.includes("@"))
      return setError("Ingresá un email válido");
    if (!form.street.trim()) return setError("Ingresá la calle");
    if (!form.number.trim()) return setError("Ingresá el número");
    if (!form.city.trim()) return setError("Ingresá la ciudad");
    if (!form.postalCode.trim()) return setError("Ingresá el código postal");

    startTransition(async () => {
      const result = await createOrder(
        {
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          shippingAddress: {
            street: form.street,
            number: form.number,
            apartment: form.apartment || undefined,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
          },
          notes: form.notes || undefined,
        },
        items
      );

      if ("error" in result) {
        setError(result.error);
        return;
      }

      clearCart();
      router.push(result.initPoint);
    });
  };

  const fieldClass =
    "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-frigia-rose/40 focus:border-frigia-rose/60 transition-colors";
  const labelClass = "block text-xs font-medium text-neutral-600 mb-1";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          href="/carrito"
          className="text-sm text-neutral-400 hover:text-frigia-deep transition-colors"
        >
          ← Volver al carrito
        </Link>
        <h1 className="font-display text-3xl font-bold text-frigia-dark mt-3">
          Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form fields */}
          <div className="flex-1 space-y-6">
            {/* Personal data */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-frigia-dark mb-4">
                Datos personales
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nombre completo *</label>
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="Ej: María González"
                    className={fieldClass}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      name="customerEmail"
                      type="email"
                      value={form.customerEmail}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Teléfono / WhatsApp</label>
                    <input
                      name="customerPhone"
                      value={form.customerPhone}
                      onChange={handleChange}
                      placeholder="11 1234-5678"
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-frigia-dark mb-4">
                Dirección de envío
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>Calle *</label>
                    <input
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      placeholder="Av. República"
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Número *</label>
                    <input
                      name="number"
                      value={form.number}
                      onChange={handleChange}
                      placeholder="732"
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Piso / Dpto.</label>
                    <input
                      name="apartment"
                      value={form.apartment}
                      onChange={handleChange}
                      placeholder="2°B"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Ciudad *</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Junín"
                      className={fieldClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Código postal *</label>
                    <input
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      placeholder="6000"
                      className={fieldClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Provincia *</label>
                  <select
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold text-frigia-dark mb-4">
                Comentarios adicionales
              </h2>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="¿Algún detalle especial sobre tu pedido?"
                rows={3}
                className={`${fieldClass} resize-none`}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sticky top-4">
              <h2 className="font-semibold text-frigia-dark mb-4">
                Tu pedido
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

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-frigia-deep text-white font-semibold py-3 rounded-full hover:bg-frigia-deep/90 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Procesando…
                  </>
                ) : (
                  "Pagar con MercadoPago"
                )}
              </button>

              <p className="text-xs text-neutral-400 text-center mt-3">
                Serás redirigido a MercadoPago para completar el pago de forma
                segura.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
