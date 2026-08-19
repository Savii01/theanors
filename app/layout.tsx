import type { Metadata } from "next";
import "./globals.css";
import { MainLayout } from "@/components/layouts/MainLayout";

export const metadata: Metadata = {
  title: "Theanors | Content Operations Platform",
  description: "Zero-cost, self-learning content operations for Executive Assistants",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
