"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import Navbar from "@/components/Navbar";

interface GalleryImage {
  id: string;
  prompt: string;
  cloudinaryUrl: string;
  width: number;
  height: number;
  createdAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchGallery();
  }, [page, search]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.set("q", search);
      const res = await fetch(`/api/gallery?${params}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search prompts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-64"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No public images yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden"
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
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {img.prompt}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(img.createdAt).toLocaleDateString()}
                    </p>
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
    </>
  );
}
