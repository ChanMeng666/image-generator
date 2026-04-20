"use client";

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

function SparkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

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
            <SparkIcon />
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
