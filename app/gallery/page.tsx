"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CornerDownLeft } from "lucide-react";
import toast from "react-hot-toast";
import { ImageCard, ImageCardSkeleton } from "@/components/ImageCard";

interface GalleryImage {
  id: string;
  prompt: string;
  cloudinaryUrl: string;
  width: number;
  height: number;
  createdAt: string;
}

const PAGE_LIMIT = 20;

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[] | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");

  const fetchGallery = useCallback(
    async (nextPage: number, q: string) => {
      setImages(null);
      try {
        const params = new URLSearchParams({ page: nextPage.toString() });
        if (q) params.set("q", q);
        const res = await fetch(`/api/gallery?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setImages(data.images ?? []);
        } else {
          toast.error("Could not load gallery");
          setImages([]);
        }
      } catch {
        toast.error("Network error");
        setImages([]);
      }
    },
    []
  );

  useEffect(() => {
    fetchGallery(page, query);
  }, [page, query, fetchGallery]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (input !== query) {
        setPage(1);
        setQuery(input);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [input, query]);

  const hasNext = (images?.length ?? 0) >= PAGE_LIMIT;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      {/* Hero */}
      <section className="flex flex-col items-center text-center py-[10vh] sm:py-[12vh]">
        <h1 className="text-4xl sm:text-5xl font-medium text-black animate-in fade-in slide-in-from-bottom-3 duration-1000 ease-in-out">
          Community gallery
        </h1>
        <p className="mt-3 text-gray-500 text-sm sm:text-base animate-in fade-in slide-in-from-bottom-3 duration-1000 ease-in-out">
          Built with Cloudflare Workers AI •{" "}
          <span className="font-mono text-gray-700">:1 credit = 1 image:</span>
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(input);
          }}
          className="w-full max-w-xl mt-10 bg-black rounded-xl shadow-lg h-fit flex flex-row px-1 items-center animate-in fade-in slide-in-from-bottom-4 duration-1200 ease-in-out"
        >
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="search prompts"
            className="bg-transparent text-white placeholder:text-gray-400 ring-0 outline-none resize-none py-2.5 px-2 font-mono text-sm h-10 w-full"
          />
          <button
            type="submit"
            className="w-8 h-8 aspect-square flex items-center justify-center rounded-lg text-white hover:bg-white/25 focus:bg-white/25 transition-colors"
          >
            <span className="sr-only">Search</span>
            <CornerDownLeft size={16} />
          </button>
        </form>
      </section>

      {images === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <ImageCardSkeleton key={i} />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="ring-1 ring-gray-200 bg-white rounded-xl p-12 text-center">
          <p className="text-sm font-mono text-gray-500">
            {query ? `:no matches for "${query}":` : ":no public images yet:"}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-medium text-black">
              {query ? `Results for "${query}"` : "Latest"}
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              :{images.length} shown:
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-in fade-in duration-700">
            {images.map((img) => (
              <ImageCard
                key={img.id}
                id={img.id}
                url={img.cloudinaryUrl}
                prompt={img.prompt}
                createdAt={img.createdAt}
              />
            ))}
          </div>

          {(page > 1 || hasNext) && (
            <div className="flex justify-center items-center gap-2 mt-10 font-mono text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 h-8 rounded-lg ring-1 ring-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} />
                <span>prev</span>
              </button>
              <span className="text-gray-500 px-2">:page {page}:</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="flex items-center gap-1 px-3 h-8 rounded-lg ring-1 ring-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
