"use client";
import Link from "next/link";
import { useCart } from "@/store/cart";

export function Header() {
  const itemCount = useCart((s) => s.itemCount());

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-frigia-dark tracking-tight">
            Frigia
          </span>
          <span className="text-xs text-frigia-gold font-medium hidden sm:block">
            Perfumería
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
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

        <div className="flex items-center gap-3">
          <Link
            href="/catalogo"
            className="text-neutral-500 hover:text-frigia-deep transition-colors"
            aria-label="Buscar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <Link
            href="/carrito"
            className="relative text-neutral-500 hover:text-frigia-deep transition-colors"
            aria-label="Carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-frigia-rose text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
