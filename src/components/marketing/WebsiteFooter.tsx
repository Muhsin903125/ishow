import Link from "next/link";
import { Instagram } from "lucide-react";

export default function WebsiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#140f0a] py-12 text-center">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-4 text-2xl font-extrabold uppercase tracking-tight text-[#fffaf6]">
          iShow<span className="text-orange-500">Transformation</span>
        </p>
        <div className="mb-6 flex items-center justify-center gap-6">
          <Link
            href="/privacy"
            className="text-sm font-semibold text-[rgba(255,250,246,0.62)] transition-colors hover:text-[#fffaf6]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm font-semibold text-[rgba(255,250,246,0.62)] transition-colors hover:text-[#fffaf6]"
          >
            Terms of Service
          </Link>
          <a
            href="https://www.instagram.com/sufiyan_mohd26/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[rgba(255,250,246,0.62)] transition-colors hover:text-orange-500"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,250,246,0.5)]">
          Dubai, UAE
        </p>
      </div>
    </footer>
  );
}
