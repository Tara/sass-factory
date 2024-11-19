import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Improv Team Management",
  description: "Manage your improv team's shows and venues",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-screen bg-background">
          <div className="border-b">
            <div className="flex h-16 items-center px-4 md:px-8">
              <MainNav />
            </div>
          </div>
          <main className="container mx-auto px-4 py-8 md:px-8 max-w-7xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
