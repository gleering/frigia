import Link from "next/link";
import { logout } from "@/app/actions/auth";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "◎" },
  { href: "/admin/productos", label: "Productos", icon: "◈" },
  { href: "/admin/productos/nuevo", label: "Nuevo Producto", icon: "+" },
  { href: "/admin/productos/importar", label: "Importar CSV", icon: "↑" },
  { href: "/admin/precios", label: "Actualizar Precios", icon: "%" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-frigia-dark text-white flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <span className="font-display text-xl font-bold tracking-wide">
            Frigia
          </span>
          <p className="text-xs text-white/50 mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="w-5 text-center text-base">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="w-5 text-center">→</span>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
