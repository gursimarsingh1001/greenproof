import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "GreenProof",
  description: "Like a fact-checker for sustainability claims."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-[var(--font-body)] antialiased">
        <div className="relative overflow-x-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.72),transparent_62%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
