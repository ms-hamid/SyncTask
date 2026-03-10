import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { ThemeToggle } from "@/src/components/shared/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncTask | AI-Powered Agile Project Manager",
  description:
    "Transformasikan ide Anda menjadi struktur tugas Agile yang siap dikerjakan secara instan dengan bantuan AI Scrum Master. Nikmati pengalaman manajemen proyek B2B SaaS generasi masa depan.",
  openGraph: {
    title: "SyncTask | AI-Powered Agile Project Manager",
    description: "Transformasikan ide Anda menjadi struktur tugas Agile yang siap dikerjakan secara instan dengan bantuan AI Scrum Master.",
    url: "https://synctask-ai.com", // ganti dengan URL produksi yang sebenarnya
    siteName: "SyncTask",
    images: [
      {
        url: "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.jpg", // placeholder, silakan ganti dengan screenshot aplikasi
        width: 1200,
        height: 630,
        alt: "SyncTask AI Project Manager Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SyncTask | AI-Powered Agile Project Manager",
    description: "Ubah prompt jadi papan Kanban lengkap dengan skor usaha & pembagian peran otomatis.",
    images: ["https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.jpg"], // placeholder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Navbar / Top Bar */}
          <header className="fixed top-0 right-0 z-50 p-3">
            <ThemeToggle />
          </header>

          {/* Main Content */}
          <main className="min-h-screen">{children}</main>

          {/* Toast Notifications */}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
