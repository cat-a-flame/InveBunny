import type { Metadata } from "next";
import { Quicksand, PT_Serif } from "next/font/google";
import Script from 'next/script';
import "./globals.css";

import Sidebar from '../components/sidebar';

const geistSans = Quicksand({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = PT_Serif({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "InveBunny",
  description: "Super cute inventory management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <Sidebar />
        {children}

        <Script src="https://kit.fontawesome.com/cd9ec28620.js" crossOrigin="anonymous" />
      </body>
    </html>
  );
}
