import type { Metadata, Viewport } from "next";
import { SupabaseBootstrap } from "@/components/system/SupabaseBootstrap";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | GODMAN RECORDS TIKET",
    default: "GODMAN RECORDS TIKET — Billetterie Événementielle & Musique (Congo-Brazzaville)",
  },
  description:
    "Plateforme de billetterie professionnelle de nouvelle génération pour le label musical Godman Records et les organisateurs au Congo-Brazzaville. Paiements MTN & Airtel Money, billets WhatsApp et contrôle sécurisé.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="dark" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] antialiased selection:bg-[var(--gold-primary)] selection:text-black">
        <AuthProvider>
          <SupabaseBootstrap />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
