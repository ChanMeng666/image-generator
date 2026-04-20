import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import DeveloperShowcase from "@/components/DeveloperShowcase";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Image Generator",
  description:
    "Turn your prompts into images in seconds. Pay per generation, keep what you create.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-100`}>
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)] flex flex-col">
          {children}
        </main>
        <DeveloperShowcase />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#111",
              color: "#fff",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "13px",
              borderRadius: "12px",
              padding: "10px 14px",
            },
            success: { iconTheme: { primary: "#fff", secondary: "#111" } },
            error: { iconTheme: { primary: "#fff", secondary: "#111" } },
          }}
        />
      </body>
    </html>
  );
}
