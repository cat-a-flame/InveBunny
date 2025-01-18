import type { Metadata } from "next";
import { Quicksand, PT_Serif } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
