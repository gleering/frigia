"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { Brand, Category } from "@/generated/prisma/client";
import { CONCENTRATION_LABELS } from "@/lib/utils";

const CONCENTRATIONS = Object.keys(CONCENTRATION_LABELS);

interface CatalogFiltersProps {
  brands: Brand[];
  categories: Category[];
}

export function CatalogFilters({ brands, categories }: CatalogFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("pagina");
      router.push(`/catalogo?${next.toString()}`);
    },
    [params, router]
  );

  function clearAll() {
    router.push("/catalogo");
    setMobileOpen(false);
  }

  const q = params.get("q") ?? "";
  const marca = params.get("marca") ?? "";
  const concentracion = params.get("concentracion") ?? "";
  const orden = params.get("orden") ?? "";
  const categoria = params.get("categoria") ?? "";
  const hasFilters = !!(q || marca || concentracion || orden || categoria);
  const activeCount = [q, marca, concentracion, orden, categoria].filter(Boolean).length;

  const filterContent = (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <label className="text-[10px] font-semibold text-frigia-mute uppercase tracking-widest block mb-2">
          Buscar
        </label>
        <div className="relative">
          <input
            type="search"
            defaultValue={q}
            placeholder="Nombre, marca…"
            className="w-full text-sm border border-frigia-light rounded-full pl-9 pr-4 py-2.5 bg-frigia-cream focus:outline-none focus:ring-2 focus:ring-frigia-dark/20 focus:border-frigia-dark/30 transition-colors placeholder:text-frigia-mute/60"
            onChange={(e) => {
              clearTimeout((window as typeof window & { _st?: ReturnType<typeof setTimeout> })._st);
              (window as typeof window & { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(
                () => updateParam("q", e.target.value),
                400
              );
            }}
          />
          <svg className="absolute left-3 top-3 w-3.5 h-3.5 text-frigia-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
        </div>
      </div>

      {/* Categoría */}
      {categories.length > 0 && (
        <div>
          <label className="text-[10px] font-semibold text-frigia-mute uppercase tracking-widest block mb-2.5">
            Categoría
          </label>
          <div className="flex flex-col gap-1.5">
            {[{ slug: "", name: "Todas" }, ...categories].map((c) => {
              const active = (params.get("categoria") ?? "") === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => { updateParam("categoria", c.slug); setMobileOpen(false); }}
                  className={`text-left text-xs px-3 py-2 rounded-full transition-all font-medium ${
                    active ? "bg-frigia-dark text-frigia-bone" : "text-frigia-graphite hover:bg-frigia-light"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Concentración */}
      <div>
        <label className="text-[10px] font-semibold text-frigia-mute uppercase tracking-widest block mb-2.5">
          Concentración
        </label>
        <div className="flex flex-col gap-1.5">
          {[{ value: "", label: "Todas" }, ...CONCENTRATIONS.map((c) => ({ value: c, label: CONCENTRATION_LABELS[c] }))].map(({ value, label }) => {
            const active = concentracion === value;
            return (
              <button
                key={value}
                onClick={() => { updateParam("concentracion", value); setMobileOpen(false); }}
                className={`text-left text-xs px-3 py-2 rounded-full transition-all font-medium ${
                  active ? "bg-frigia-dark text-frigia-bone" : "text-frigia-graphite hover:bg-frigia-light"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Marca */}
      {brands.length > 0 && (
        <div>
          <label className="text-[10px] font-semibold text-frigia-mute uppercase tracking-widest block mb-2.5">
            Marca
          </label>
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto no-scrollbar">
            {[{ slug: "", name: "Todas las marcas" }, ...brands].map((b) => {
              const active = marca === b.slug;
              return (
                <button
                  key={b.slug}
                  onClick={() => { updateParam("marca", b.slug); setMobileOpen(false); }}
                  className={`text-left text-xs px-3 py-2 rounded-full transition-all font-medium ${
                    active ? "bg-frigia-dark text-frigia-bone" : "text-frigia-graphite hover:bg-frigia-light"
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ordenar */}
      <div>
        <label className="text-[10px] font-semibold text-frigia-mute uppercase tracking-widest block mb-2.5">
          Ordenar
        </label>
        <select
          value={orden}
          onChange={(e) => updateParam("orden", e.target.value)}
          className="w-full text-xs border border-frigia-light rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-frigia-dark/20 bg-frigia-cream text-frigia-deep"
        >
          <option value="">Más recientes</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="nombre_asc">Nombre A-Z</option>
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-xs text-frigia-mute hover:text-frigia-rose font-medium text-left transition-colors"
        >
          × Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: barra sticky con botón filtros */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-frigia-light bg-frigia-cream text-xs font-semibold text-frigia-graphite hover:border-frigia-mute/40 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M7 12h10M11 18h2"/>
          </svg>
          Filtros
          {activeCount > 0 && (
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-bold"
              style={{ background: "var(--frigia-grad)" }}
            >
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop: sidebar siempre visible */}
      <aside className="hidden md:block">
        {filterContent}
      </aside>

      {/* Mobile: drawer desde abajo */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative bg-frigia-paper rounded-t-3xl max-h-[85vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-frigia-light" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-frigia-light flex-shrink-0">
              <p className="text-sm font-bold text-frigia-deep">Filtros</p>
              <button onClick={() => setMobileOpen(false)} className="text-frigia-mute p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto px-5 py-5 flex-1">
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
