import { headers, cookies } from 'next/headers'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";
import { UserAccountNav } from "@/components/user-account-nav";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { createServerActionClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Improv Team Management",
  description: "Manage your improv team's shows and venues",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerActionClient()
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <div className="border-b">
              <div className="flex h-16 items-center px-8 max-w-7xl mx-auto">
                <Link 
                  href="/" 
                  className="text-xl font-bold text-primary mr-6"
                >
                  Improv Team
                </Link>
                {isAuthenticated && (
                  <>
                    <MainNav />
                    <div className="ml-auto">
                      <UserAccountNav />
                    </div>
                  </>
                )}
              </div>
            </div>
            <main className="max-w-7xl mx-auto px-8 py-6">
              {children}
            </main>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
