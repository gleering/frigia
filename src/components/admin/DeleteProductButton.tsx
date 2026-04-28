"use client";
import { useTransition } from "react";
import { deleteProduct } from "@/app/actions/products";

interface Props {
  id: string;
  name: string;
}

export function DeleteProductButton({ id, name }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteProduct(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-500 hover:underline font-medium disabled:opacity-50"
    >
      {isPending ? "..." : "Eliminar"}
    </button>
  );
}
