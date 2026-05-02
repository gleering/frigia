import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { mapProduct } from "@/lib/utils";

export const revalidate = 3600;

const CATEGORIES = [
  { id: "perfumes",  label: "Perfumes",     bg: "#0a0a0a", href: "/catalogo" },
  { id: "edp",       label: "Eau de Parfum", bg: "#1a1a2e", href: "/catalogo?concentracion=EDP" },
  { id: "edt",       label: "Eau de Toilette", bg: "#2a1a0a", href: "/catalogo?concentracion=EDT" },
  { id: "floral",    label: "Florales",      bg: "#2a1220", href: "/catalogo?familia=floral" },
  { id: "oriental",  label: "Orientales",    bg: "#1a2010", href: "/catalogo?familia=oriental" },
  { id: "regalos",   label: "Regalos",       bg: "#a98748", href: "/catalogo?destacado=1" },
];

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

  const hasProducts = featured.length > 0 || recent.length > 0;

  return (
    <div className="bg-frigia-paper">

      {/* ── Search pill ── */}
      <div className="px-4 pt-5 pb-2 max-w-xl mx-auto">
        <Link
          href="/catalogo"
          className="flex items-center gap-3 bg-frigia-cream rounded-full px-4 py-3 border border-frigia-light hover:border-frigia-mute/40 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8378" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <span className="text-[13px] text-frigia-mute">Buscar perfumes, marcas, ingredientes…</span>
        </Link>
      </div>

      {/* ── Hero editorial ── */}
      <section className="px-4 py-4 max-w-6xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden min-h-[340px] md:min-h-[400px] flex flex-col justify-between p-6 md:p-8"
          style={{ background: "#0a0a0a", color: "#f5f1ea" }}
        >
          {/* Gradient halo */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-20%",
              right: "-15%",
              width: "60%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: "var(--frigia-grad)",
              filter: "blur(50px)",
              opacity: 0.5,
            }}
          />

          <div className="relative z-10">
            {/* Pill label */}
            <span className="inline-flex items-center gap-2 border border-white/20 rounded-full text-[10px] tracking-[0.2em] uppercase font-semibold px-3 py-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "var(--frigia-grad)" }}
              />
              Nueva colección
            </span>

            {/* Headline */}
            <h1
              className="font-display italic font-medium mt-4 leading-none"
              style={{ fontSize: "clamp(42px, 8vw, 64px)" }}
            >
              Fragancias
              <br />
              <span style={{ color: "#c9a96a" }}>originales</span>
            </h1>

            <p className="text-white/60 text-sm mt-3 max-w-xs leading-relaxed">
              Las mejores marcas internacionales en Junín, Buenos Aires. Al mejor precio.
            </p>
          </div>

          {/* CTAs */}
          <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-frigia-bone text-frigia-dark font-semibold text-sm px-6 py-3 rounded-full hover:bg-white transition-colors"
            >
              Ver catálogo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </Link>
            <a
              href={`https://wa.me/${whatsapp}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Categorías horizontal scroll ── */}
      <section className="py-6 max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between px-4 mb-4">
          <h2 className="font-display italic font-medium text-2xl text-frigia-deep">
            Categorías
          </h2>
          <span className="text-[11px] text-frigia-mute tracking-wide">
            {CATEGORIES.length} mundos
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex-shrink-0 flex flex-col justify-between rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
              style={{
                width: 110,
                aspectRatio: "3/4",
                background: cat.bg,
                color: "#f5f1ea",
              }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245,241,234,0.12)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/>
                </svg>
              </span>
              <div>
                <p className="font-display italic font-medium text-[17px] leading-tight">{cat.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Destacados ── */}
      {featured.length > 0 && (
        <section className="px-4 py-4 max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display italic font-medium text-2xl text-frigia-deep">
              Destacados
            </h2>
            <Link
              href="/catalogo"
              className="text-[10px] font-semibold tracking-[0.14em] uppercase text-frigia-mute hover:text-frigia-deep transition-colors flex items-center gap-1"
            >
              Ver todo
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={mapProduct(p)} />
            ))}
          </div>
        </section>
      )}

      {/* ── Banner quiz / asesoramiento ── */}
      <section className="px-4 py-4 max-w-6xl mx-auto">
        <a
          href={`https://wa.me/${whatsapp}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl p-5 border transition-colors hover:border-frigia-rose/30"
          style={{
            background: "var(--frigia-grad-soft)",
            borderColor: "rgba(230,59,122,0.15)",
          }}
        >
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--frigia-grad)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l4 4M14.5 14.5l4 4M18.5 5.5l-4 4M9.5 14.5l-4 4"/>
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display italic font-medium text-xl leading-tight text-frigia-deep">
              Tu fragancia ideal
            </p>
            <p className="text-xs text-frigia-mute mt-1 leading-relaxed">
              Consultanos por WhatsApp y te ayudamos a elegir el perfume perfecto para vos.
            </p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8378" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6"/>
          </svg>
        </a>
      </section>

      {/* ── Recién llegados ── */}
      {recent.length > 0 && (
        <section className="py-4 max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between px-4 mb-5">
            <h2 className="font-display italic font-medium text-2xl text-frigia-deep">
              Recién llegados{" "}
              <span className="font-script text-frigia-gold-deep" style={{ fontSize: 20 }}>nuevo</span>
            </h2>
            <Link
              href="/catalogo"
              className="text-[10px] font-semibold tracking-[0.14em] uppercase text-frigia-mute hover:text-frigia-deep transition-colors"
            >
              Ver todo →
            </Link>
          </div>
          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 px-4">
            {recent.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={mapProduct(p)} />
            ))}
          </div>
          <div className="flex md:hidden gap-4 overflow-x-auto no-scrollbar px-4 pb-1">
            {recent.map((p) => (
              <div key={p.id} className="flex-shrink-0" style={{ width: 160 }}>
                <ProductCard product={mapProduct(p)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasProducts && (
        <section className="max-w-xl mx-auto px-4 py-24 text-center">
          <p className="font-display italic text-2xl text-frigia-mute mb-6">
            Próximamente…
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25d366] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1ebe5d] transition-colors text-sm"
          >
            Consultanos por WhatsApp
          </a>
        </section>
      )}

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}
