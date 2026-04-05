import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GlobalSidebarTrigger } from "@/components/global-sidebar-trigger";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/page-transition";
import { Toaster } from "sonner";
import { BrandingProvider } from "@/lib/hooks/useBranding";
import { RouteGuard } from "@/components/route-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "StayManager",
  description: "Property management application",
  icons: {
    icon: '/gedung.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${manrope.variable} ${plusJakarta.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BrandingProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="w-full">
                <GlobalSidebarTrigger className="ml-4 mt-4" />
                <div className="p-4">
                  <PageTransition>
                    <RouteGuard>
                      {children}
                    </RouteGuard>
                  </PageTransition>
                </div>
              </main>
            </SidebarProvider>
          </BrandingProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}