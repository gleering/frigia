import Link from "next/link";

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492364000000";

export function Footer() {
  return (
    <footer className="bg-frigia-dark text-frigia-bone mt-auto">
      {/* Perks strip */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "truck",  title: "Envío gratis",           sub: "Compras +$25.000" },
            { icon: "gift",   title: "3 muestras de regalo",    sub: "Con cada pedido" },
            { icon: "check",  title: "100% originales",         sub: "Con factura" },
            { icon: "bubble", title: "Asesoramiento gratuito",  sub: "Por WhatsApp" },
          ].map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <span className="text-frigia-gold mt-0.5">
                {p.icon === "truck" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="11" height="10" rx="1"/><path d="M13 10h5l3 3v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
                  </svg>
                )}
                {p.icon === "gift" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 9v11M8 9c-2 0-3-3 0-3 2 0 4 3 4 3s2-3 4-3c3 0 2 3 0 3"/>
                  </svg>
                )}
                {p.icon === "check" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 13 4 4L19 7"/>
                  </svg>
                )}
                {p.icon === "bubble" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                )}
              </span>
              <div>
                <p className="text-xs font-semibold text-frigia-bone">{p.title}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{ width: 36, height: 36, background: "var(--frigia-grad)", padding: 2.5 }}
            >
              <span
                className="flex items-center justify-center rounded-full w-full h-full font-display italic font-medium text-frigia-bone"
                style={{ background: "#0a0a0a", fontSize: 17, lineHeight: 1, paddingBottom: 1 }}
              >
                F
              </span>
            </span>
            <span className="font-sans font-bold tracking-[0.28em] text-sm uppercase text-frigia-bone">
              FRIGIA
            </span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            Perfumería en Junín, Buenos Aires.
            <br />
            Av. República 732
          </p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 bg-[#25d366] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#1ebe5d] transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
            </svg>
            Consultar por WhatsApp
          </a>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">Tienda</p>
          <ul className="flex flex-col gap-2.5 text-sm text-white/60">
            <li><Link href="/catalogo" className="hover:text-frigia-bone transition-colors">Todo el catálogo</Link></li>
            <li><Link href="/catalogo?concentracion=EDP" className="hover:text-frigia-bone transition-colors">Eau de Parfum</Link></li>
            <li><Link href="/catalogo?concentracion=EDT" className="hover:text-frigia-bone transition-colors">Eau de Toilette</Link></li>
            <li><Link href="/catalogo?concentracion=PARFUM" className="hover:text-frigia-bone transition-colors">Parfum</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">Seguinos</p>
          <ul className="flex flex-col gap-2.5 text-sm text-white/60">
            <li>
              <a
                href="https://instagram.com/frigiaperfumeria"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-frigia-bone transition-colors"
              >
                @frigiaperfumeria
              </a>
            </li>
          </ul>
          <p className="text-[11px] text-white/25 mt-8">
            © {new Date().getFullYear()} Frigia Perfumería
          </p>
        </div>
      </div>
    </footer>
  );
}
