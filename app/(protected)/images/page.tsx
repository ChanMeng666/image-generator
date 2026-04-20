"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { ImageCard, ImageCardSkeleton } from "@/components/ImageCard";
import { cn } from "@/lib/utils";

interface GeneratedImage {
  id: string;
  prompt: string;
  cloudinaryUrl: string;
  width: number;
  height: number;
  isPublic: boolean;
  createdAt: string;
}

const PAGE_LIMIT = 20;

export default function ImagesPage() {
  const [images, setImages] = useState<GeneratedImage[] | null>(null);
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchImages = useCallback(async (nextPage: number) => {
    setImages(null);
    try {
      const res = await fetch(`/api/images?page=${nextPage}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images ?? []);
      } else {
        toast.error("Could not load your images");
        setImages([]);
      }
    } catch {
      toast.error("Network error");
      setImages([]);
    }
  }, []);

  useEffect(() => {
    fetchImages(page);
  }, [page, fetchImages]);

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(null), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const toggleVisibility = async (id: string, isPublic: boolean) => {
    const prev = images;
    setImages((list) =>
      list
        ? list.map((img) =>
            img.id === id ? { ...img, isPublic: !isPublic } : img
          )
        : list
    );
    try {
      const res = await fetch(`/api/images/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (!res.ok) throw new Error();
      toast.success(isPublic ? "Set to private" : "Published to gallery");
    } catch {
      toast.error("Could not update visibility");
      setImages(prev);
    }
  };

  const deleteImage = async (id: string) => {
    const prev = images;
    setImages((list) => (list ? list.filter((img) => img.id !== id) : list));
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
    } catch {
      toast.error("Could not delete");
      setImages(prev);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (confirmDelete === id) {
      deleteImage(id);
    } else {
      setConfirmDelete(id);
    }
  };

  const publicCount = images?.filter((i) => i.isPublic).length ?? 0;
  const total = images?.length ?? 0;
  const hasNext = (images?.length ?? 0) >= PAGE_LIMIT;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-16">
      <section className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
        <h1 className="text-3xl sm:text-4xl font-medium text-black">
          Your images
        </h1>
        {images && images.length > 0 && (
          <p className="mt-2 text-sm font-mono text-gray-500">
            :page {page} • {total} shown • {publicCount} public:
          </p>
        )}
      </section>

      {images === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <ImageCardSkeleton key={i} />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="ring-1 ring-gray-200 bg-white rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500 mb-3">
            {page > 1 ? "No images on this page." : "You haven't generated any images yet."}
          </p>
          <Link
            href="/"
            className="text-sm font-mono text-black underline underline-offset-4 hover:text-gray-700"
          >
            :generate your first image →:
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-in fade-in duration-700">
            {images.map((img) => (
              <ImageCard
                key={img.id}
                id={img.id}
                url={img.cloudinaryUrl}
                prompt={img.prompt}
                createdAt={img.createdAt}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(img.id, img.isPublic)}
                      title={img.isPublic ? "Make private" : "Make public"}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                    >
                      <span className="sr-only">
                        {img.isPublic ? "Make private" : "Make public"}
                      </span>
                      {img.isPublic ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(img.id)}
                      title={
                        confirmDelete === img.id
                          ? "Click again to confirm"
                          : "Delete"
                      }
                      className={cn(
                        "h-7 flex items-center justify-center rounded-md transition-all",
                        confirmDelete === img.id
                          ? "px-2 text-red-600 bg-red-50 ring-1 ring-red-200 text-[10px] font-mono"
                          : "w-7 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      )}
                    >
                      {confirmDelete === img.id ? (
                        <span>confirm?</span>
                      ) : (
                        <>
                          <span className="sr-only">Delete</span>
                          <Trash2 className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </>
                }
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
