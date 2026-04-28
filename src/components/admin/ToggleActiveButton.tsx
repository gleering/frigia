"use client";
import { useTransition } from "react";
import { toggleProductActive } from "@/app/actions/products";

interface Props {
  id: string;
  active: boolean;
}

export function ToggleActiveButton({ id, active }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleProductActive(id, !active);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={active ? "Desactivar" : "Activar"}
      className={`w-8 h-4 rounded-full transition-colors relative ${
        active ? "bg-green-400" : "bg-neutral-300"
      } disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${
          active ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}
