import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NBA2K Fantasy Draft Simulator",
  description: "Simulate an NBA2K fantasy draft with your friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans antialiased dark">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
