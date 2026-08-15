import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FeeLens — Stripe Fee Intelligence",
  description: "See exactly where your Stripe fees go. Get AI-powered recommendations to lower your effective rate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Blocking: sets the theme class before first paint, so dark-mode
            users never see a light frame. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--fl-bg)', color: 'var(--fl-text-primary)' }}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
