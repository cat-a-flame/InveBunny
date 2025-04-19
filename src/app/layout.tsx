import type { Metadata } from "next";
import { Quicksand, PT_Serif } from "next/font/google";
import Script from 'next/script';
import { ToastProvider } from "../components/Toast/toast";
import "../../styles/globals.css";

import Sidebar from '../components/Sidebar/sidebar';

const geistSans = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "InveBunny",
  description: "Super cute inventory management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Sidebar />
          <main>
            {children}
          </main>
        </ToastProvider>

        <Script src="https://kit.fontawesome.com/cd9ec28620.js" crossOrigin="anonymous" />
      </body>
    </html>
  );
}
