"use client";
import Link from "next/link";
import { useCart } from "@/store/cart";

function FrigiaLogo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Frigia Perfumería">
      {/* Gradient ring + dark inner circle with italic F */}
      <span
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 38,
          height: 38,
          background: "var(--frigia-grad)",
          padding: 2.5,
        }}
      >
        <span
          className="flex items-center justify-center rounded-full w-full h-full font-display italic font-medium text-frigia-bone"
          style={{
            background: "#0a0a0a",
            fontSize: 18,
            lineHeight: 1,
            paddingBottom: 1,
          }}
        >
          F
        </span>
      </span>
      {/* Wordmark */}
      <span className="font-sans font-bold text-frigia-dark tracking-[0.28em] text-sm uppercase hidden sm:block">
        FRIGIA
      </span>
    </Link>
  );
}

export function Header() {
  const itemCount = useCart((s) => s.itemCount());

  return (
    <header className="sticky top-0 z-40 bg-frigia-paper/95 backdrop-blur-md border-b border-frigia-light">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <FrigiaLogo />

        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-widest uppercase text-frigia-mute">
          <Link href="/catalogo" className="hover:text-frigia-deep transition-colors">
            Catálogo
          </Link>
          <Link href="/catalogo?concentracion=EDP" className="hover:text-frigia-deep transition-colors">
            Eau de Parfum
          </Link>
          <Link href="/catalogo?concentracion=EDT" className="hover:text-frigia-deep transition-colors">
            Eau de Toilette
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Search */}
          <Link
            href="/catalogo"
            className="text-frigia-mute hover:text-frigia-deep transition-colors"
            aria-label="Buscar"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="m20 20-3.5-3.5"/>
            </svg>
          </Link>

          {/* Bag */}
          <Link
            href="/carrito"
            className="relative text-frigia-mute hover:text-frigia-deep transition-colors"
            aria-label="Carrito"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7h14l-1 13H6L5 7Z"/>
              <path d="M9 7a3 3 0 0 1 6 0"/>
            </svg>
            {itemCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-white text-[9px] font-bold rounded-full px-0.5"
                style={{ background: "var(--frigia-grad)" }}
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
