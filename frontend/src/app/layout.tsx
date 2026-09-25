import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { StoreProvider } from "@/context/StoreContext";

export const metadata: Metadata = {
  title: "Plantinum - Where Nature Meets Luxury",
  description: "Hand-Grown Atelier Greenery. Bring Nature Into Your Living Sanctuary.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Plantinum",
  },
  icons: {
    icon: "/logo_emblem.jpg",
    shortcut: "/logo_emblem.jpg",
    apple: "/logo_icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#182d21",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#182d21" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Plantinum" />
        <link rel="apple-touch-icon" href="/logo_icon.png" />
        <link rel="icon" href="/logo_emblem.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/logo_emblem.jpg" type="image/jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <StoreProvider>
          <AppShell>
            {children}
          </AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
