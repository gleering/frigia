import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnalyticsScripts />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
