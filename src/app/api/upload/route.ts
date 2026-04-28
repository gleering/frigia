import { cloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "frigia/products";

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      transformation: [
        { width: 900, height: 900, crop: "limit", quality: "auto:good" },
      ],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al subir imagen";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
