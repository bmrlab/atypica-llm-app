import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import UserMenu from "@/components/UserMenu";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

<div className="flex items-center gap-4">
  <UserMenu />
</div>;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "black",
};

export const metadata: Metadata = {
  title: {
    default: "Atypica LLM - 为「主观世界」建模",
    template: "%s | Atypica LLM",
  },
  description: "",
  keywords: [],
  authors: [{ name: "Tezign" }],
  category: "technology",
  openGraph: {
    title: "Atypica LLM - 为「主观世界」建模",
    description: "",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atypica LLM - 为「主观世界」建模",
    description: "",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/atypica.png",
    shortcut: "/atypica.png",
    apple: { url: "/atypica.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
      {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId="G-EJTF0VJKQP" />}
    </html>
  );
}
