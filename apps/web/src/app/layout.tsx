import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/providers/query-provider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import {
  APP_COLORS,
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
} from "@/features/pwa/appMetadata";
import { OfflineBanner } from "@/features/pwa/components/OfflineBanner";
import { ServiceWorkerRegistrar } from "@/features/pwa/components/ServiceWorkerRegistrar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  // iOS reads these when the app is added to the home screen.
  appleWebApp: {
    capable: true,
    title: APP_SHORT_NAME,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: APP_COLORS.background,
  // Lets env(safe-area-inset-*) work, e.g. AddExpenseBar above the home indicator.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <OfflineBanner />
            {children}
            <Toaster position="top-center" />
            <ServiceWorkerRegistrar />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
