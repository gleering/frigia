"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

export default function ImportarPage() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleImport() {
    if (!csv.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      setResult(
        data.error
          ? `Error: ${data.error}`
          : `✓ ${data.imported} productos importados`
      );
    });
  }

  const exampleCsv = `name,brand,sku,price,stock,ml,concentration
Chanel N°5,Chanel,CHAN-N5-100,28000,5,100,EDP
Invictus,Paco Rabanne,PR-INV-100,18000,8,100,EDT`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-frigia-dark mb-2">Importar CSV</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Pegá tu CSV y Claude enriquecerá las descripciones y notas olfativas
        automáticamente.
      </p>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-4">
        <p className="text-xs font-mono text-neutral-400 mb-2">Ejemplo de formato:</p>
        <pre className="text-xs bg-neutral-50 rounded-lg p-3 overflow-x-auto font-mono text-neutral-600">
          {exampleCsv}
        </pre>
        <p className="text-xs text-neutral-400 mt-2">
          Columnas requeridas: <code>name, brand, sku, price, stock, ml, concentration</code>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-4">
        <label className="text-sm font-medium text-frigia-dark block mb-2">
          Pegá tu CSV aquí
        </label>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="w-full h-48 font-mono text-xs border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-frigia-rose/50 resize-y"
          placeholder={exampleCsv}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleImport}
          loading={isPending}
          disabled={!csv.trim()}
        >
          Importar con IA
        </Button>
        {result && (
          <p
            className={`text-sm font-medium ${
              result.startsWith("Error") ? "text-red-500" : "text-green-600"
            }`}
          >
            {result}
          </p>
        )}
      </div>
    </div>
  );
}
