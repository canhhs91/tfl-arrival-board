import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import SWRegister from "@/components/sw-register";
import { Analytics } from "@vercel/analytics/react";

const tflFont = localFont({
  src: [
    {
      path: "../fonts/tfl-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/tfl-medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/tfl-heavy.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/tfl-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-tfl",
});

const londonTubeFont = localFont({
  src: "../fonts/LondonTube-MABx.ttf",
  variable: "--font-london-tube",
});

export const metadata: Metadata = {
  title: "London Bus Arrivals Around You",
  description: "Find out the next bus arrivals around you in London",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bus Arrivals",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('tfl-theme');document.documentElement.setAttribute('data-theme',t==='led'?'':'modern');}catch(e){document.documentElement.setAttribute('data-theme','modern');}})();` }} />
      </head>
      <body className={`${tflFont.variable} ${londonTubeFont.variable} ${tflFont.className} antialiased`}>
        <Providers>{children}</Providers>
        <SWRegister />
        <Analytics />
      </body>
    </html>
  );
}
