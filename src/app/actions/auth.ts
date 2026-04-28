"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password") as string;
  const secret = process.env.ADMIN_SECRET;

  if (!secret || password !== secret) {
    return { error: "Contraseña incorrecta" };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}
