import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "سينما بلس",
  description: "منصة إدارة روابط المشاهدة والتحميل",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased bg-[#0a0a0f] text-foreground`}>
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
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
