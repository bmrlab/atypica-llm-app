import { AuthProvider } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
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
    default: "Atypica LLM - AI 驱动的用户研究平台",
    template: "%s | Atypica LLM",
  },
  description: "通过 AI 驱动的深度访谈，发现用户真实需求，构建立体用户画像，为产品决策提供支持",
  keywords: ["用户研究", "用户画像", "AI访谈", "市场调研", "用户洞察", "消费者行为", "产品决策"],
  authors: [{ name: "Tezign" }],
  category: "technology",
  openGraph: {
    title: "Atypica LLM - AI 驱动的用户研究平台",
    description: "通过 AI 驱动的深度访谈，发现用户真实需求，构建立体用户画像，为产品决策提供支持",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atypica LLM - AI 驱动的用户研究平台",
    description: "通过 AI 驱动的深度访谈，发现用户真实需求，构建立体用户画像，为产品决策提供支持",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/atypica.png" },
      { url: "/atypica.png", sizes: "16x16", type: "image/png" },
      { url: "/atypica.png", sizes: "32x32", type: "image/png" },
      { url: "/atypica.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: ["/atypica.png"],
    apple: [{ url: "/atypica.png" }, { url: "/atypica.png", sizes: "180x180", type: "image/png" }],
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased px-3 sm:px-24`}>
        <AuthProvider>
          <Navigation />
          <UserMenu />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
      {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId="G-EJTF0VJKQP" />}
    </html>
  );
}
