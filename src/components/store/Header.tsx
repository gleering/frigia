"use client";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/catalogo", label: "Todo el catálogo" },
  { href: "/catalogo?categoria=para-ella", label: "Para Ella" },
  { href: "/catalogo?categoria=para-el", label: "Para Él" },
  { href: "/catalogo?categoria=unisex", label: "Unisex" },
  { href: "/catalogo?categoria=body-splash", label: "Body Splash" },
  { href: "/catalogo?concentracion=EDP", label: "Eau de Parfum" },
  { href: "/catalogo?concentracion=EDT", label: "Eau de Toilette" },
];

function FrigiaLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Frigia Perfumería" onClick={onClick}>
      <span
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{ width: 38, height: 38, background: "var(--frigia-grad)", padding: 2.5 }}
      >
        <span
          className="flex items-center justify-center rounded-full w-full h-full font-display italic font-medium text-frigia-bone"
          style={{ background: "#0a0a0a", fontSize: 18, lineHeight: 1, paddingBottom: 1 }}
        >
          F
        </span>
      </span>
      <span className="font-sans font-bold text-frigia-dark tracking-[0.28em] text-sm uppercase hidden sm:block">
        FRIGIA
      </span>
    </Link>
  );
}

export function Header() {
  const itemCount = useCart((s) => s.itemCount());
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-frigia-paper/95 backdrop-blur-md border-b border-frigia-light">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <FrigiaLogo />

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-widest uppercase text-frigia-mute">
            <Link href="/catalogo" className="hover:text-frigia-deep transition-colors">Catálogo</Link>
            <Link href="/catalogo?categoria=para-ella" className="hover:text-frigia-deep transition-colors">Para Ella</Link>
            <Link href="/catalogo?categoria=para-el" className="hover:text-frigia-deep transition-colors">Para Él</Link>
            <Link href="/catalogo?categoria=unisex" className="hover:text-frigia-deep transition-colors">Unisex</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/catalogo" className="text-frigia-mute hover:text-frigia-deep transition-colors" aria-label="Buscar">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
            </Link>

            <Link href="/carrito" className="relative text-frigia-mute hover:text-frigia-deep transition-colors" aria-label="Carrito">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h14l-1 13H6L5 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>
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

            {/* Hamburger — solo mobile */}
            <button
              className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 text-frigia-deep"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="block h-[1.5px] w-5 bg-current rounded-full transition-all" />
              <span className="block h-[1.5px] w-3.5 bg-current rounded-full transition-all" />
              <span className="block h-[1.5px] w-5 bg-current rounded-full transition-all" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer desde la derecha */}
          <nav className="relative ml-auto w-72 h-full bg-frigia-paper flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 h-14 border-b border-frigia-light flex-shrink-0">
              <FrigiaLogo onClick={() => setMenuOpen(false)} />
              <button
                onClick={() => setMenuOpen(false)}
                className="text-frigia-mute hover:text-frigia-deep transition-colors p-1"
                aria-label="Cerrar menú"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="flex flex-col px-3 py-5 gap-0.5 flex-1 overflow-y-auto">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-frigia-graphite hover:text-frigia-deep hover:bg-frigia-cream rounded-xl px-4 py-3 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="px-4 pb-8 flex-shrink-0">
              <Link
                href="/carrito"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2.5 w-full rounded-full py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--frigia-grad)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 7h14l-1 13H6L5 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>
                </svg>
                Ver carrito
                {itemCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
