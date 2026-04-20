"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { PromptBox } from "@/components/ui/PromptBox";
import { Skeleton } from "@/components/ui/Skeleton";
import { ImageCard, ImageCardSkeleton } from "@/components/ImageCard";
import { notifyCreditsUpdated } from "@/components/CreditBalance";

interface GenerateResult {
  id: string;
  url: string;
  prompt: string;
  creditsRemaining: number;
}

interface RecentImage {
  id: string;
  prompt: string;
  cloudinaryUrl: string;
  createdAt: string;
}

function getErrorMessage(err: { code: string; detail?: Record<string, unknown> }) {
  switch (err.code) {
    case "INSUFFICIENT_CREDITS":
      return `Not enough credits. Balance: ${err.detail?.balance ?? 0}`;
    case "PROMPT_REQUIRED":
      return "Please enter a prompt.";
    case "GENERATION_FAILED":
      return "Image generation failed. Try again.";
    case "UPLOAD_FAILED":
      return "Failed to save image. Try again.";
    case "UNAUTHORIZED":
      return "Please sign in to generate images.";
    case "NETWORK_ERROR":
      return "Network error. Check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}

async function downloadUrlAsBlob(url: string, filename: string) {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recent, setRecent] = useState<RecentImage[] | null>(null);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/images?page=1");
      if (res.ok) {
        const data = await res.json();
        setRecent((data.images ?? []).slice(0, 8));
      } else {
        setRecent([]);
      }
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setImageReady(false);

    const toastId = toast.loading("Generating...");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = getErrorMessage(data.error ?? { code: "UNKNOWN_ERROR" });
        toast.error(msg, { id: toastId });
        return;
      }

      setResult(data);
      toast.success("Generated", { id: toastId });
      notifyCreditsUpdated(data.creditsRemaining);
      fetchRecent();
    } catch {
      toast.error(getErrorMessage({ code: "NETWORK_ERROR" }), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.url || downloading) return;
    setDownloading(true);
    const toastId = toast.loading("Downloading...");
    try {
      await downloadUrlAsBlob(result.url, `${result.id}.png`);
      toast.success("Downloaded", { id: toastId });
    } catch {
      toast.error("Download failed", { id: toastId });
      window.open(result.url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col flex-1 pb-12">
      {/* Hero */}
      <section className="flex flex-col items-center text-center py-[12vh] sm:py-[15vh]">
        <h1 className="text-4xl sm:text-5xl font-medium text-black animate-in fade-in slide-in-from-bottom-3 duration-1000 ease-in-out">
          AI Image Generator
        </h1>
        <p className="mt-3 text-gray-500 text-sm sm:text-base animate-in fade-in slide-in-from-bottom-3 duration-1000 ease-in-out">
          Turn any prompt into an image.{" "}
          <span className="font-mono text-gray-700">:1 credit = 1 image:</span>
        </p>
        <div className="w-full max-w-xl mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1200 ease-in-out">
          <PromptBox
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleGenerate}
            loading={loading}
            placeholder="a cyberpunk fox at dusk"
            maxLength={500}
            autoFocus
          />
        </div>
      </section>

      {/* Result */}
      {result && (
        <section className="w-full max-w-xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="ring-1 ring-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              {!imageReady && (
                <Skeleton className="absolute inset-0 rounded-none" />
              )}
              <Image
                src={result.url}
                alt={result.prompt}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className={
                  imageReady ? "object-cover opacity-100 transition-opacity duration-500" : "object-cover opacity-0"
                }
                unoptimized
                onLoad={() => setImageReady(true)}
                priority
              />
            </div>
            <div className="flex items-center gap-3 p-3">
              <p
                className="font-mono text-sm text-gray-900 truncate flex-1"
                title={result.prompt}
              >
                :{result.prompt}:
              </p>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-9 h-9 flex items-center justify-center rounded-lg ring-1 ring-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-60"
              >
                <span className="sr-only">Download</span>
                {downloading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center font-mono">
            :1 credit used • {result.creditsRemaining} left:
          </p>
        </section>
      )}

      {/* Recent grid */}
      <section className="w-full">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-medium text-black">
            Your recent generations
          </h2>
          {recent && recent.length > 0 && (
            <span className="text-xs text-gray-500 font-mono">
              :{recent.length} shown:
            </span>
          )}
        </div>

        {recent === null ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ImageCardSkeleton key={i} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="ring-1 ring-gray-200 bg-white rounded-xl p-8 text-center">
            <p className="text-sm text-gray-500">
              Your generations will appear here. Try a prompt above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-in fade-in duration-700">
            {recent.map((img) => (
              <ImageCard
                key={img.id}
                id={img.id}
                url={img.cloudinaryUrl}
                prompt={img.prompt}
                createdAt={img.createdAt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
