"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, ImageIcon, CreditCard, LayoutGrid } from "lucide-react";
import CreditBalance from "@/components/CreditBalance";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  if (!session) return null;

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="font-bold text-gray-900 hidden sm:inline">
                AI Image Generator
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Generate</span>
                </Button>
              </Link>
              <Link href="/images">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">My Images</span>
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Gallery</span>
                </Button>
              </Link>
              <Link href="/credits">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Credits</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditBalance />
            <span className="text-sm text-gray-600 hidden md:inline">
              {session.user.name || session.user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
