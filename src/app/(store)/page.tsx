import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { mapProduct } from "@/lib/utils";

export const revalidate = 3600;

export default async function HomePage() {
  const [featured, recent] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, active: true, stock: { gt: 0 } },
      include: { brand: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { active: true },
      include: { brand: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492364000000";
  const waMsg = encodeURIComponent(
    "Hola Frigia! Me gustaría recibir asesoramiento sobre perfumes."
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-frigia-cream via-frigia-light to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-frigia-gold text-sm font-medium uppercase tracking-widest mb-3">
            Fragancias originales
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-frigia-dark leading-tight mb-5">
            Descubrí tu
            <br />
            <span className="text-frigia-rose">fragancia perfecta</span>
          </h1>
          <p className="text-neutral-600 text-lg max-w-xl mx-auto mb-8">
            Las mejores marcas internacionales en Junín, Buenos Aires. Perfumes
            para hombre y mujer al mejor precio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/catalogo"
              className="bg-frigia-deep text-white font-semibold px-8 py-3.5 rounded-full hover:bg-frigia-deep/90 transition-colors text-sm"
            >
              Ver catálogo completo
            </Link>
            <a
              href={`https://wa.me/${whatsapp}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-green-600 transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
              </svg>
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-frigia-gold text-xs font-semibold uppercase tracking-widest mb-1">
                Destacados
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-frigia-dark">
                Perfumes favoritos
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="text-sm text-frigia-deep font-medium hover:underline hidden sm:block"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={mapProduct(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="bg-frigia-light py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "✓",
              title: "Originales garantizados",
              text: "Todos nuestros perfumes son 100% originales con factura.",
            },
            {
              icon: "📦",
              title: "Envíos a todo el país",
              text: "Despachamos por correo argentino y OCA a todo el país.",
            },
            {
              icon: "💬",
              title: "Asesoramiento personalizado",
              text: "Consultanos por WhatsApp y te ayudamos a elegir tu fragancia.",
            },
          ].map((v) => (
            <div key={v.title} className="text-center">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-semibold text-frigia-dark mb-1">{v.title}</h3>
              <p className="text-sm text-neutral-500">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent products */}
      {recent.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-frigia-gold text-xs font-semibold uppercase tracking-widest mb-1">
                Novedades
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-frigia-dark">
                Nuevos ingresos
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="text-sm text-frigia-deep font-medium hover:underline hidden sm:block"
            >
              Ver catálogo →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recent.map((p) => (
              <ProductCard key={p.id} product={mapProduct(p)} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/catalogo"
              className="inline-block border border-frigia-deep text-frigia-deep font-semibold px-8 py-3 rounded-full hover:bg-frigia-cream transition-colors text-sm"
            >
              Ver todos los productos
            </Link>
          </div>
        </section>
      )}

      {/* Empty state */}
      {featured.length === 0 && recent.length === 0 && (
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-neutral-400 text-lg mb-4">
            Pronto vas a encontrar nuestro catálogo acá.
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-600 transition-colors text-sm"
          >
            Consultanos por WhatsApp
          </a>
        </section>
      )}
    </div>
  );
}
