"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
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
  }

  const q = params.get("q") ?? "";
  const marca = params.get("marca") ?? "";
  const concentracion = params.get("concentracion") ?? "";
  const orden = params.get("orden") ?? "";

  const hasFilters = q || marca || concentracion || orden;

  return (
    <aside className="flex flex-col gap-5">
      {/* Search */}
      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
          Buscar
        </label>
        <div className="relative">
          <input
            type="search"
            defaultValue={q}
            placeholder="Nombre, marca..."
            className="w-full text-sm border border-neutral-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-frigia-rose/50 focus:border-frigia-rose transition-colors"
            onChange={(e) => {
              clearTimeout((window as typeof window & { _st?: ReturnType<typeof setTimeout> })._st);
              (window as typeof window & { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(
                () => updateParam("q", e.target.value),
                400
              );
            }}
          />
          <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Concentration */}
      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
          Concentración
        </label>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => updateParam("concentracion", "")}
            className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
              !concentracion
                ? "bg-frigia-deep text-white font-medium"
                : "text-neutral-600 hover:bg-frigia-light"
            }`}
          >
            Todas
          </button>
          {CONCENTRATIONS.map((c) => (
            <button
              key={c}
              onClick={() => updateParam("concentracion", c)}
              className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                concentracion === c
                  ? "bg-frigia-deep text-white font-medium"
                  : "text-neutral-600 hover:bg-frigia-light"
              }`}
            >
              {CONCENTRATION_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
            Marca
          </label>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            <button
              onClick={() => updateParam("marca", "")}
              className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                !marca
                  ? "bg-frigia-deep text-white font-medium"
                  : "text-neutral-600 hover:bg-frigia-light"
              }`}
            >
              Todas las marcas
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => updateParam("marca", b.slug)}
                className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                  marca === b.slug
                    ? "bg-frigia-deep text-white font-medium"
                    : "text-neutral-600 hover:bg-frigia-light"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
            Categoría
          </label>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => updateParam("categoria", "")}
              className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                !params.get("categoria")
                  ? "bg-frigia-deep text-white font-medium"
                  : "text-neutral-600 hover:bg-frigia-light"
              }`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => updateParam("categoria", c.slug)}
                className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                  params.get("categoria") === c.slug
                    ? "bg-frigia-deep text-white font-medium"
                    : "text-neutral-600 hover:bg-frigia-light"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
          Ordenar
        </label>
        <select
          value={orden}
          onChange={(e) => updateParam("orden", e.target.value)}
          className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-frigia-rose/50 bg-white"
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
          className="text-sm text-frigia-rose hover:text-frigia-deep font-medium text-left"
        >
          × Limpiar filtros
        </button>
      )}
    </aside>
  );
}
