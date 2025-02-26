import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

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
});

export const metadata: Metadata = {
  title: "London Bus Arrivals Around You",
  description: "Find out the next bus arrivals around you in London",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${tflFont.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
