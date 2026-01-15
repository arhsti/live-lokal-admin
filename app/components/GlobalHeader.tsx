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
    <header className="bg-blue-50/80 border-b border-blue-100/80 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="h-12 sm:h-14 flex items-center">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
            <div className="justify-self-start">
              <Link href="/" className="text-base sm:text-lg font-semibold text-blue-900">
                Live lokal
              </Link>
            </div>

            <div className="justify-self-center text-sm sm:text-base font-semibold text-blue-900 truncate max-w-[60vw]">
              {title}
            </div>

            <div className="justify-self-end" />
          </div>
        </div>
      </div>
    </header>
  );
}
