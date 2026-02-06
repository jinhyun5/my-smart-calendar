import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";  // 👈 ⭐️ 이 한 줄이 없으면 지금처럼 숫자만 나열돼!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Calendar",
  description: "Simple Calendar App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}