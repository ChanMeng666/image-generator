import Link from "next/link";
import { Mail, Github, Code } from "lucide-react";

export default function DeveloperShowcase() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-100 mt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500 font-mono">
          :crafted by{" "}
          <Link
            href="https://github.com/ChanMeng666"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline underline-offset-4 hover:text-gray-700"
          >
            Chan Meng
          </Link>
          :
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <Link
            href="mailto:chanmeng.dev@gmail.com"
            className="flex items-center gap-1 hover:text-black transition-colors"
          >
            <Mail size={12} />
            <span>email</span>
          </Link>
          <Link
            href="https://github.com/ChanMeng666"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-black transition-colors"
          >
            <Github size={12} />
            <span>portfolio</span>
          </Link>
          <Link
            href="https://github.com/ChanMeng666/image-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-black transition-colors"
          >
            <Code size={12} />
            <span>source</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
