"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";

interface Props {
  order: {
    id: string;
    total: number;
    items: { id: string; name: string; price: number; quantity: number }[];
  };
}

export function PixelPurchaseEvent({ order }: Props) {
  useEffect(() => {
    trackPurchase(order);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
