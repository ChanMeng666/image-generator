import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import DeveloperShowcase from "@/components/DeveloperShowcase";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://image-generator.chanmeng-dev.workers.dev"),
  title: "AI Image Generator",
  description:
    "Turn your prompts into images in seconds. Pay per generation, keep what you create.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "AI Image Generator",
    description: "Turn your prompts into images in seconds.",
    type: "website",
    siteName: "AI Image Generator",
    url: "https://image-generator.chanmeng-dev.workers.dev",
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "AI Image Generator — turn prompts into images in seconds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Generator",
    description: "Turn your prompts into images in seconds.",
    images: ["/og-cover.png"],
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
