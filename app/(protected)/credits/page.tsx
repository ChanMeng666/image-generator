"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, FlaskConical, Check } from "lucide-react";
import toast from "react-hot-toast";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";
import { Skeleton } from "@/components/ui/Skeleton";
import { notifyCreditsUpdated } from "@/components/CreditBalance";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  amount: number;
  type: string;
  createdAt: string;
}

function CreditsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [stripeMode, setStripeMode] = useState<"test" | "live" | null>(null);

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
          setTransactions(data.transactions ?? []);
          notifyCreditsUpdated(data.balance);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
    fetch("/api/stripe/mode")
      .then((r) => r.json())
      .then((d) => setStripeMode(d.mode))
      .catch(() => setStripeMode(null));
  }, []);

  useEffect(() => {
    if (success) {
      toast.success("Payment successful — credits added");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      router.replace(`/credits${params.size ? `?${params.toString()}` : ""}`);
    }
    if (canceled) {
      toast("Payment canceled", { icon: "⏎" });
      const params = new URLSearchParams(searchParams.toString());
      params.delete("canceled");
      router.replace(`/credits${params.size ? `?${params.toString()}` : ""}`);
    }
  }, [success, canceled, router, searchParams]);

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    const toastId = toast.loading("Redirecting to checkout...");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.dismiss(toastId);
        window.location.href = data.url;
      } else {
        toast.error("Could not start checkout", { id: toastId });
        setPurchasing(null);
      }
    } catch {
      toast.error("Network error", { id: toastId });
      setPurchasing(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-16">
      {/* Hero */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
        <h1 className="text-3xl sm:text-4xl font-medium text-black">
          Credits
        </h1>
        <p className="mt-2 text-sm font-mono text-gray-500">
          {loading || balance === null
            ? ":loading:"
            : `:${balance} credits available:`}
        </p>
      </section>

      {/* Stripe test-mode banner */}
      {stripeMode === "test" && (
        <div className="mb-8 ring-1 ring-gray-200 bg-white rounded-xl p-4 flex items-start gap-3">
          <FlaskConical className="h-4 w-4 text-gray-700 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-black">Stripe test mode</p>
            <p className="text-gray-600 mt-0.5">
              No real charges. Use card{" "}
              <span className="font-mono text-black bg-gray-100 px-1.5 py-0.5 rounded">
                4242 4242 4242 4242
              </span>
              , any future expiry, any CVC.
            </p>
          </div>
        </div>
      )}

      {/* Packages */}
      <h2 className="text-sm font-medium text-black mb-4">Buy credits</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
        {CREDIT_PACKAGES.map((pkg) => {
          const isPopular = pkg.id === "standard";
          const perImage = (pkg.priceInCents / pkg.credits / 100).toFixed(3);
          return (
            <div
              key={pkg.id}
              className={cn(
                "relative ring-1 bg-white rounded-xl p-5 flex flex-col",
                isPopular ? "ring-black ring-2" : "ring-gray-200"
              )}
            >
              {isPopular && (
                <span className="absolute top-3 right-3 rounded-full bg-black text-white text-[10px] px-2 py-0.5 font-mono uppercase tracking-wide">
                  popular
                </span>
              )}
              <p className="text-sm text-gray-500 mb-1">{pkg.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-medium text-black">
                  {pkg.credits}
                </span>
                <span className="text-sm text-gray-500">credits</span>
              </div>
              <p className="font-mono text-sm text-black mb-1">
                ${(pkg.priceInCents / 100).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mb-5 font-mono">
                :${perImage}/image:
              </p>
              <button
                type="button"
                onClick={() => handlePurchase(pkg.id)}
                disabled={purchasing !== null}
                className="mt-auto w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-black text-white hover:bg-black/90 transition-colors text-sm disabled:opacity-60"
              >
                {purchasing === pkg.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting</span>
                  </>
                ) : (
                  <span>Buy now</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Transactions */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-medium text-black">Transaction history</h2>
        {!loading && transactions.length > 0 && (
          <span className="text-xs text-gray-500 font-mono">
            :{transactions.length} records:
          </span>
        )}
      </div>
      {loading ? (
        <div className="ring-1 ring-gray-200 bg-white rounded-xl overflow-hidden divide-y divide-gray-200">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="ring-1 ring-gray-200 bg-white rounded-xl p-8 text-center">
          <p className="text-sm font-mono text-gray-500">
            :no transactions yet:
          </p>
        </div>
      ) : (
        <div className="ring-1 ring-gray-200 bg-white rounded-xl overflow-hidden divide-y divide-gray-200">
          {transactions.map((tx) => {
            const positive = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-black capitalize truncate">
                    {tx.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {positive && <Check className="h-3.5 w-3.5 text-gray-400" />}
                  <span
                    className={cn(
                      "font-mono text-sm",
                      positive ? "text-black" : "text-gray-500"
                    )}
                  >
                    {positive ? "+" : ""}
                    {tx.amount}
                  </span>
                </div>
              </div>
            );
          })}
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
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <CreditsContent />
    </Suspense>
  );
}
