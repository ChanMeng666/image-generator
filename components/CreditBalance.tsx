"use client";

import { useCallback, useEffect, useState } from "react";

export const CREDITS_UPDATED_EVENT = "credits:updated";

export function notifyCreditsUpdated(balance?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CREDITS_UPDATED_EVENT, { detail: { balance } })
  );
}

export default function CreditBalance() {
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    const handler = (e: Event) => {
      const next = (e as CustomEvent).detail?.balance;
      if (typeof next === "number") {
        setBalance(next);
      } else {
        fetchBalance();
      }
    };
    window.addEventListener(CREDITS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CREDITS_UPDATED_EVENT, handler);
  }, [fetchBalance]);

  if (balance === null) {
    return (
      <div className="h-7 w-20 rounded-full ring-1 ring-gray-200 bg-white skeleton" />
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm font-mono text-gray-900 bg-white ring-1 ring-gray-200 rounded-full px-3 py-1">
      <span className="text-gray-400">:</span>
      <span>{balance}</span>
      <span className="text-gray-500 hidden sm:inline">credits</span>
      <span className="text-gray-400 hidden sm:inline">:</span>
    </div>
  );
}
