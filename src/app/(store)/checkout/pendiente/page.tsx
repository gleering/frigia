import Link from "next/link";

export default async function PendientePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="font-display text-3xl font-bold text-frigia-dark mb-3">
        Pago pendiente
      </h1>
      <p className="text-neutral-500 mb-6">
        Tu pago está siendo procesado. Te notificaremos por email cuando se
        confirme.
      </p>

      {orderId && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-8 inline-block">
          <p className="text-xs text-neutral-400 mb-1">Número de pedido</p>
          <p className="font-mono font-bold text-frigia-dark">
            #{orderId.slice(-8).toUpperCase()}
          </p>
        </div>
      )}

      <p className="text-sm text-neutral-400 mb-8">
        Si tu pago fue acreditado y no recibiste confirmación, escribinos por
        WhatsApp.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="bg-frigia-deep text-white font-semibold px-8 py-3 rounded-full hover:bg-frigia-deep/90 transition-colors text-sm"
        >
          Ir al inicio
        </Link>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492364000000"}?text=${encodeURIComponent("Hola Frigia! Realicé un pedido y mi pago quedó pendiente. ¿Pueden verificar?")}`}
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
