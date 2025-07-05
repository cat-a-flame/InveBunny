import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import Script from 'next/script';
import { ToastProvider } from "../components/Toast/toast";
import { ProfileProvider } from "../components/ProfileContext/profile";
import "../../styles/globals.css";

import Sidebar from '../components/Sidebar/sidebar';
import { Suspense } from 'react';
import { createClient } from '../utils/supabase/server';

const geistSans = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "InveBunny",
  description: "Super cute inventory management",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={geistSans.variable}>
        <ProfileProvider>
          <ToastProvider>
            {user && (
              <Suspense fallback={null}>
                <Sidebar />
              </Suspense>
            )}
            <main>
              {children}
            </main>
          </ToastProvider>
        </ProfileProvider>

        <Script src="https://kit.fontawesome.com/cd9ec28620.js" crossOrigin="anonymous" />
      </body>
    </html>
  );
}
