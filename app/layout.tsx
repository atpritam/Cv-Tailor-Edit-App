import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const _newsreader = Newsreader({ 
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV Tailor - AI Resume Optimization",
  description:
    "AI-powered resume optimization for job applications. Tailor your resume to specific job descriptions and improve your ATS compatibility score.",
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_newsreader.variable} ${_geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Analytics />
        <link rel="stylesheet" href="/resume-styles.css" />
      </body>
    </html>
  );
}
