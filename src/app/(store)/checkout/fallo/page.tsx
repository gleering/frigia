import Link from "next/link";

export default async function FalloPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h1 className="font-display text-3xl font-bold text-frigia-dark mb-3">
        El pago no se completó
      </h1>
      <p className="text-neutral-500 mb-8">
        Hubo un problema al procesar tu pago. Tu pedido no fue confirmado.
        <br />
        Podés intentarlo de nuevo o contactarnos por WhatsApp.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/carrito"
          className="bg-frigia-deep text-white font-semibold px-8 py-3 rounded-full hover:bg-frigia-deep/90 transition-colors text-sm"
        >
          Volver al carrito
        </Link>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492364000000"}?text=${encodeURIComponent("Hola Frigia! Quise hacer un pedido pero el pago no se completó. ¿Me pueden ayudar?")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-green-600 transition-colors text-sm"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
