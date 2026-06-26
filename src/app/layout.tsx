import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavSidebar } from "@/components/NavSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Institutional Idea Feed",
  description: "Turn bank/firm media pieces into screenable stock baskets, ranked and enriched with investor metrics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <TooltipProvider>
          <NavSidebar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
