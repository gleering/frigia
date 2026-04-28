"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import { useRouter } from "next/navigation";

const STATUS_LABELS = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
} as const;

type Status = keyof typeof STATUS_LABELS;

export function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: Status;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
      router.refresh();
    });
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={isPending}
      className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-frigia-rose/40 disabled:opacity-60"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
