import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Or a suitable Arabic font
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

// Consider using an Arabic font like Noto Sans Arabic or Tajawal
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "لوحة تحكم تتبع الفاشيات الوبائية", // Arabic Title
  description: "تطبيق ويب لإدارة وتتبع الفاشيات الوبائية في المستشفيات", // Arabic Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl"> {/* Set lang to Arabic and direction to RTL */} 
      <body>
        {/* Wrap children with the main layout component */}
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

