"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Trash2 } from "lucide-react";

interface GeneratedImage {
  id: string;
  prompt: string;
  cloudinaryUrl: string;
  width: number;
  height: number;
  isPublic: boolean;
  createdAt: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchImages();
  }, [page]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/images?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, isPublic: boolean) => {
    const res = await fetch(`/api/images/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !isPublic }),
    });
    if (res.ok) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, isPublic: !isPublic } : img
        )
      );
    }
  };

  const deleteImage = async (id: string) => {
    const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Images</h1>

      {images.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No images generated yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <Image
                    src={img.cloudinaryUrl}
                    alt={img.prompt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {img.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(img.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleVisibility(img.id, img.isPublic)}
                        title={img.isPublic ? "Make private" : "Make public"}
                      >
                        {img.isPublic ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={() => deleteImage(img.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={images.length < 20}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
