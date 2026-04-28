"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    brand: string;
    category?: string;
  };
}

export function PixelProductEvents({ product }: Props) {
  useEffect(() => {
    trackViewContent(product);
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
