import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AI-Driven Human Resource Management System (HRMS)",
  description: "AI-Driven Human Resource Management System (HRMS)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`flex flex-row min-h-screen antialiased`}
      >
        <div className="w-[20%] min-w-[200px] shrink-0">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
