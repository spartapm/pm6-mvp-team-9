import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PostHogProvider from "@/components/analytics/PostHogProvider";
import MobileShell from "@/components/layout/MobileShell";
import { AppProvider } from "@/context/AppContext";
import Toast from "@/components/ui/Toast";
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
  title: "오!공간상담",
  description: "오늘의집 오!공간상담 MVP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "group9 MVP",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <PostHogProvider>
          <AppProvider>
            <MobileShell>
              {children}
              <Toast />
            </MobileShell>
          </AppProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
