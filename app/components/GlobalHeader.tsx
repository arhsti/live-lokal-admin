"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const getTitleForPath = (pathname: string) => {
  if (pathname === "/") return "Hjem";
  if (pathname === "/login") return "Logg inn";
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/images")) return "Bildegalleri";
  if (pathname.startsWith("/admin/templates")) return "Templates";
  if (pathname.startsWith("/admin/config")) return "Admin";

  const cleaned = pathname.replace(/\/$/, "");
  const last = cleaned.split("/").pop();
  if (!last) return "Live lokal";

  return last
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function GlobalHeader() {
  const pathname = usePathname();
  const title = getTitleForPath(pathname);

  return (
    <header className="bg-gray-50/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="h-12 sm:h-14 flex items-center">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
            <div className="justify-self-start">
              <Link
                href="/"
                className="text-base sm:text-lg font-semibold text-gray-900 no-underline hover:text-gray-800 transition-colors"
              >
                Live lokal
              </Link>
            </div>

            <div className="justify-self-center text-sm sm:text-base font-semibold text-gray-800 truncate max-w-[60vw]">
              {title}
            </div>

            <div className="justify-self-end">
              <Link
                href="/login"
                className="text-sm text-gray-500 no-underline hover:text-gray-800 transition-colors"
              >
                Logg ut
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
