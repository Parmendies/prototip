import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MediPanel — Hastane Yönetim Sistemi",
    template: "%s | MediPanel",
  },
  description:
    "Çok kiracılı akıllı hastane yönetim paneli. Doktor takvimi, hasta randevusu ve hastane operasyonlarını tek platformda yönetin.",
  keywords: ["hastane yönetimi", "doktor takvimi", "hasta randevusu", "sağlık paneli"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
