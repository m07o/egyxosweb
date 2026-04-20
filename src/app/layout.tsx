import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "سينما بلس - CinemaPlus",
  description: "مشاهدة وتحميل أفلام ومسلسلات بجودة عالية",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className={`${cairo.variable} antialiased bg-[#0a0a0f] text-foreground`} style={{ fontFamily: 'var(--font-cairo), sans-serif' }}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            dir="rtl"
            toastOptions={{
              style: {
                background: '#141820',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#e2e8f0',
                fontFamily: 'var(--font-cairo), sans-serif',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
