import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Pinyon_Script } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
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
      className={`${cormorant.variable} ${manrope.variable} ${pinyon.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-frigia-paper text-frigia-deep">
        {children}
      </body>
    </html>
  );
}
