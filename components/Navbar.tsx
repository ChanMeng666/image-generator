"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import CreditBalance from "@/components/CreditBalance";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Generate", authOnly: true },
  { href: "/gallery", label: "Gallery", authOnly: false },
  { href: "/images", label: "My Images", authOnly: true },
  { href: "/credits", label: "Credits", authOnly: true },
];

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const isAuthed = !!session?.user;
  const links = NAV_LINKS.filter((l) => !l.authOnly || isAuthed);

  return (
    <header className="top-0 sticky z-30 w-full bg-gray-100/95 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-1000 ease-in-out">
      <div className="max-w-5xl mx-auto h-14 flex flex-row flex-nowrap items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-x-4 sm:gap-x-6 min-w-0">
          <Link
            href={isAuthed ? "/" : "/gallery"}
            className="flex items-center gap-x-1.5 text-black text-base font-medium leading-none rounded-lg shrink-0"
          >
            <Image
              src="/logo.svg"
              alt="image-gen logo"
              width={497}
              height={361}
              priority
              className="h-5 w-auto"
            />
            <span className="hidden xs:inline sm:inline">image-gen</span>
          </Link>
          <nav className="flex items-center gap-x-0.5 min-w-0">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-2.5 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap",
                    active
                      ? "text-black bg-white ring-1 ring-gray-200"
                      : "text-gray-600 hover:text-black hover:bg-gray-200/60"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-x-2">
          {isAuthed ? (
            <>
              <CreditBalance />
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-black hover:bg-gray-200/60 transition-colors"
              >
                <span className="sr-only">Sign out</span>
                <LogOut size={16} />
              </button>
            </>
          ) : isPending ? null : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm text-gray-700 hover:text-black rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-sm bg-black text-white hover:bg-black/90 rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
