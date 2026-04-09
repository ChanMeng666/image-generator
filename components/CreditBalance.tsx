"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

export default function CreditBalance() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch {
      // silently fail
    }
  };

  if (balance === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full px-3 py-1">
      <Coins className="h-3.5 w-3.5 text-amber-500" />
      <span>{balance}</span>
    </div>
  );
}
