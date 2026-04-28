import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadProductImage(
  file: Buffer,
  productSlug: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${file.toString("base64")}`,
    {
      folder: `frigia/products/${productSlug}`,
      transformation: [{ width: 800, height: 800, crop: "fill", quality: "auto" }],
    }
  );
  return result.secure_url;
}

export { cloudinary };
