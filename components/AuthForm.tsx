"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { signIn, signUp } from "@/lib/auth-client";

interface AuthFormProps {
  mode: "login" | "register";
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "github" | "google" | null
  >(null);
  const router = useRouter();

  const isLogin = mode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const result = isLogin
        ? await signIn.email({ email, password })
        : await signUp.email({ email, password, name });

      if (result.error) {
        toast.error(
          result.error.message ||
            (isLogin ? "Sign in failed" : "Sign up failed")
        );
        return;
      }
      toast.success(isLogin ? "Welcome back" : "Account created");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: "github" | "google") => {
    setSocialLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: window.location.origin + "/",
      });
    } catch {
      toast.error("Could not start sign-in");
      setSocialLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="ring-1 ring-gray-200 bg-white rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-black">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isLogin
              ? "Sign in to keep generating."
              : "Start turning prompts into images."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSocial("github")}
            disabled={socialLoading !== null || loading}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-lg ring-1 ring-gray-200 bg-white hover:bg-gray-50 text-sm text-black transition-colors disabled:opacity-60"
          >
            {socialLoading === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            <span>GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocial("google")}
            disabled={socialLoading !== null || loading}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-lg ring-1 ring-gray-200 bg-white hover:bg-gray-50 text-sm text-black transition-colors disabled:opacity-60"
          >
            {socialLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            <span>Google</span>
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-[11px] uppercase tracking-wider text-gray-400 font-mono">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className="block text-xs text-gray-600 mb-1 font-mono"
              >
                name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex h-10 w-full rounded-lg ring-1 ring-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-xs text-gray-600 mb-1 font-mono"
            >
              email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-lg ring-1 ring-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs text-gray-600 mb-1 font-mono"
            >
              password {!isLogin && <span className="text-gray-400">(min 8 chars)</span>}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="flex h-10 w-full rounded-lg ring-1 ring-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </div>
          <button
            type="submit"
            disabled={loading || socialLoading !== null}
            className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-black text-white hover:bg-black/90 text-sm transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isLogin ? "Sign in" : "Create account"}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? (
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-black underline underline-offset-4 hover:text-gray-700"
              >
                Sign up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-black underline underline-offset-4 hover:text-gray-700"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
