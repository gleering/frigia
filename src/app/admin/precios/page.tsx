"use client";
import { useState, useTransition } from "react";
import { bulkUpdatePrices } from "@/app/actions/products";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function PreciosPage() {
  const [percentage, setPercentage] = useState("");
  const [result, setResult] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    const pct = parseFloat(percentage);
    if (isNaN(pct)) return;
    startTransition(async () => {
      const res = await bulkUpdatePrices(pct);
      if (res.error) setResult(`Error: ${res.error}`);
      else setResult(`✓ ${res.updated} productos actualizados`);
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-frigia-dark mb-2">
        Actualizar precios
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        Actualiza el precio de todos los productos por un porcentaje. Útil para
        ajustes por inflación.
      </p>

      <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Porcentaje de ajuste"
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="Ej: 15 (para +15%) o -10 (para -10%)"
            hint="Un valor positivo aumenta el precio, negativo lo reduce"
          />

          <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-600">
            {percentage && !isNaN(parseFloat(percentage)) ? (
              <p>
                Un producto de $10.000 pasará a{" "}
                <strong>
                  $
                  {Math.round(
                    10000 * (1 + parseFloat(percentage) / 100)
                  ).toLocaleString("es-AR")}
                </strong>
              </p>
            ) : (
              <p className="text-neutral-400">Ingresá un porcentaje para ver la vista previa</p>
            )}
          </div>

          <Button
            onClick={handleUpdate}
            loading={isPending}
            disabled={!percentage || isNaN(parseFloat(percentage))}
          >
            Actualizar todos los precios
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
    </div>
  );
}
