"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

const EXAMPLE_CSV = `name,brand,sku,price,stock,ml,concentration
Miss Dior,Dior,CD-MISS-50,278784,2,50,EDP
CK One,Calvin Klein,CK-ONE-200,252648,2,200,EDT
Club de Nuit Intense,Armaf,ARMAF-CDNI-105,185856,5,105,EDP`;

export default function ImportarPage() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<{ ok?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleImport() {
    if (!csv.trim()) return;
    setResult(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/import-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv }),
        });
        const data = await res.json();
        if (data.error) {
          setResult({ error: data.error });
        } else {
          setResult({
            ok: `✓ ${data.imported} productos importados${data.skipped ? `, ${data.skipped} omitidos` : ""}`,
          });
          setCsv("");
        }
      } catch (e) {
        setResult({ error: e instanceof Error ? e.message : "Error de red" });
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-frigia-dark mb-1">Importar productos</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Pegá un CSV con tus perfumes. Claude enriquece automáticamente descripción, familia
        olfativa y notas usando IA.
      </p>

      {/* Format reference */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5 mb-5">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Formato requerido
        </p>
        <pre className="text-xs font-mono text-neutral-600 overflow-x-auto whitespace-pre">
          {EXAMPLE_CSV}
        </pre>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-neutral-500">
          {[
            ["name", "Nombre del perfume"],
            ["brand", "Marca"],
            ["sku", "Código único (EAN o interno)"],
            ["price", "Precio en ARS"],
            ["stock", "Unidades disponibles"],
            ["ml", "Tamaño en mililitros"],
            ["concentration", "EDP · EDT · EDC · PARFUM · BODY_MIST"],
          ].map(([col, desc]) => (
            <div key={col} className="flex gap-1.5">
              <code className="text-frigia-rose font-medium shrink-0">{col}</code>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk import tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-xs text-amber-800">
        <strong>¿Tenés el CSV de Articulos.csv de tu sistema de gestión?</strong>
        <br />
        Usá el script de línea de comandos para importación masiva con los ~76 perfumes con stock:
        <pre className="mt-2 font-mono bg-amber-100 rounded p-2 overflow-x-auto">
          npx tsx scripts/seed-perfumes.ts ./Articulos.csv
        </pre>
      </div>

      {/* Textarea */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-4">
        <label className="text-sm font-medium text-frigia-dark block mb-2">
          CSV a importar
        </label>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="w-full h-52 font-mono text-xs border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-frigia-rose/30 resize-y placeholder:text-neutral-300"
          placeholder={EXAMPLE_CSV}
          spellCheck={false}
        />
        <p className="text-xs text-neutral-400 mt-1">
          {csv ? `${csv.trim().split("\n").length - 1} producto(s) detectado(s)` : "Pegá tu CSV arriba"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleImport} loading={isPending} disabled={!csv.trim()}>
          {isPending ? "Importando con IA…" : "Importar con IA"}
        </Button>

        {result?.ok && (
          <p className="text-sm font-medium text-green-600">{result.ok}</p>
        )}
        {result?.error && (
          <p className="text-sm font-medium text-red-500">Error: {result.error}</p>
        )}
      </div>

      {isPending && (
        <p className="text-xs text-neutral-400 mt-3">
          Claude está generando descripciones y notas olfativas… puede tardar unos segundos.
        </p>
      )}
    </div>
  );
}
