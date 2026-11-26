import type { Metadata, Viewport } from "next";
import { SupabaseBootstrap } from "@/components/system/SupabaseBootstrap";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | GRTK",
    default: "GRTK — Billetterie internationale, billets garantis et paiement à plusieurs",
  },
  description:
    "Plateforme internationale de billetterie : événements dans leur devise et fuseau, billets garantis GRTK, QR dynamique et paiement à plusieurs.",
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
