"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

type SearchParams = { [key: string]: string | string[] | undefined };

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toURLSearchParams(searchParams: SearchParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.set(key, value);
    }
  }
  return params;
}

export function SortSelect({ searchParams }: { searchParams: SearchParams }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSort = getSingleParam(searchParams.sort) || "";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = toURLSearchParams(searchParams);
      if (!value) params.delete(name);
      else params.set(name, value);

      params.delete("page");
      return params.toString();
    },
    [searchParams],
  );

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`${pathname}?${createQueryString("sort", e.target.value)}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort"
        className="text-sm text-gray-500 hidden sm:inline-block"
      >
        Sort by:
      </label>
      <select
        id="sort"
        onChange={handleSort}
        value={currentSort}
        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-red-500 focus:border-red-500 block px-4 py-2 pr-8 appearance-none outline-none cursor-pointer shadow-sm"
      >
        <option value="">Recommended</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}
