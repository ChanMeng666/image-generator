"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Coins, Loader2, Check, ArrowDown, ArrowUp } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";

interface Transaction {
  id: number;
  amount: number;
  type: string;
  createdAt: string;
}

function CreditsContent() {
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      }
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Credits</h1>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800">
            Payment successful! Credits have been added to your account.
          </span>
        </div>
      )}

      {canceled && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <span className="text-yellow-800">Payment was canceled.</span>
        </div>
      )}

      {/* Current Balance */}
      <Card className="mb-8">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-amber-100 rounded-full p-3">
            <Coins className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-3xl font-bold text-gray-900">
              {balance} credits
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Buy Credits
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card key={pkg.id} className="relative">
            {pkg.id === "standard" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              <CardDescription>
                {pkg.credits} credits
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-gray-900 mb-4">
                ${(pkg.priceInCents / 100).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ${(pkg.priceInCents / pkg.credits / 100).toFixed(3)} per image
              </p>
              <Button
                className="w-full"
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing !== null}
              >
                {purchasing === pkg.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction History */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Transactions
      </h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-sm">No transactions yet.</p>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {tx.amount > 0 ? (
                  <ArrowDown className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowUp className="h-4 w-4 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {tx.type.replace("_", " ")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-medium ${
                  tx.amount > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <CreditsContent />
    </Suspense>
  );
}
