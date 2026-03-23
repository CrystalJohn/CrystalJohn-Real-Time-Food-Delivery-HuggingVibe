"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

type SearchParams = { [key: string]: string | string[] | undefined };

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function MenuSearchBar({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(getSingleParam(searchParams.q) ?? "");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(getSingleParam(searchParams.q) ?? "");
  }, [searchParams]);

  useEffect(() => {
    const currentQuery = getSingleParam(searchParams.q) ?? "";
    if (query === currentQuery) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();

      // rebuild từ object searchParams (tránh useSearchParams() => lỗi build Next 16)
      for (const [key, value] of Object.entries(searchParams)) {
        if (value == null) continue;
        if (Array.isArray(value)) {
          for (const v of value) params.append(key, v);
        } else {
          params.set(key, value);
        }
      }

      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");

      params.delete("page"); // đổi keyword thì reset page

      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 350);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, query, router, searchParams]);

  return (
    <div className="w-full mt-5 mb-4 md:mt-7 md:mb-5">
      <div className="relative mx-auto w-full max-w-4xl">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your dish, coffee, tea..."
          className="h-14 md:h-16 w-full rounded-2xl border border-gray-300 bg-white pl-14 pr-5 text-base md:text-lg text-gray-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)] outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
        />
      </div>
    </div>
  );
}
