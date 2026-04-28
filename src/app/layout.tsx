import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Frigia Perfumería | Junín, Buenos Aires",
    template: "%s | Frigia Perfumería",
  },
  description:
    "Perfumería en Junín, Buenos Aires. Descubrí nuestra colección de fragancias originales para hombre y mujer.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Frigia Perfumería",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
