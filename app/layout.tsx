import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
import { InstituteProvider } from "@/components/providers/InstituteProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETution - Educational Management Platform",
  description: "Multi-tenant educational management platform for institutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          <InstituteProvider>
            {children}
          </InstituteProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
