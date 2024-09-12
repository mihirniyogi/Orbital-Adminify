import type { Metadata } from "next";
import "./globals.css";
import { barlow } from "./fonts/fonts";
import { AppWrapper } from "./context/UserContext";

export const metadata: Metadata = {
  title: "NUS Adminify",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`flex ${barlow.className}`}>
        {/* global user context */}
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
