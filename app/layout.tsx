import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Young CEO",
  description: "Financial Education & Wealth Management Platform",
  applicationName: "Young CEO",
  icons: {
    icon: [{ url: "/brand/young-ceo-logo.png", type: "image/png" }],
    apple: [{ url: "/brand/young-ceo-logo.png", type: "image/png" }],
  },
  openGraph: {
    title: "Young CEO",
    description: "Financial Education & Wealth Management Platform",
    images: [{ url: "/brand/young-ceo-logo.png", width: 1024, height: 1024 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
