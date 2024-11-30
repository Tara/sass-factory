import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";
import { Providers } from "@/components/providers";
import { User } from '@supabase/auth-helpers-nextjs'

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
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const isAuthenticated = Boolean(!error && user)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <div className="border-b">
              <div className="flex h-16 items-center px-8 max-w-7xl mx-auto">
                <MainNav isAuthenticated={isAuthenticated} />
              </div>
            )}
            <main className="max-w-7xl mx-auto px-8 py-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
