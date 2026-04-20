"use client";

import * as React from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface ImageCardProps {
  id: string;
  url: string;
  prompt: string;
  createdAt: string | Date;
  actions?: React.ReactNode;
  showDownload?: boolean;
  priority?: boolean;
}

function triggerBlobDownload(blobUrl: string, filename: string) {
  const a = document.createElement("a");
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function ImageCard({
  id,
  url,
  prompt,
  createdAt,
  actions,
  showDownload = true,
  priority = false,
}: ImageCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const toastId = toast.loading("Downloading...");
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      triggerBlobDownload(blobUrl, `${id}.png`);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Downloaded", { id: toastId });
    } catch {
      toast.error("Download failed", { id: toastId });
      window.open(url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const dateLabel =
    typeof createdAt === "string"
      ? new Date(createdAt).toLocaleDateString()
      : createdAt.toLocaleDateString();

  return (
    <div className="ring-1 ring-gray-200 bg-white rounded-xl shadow-sm overflow-hidden relative group flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
        <Image
          src={url}
          alt={prompt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={cn(
            "object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          unoptimized
          priority={priority}
          onLoad={() => setIsLoaded(true)}
        />
        {showDownload && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="absolute top-2 right-2 w-8 h-8 aspect-square flex items-center justify-center rounded-lg ring-1 ring-gray-200 bg-white shadow opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-60"
          >
            <span className="sr-only">Download</span>
            <Download size={14} />
          </button>
        )}
      </div>
      <div className="p-3 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-xs text-gray-900 truncate"
            title={prompt}
          >
            :{prompt}:
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
            {dateLabel}
          </p>
        </div>
        {actions && (
          <div className="flex items-center gap-1 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

export function ImageCardSkeleton() {
  return (
    <div className="ring-1 ring-gray-200 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="relative aspect-square">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  );
}
