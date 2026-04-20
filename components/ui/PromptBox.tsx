"use client";

import * as React from "react";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "dark" | "light";
  className?: string;
  name?: string;
  maxLength?: number;
  autoFocus?: boolean;
}

export function PromptBox({
  value,
  onChange,
  onSubmit,
  placeholder = "a cat riding a bicycle",
  loading = false,
  disabled = false,
  variant = "dark",
  className,
  name = "prompt",
  maxLength,
  autoFocus,
}: PromptBoxProps) {
  const submitRef = React.useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || loading || !value.trim()) return;
    onSubmit();
  };

  const isDark = variant === "dark";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-xl shadow-lg h-fit flex flex-row px-1 items-center w-full transition-colors",
        isDark ? "bg-black" : "bg-white ring-1 ring-gray-200 shadow-sm",
        className
      )}
    >
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitRef.current?.click();
          }
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        disabled={disabled || loading}
        className={cn(
          "bg-transparent ring-0 outline-none resize-none py-2.5 px-2 font-mono text-sm h-10 w-full transition-all duration-300 disabled:opacity-60",
          isDark
            ? "text-white placeholder:text-gray-400"
            : "text-black placeholder:text-gray-400"
        )}
      />
      <button
        ref={submitRef}
        type="submit"
        disabled={disabled || loading || !value.trim()}
        className={cn(
          "w-8 h-8 aspect-square flex items-center justify-center rounded-lg transition-opacity disabled:opacity-40",
          isDark
            ? "text-white hover:bg-white/25 focus:bg-white/25"
            : "text-black hover:bg-gray-100 focus:bg-gray-100"
        )}
      >
        <span className="sr-only">Submit</span>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <CornerDownLeft size={16} />
        )}
      </button>
    </form>
  );
}
