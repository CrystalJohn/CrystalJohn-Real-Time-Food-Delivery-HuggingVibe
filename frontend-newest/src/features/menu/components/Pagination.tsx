"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: { [key: string]: string | string[] | undefined };
}

function toURLSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
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

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const createPageURL = useCallback(
    (pageNumber: number | string) => {
      const params = toURLSearchParams(searchParams);
      params.set("page", pageNumber.toString());
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={currentPage <= 1}
        onClick={() =>
          router.push(createPageURL(currentPage - 1), { scroll: false })
        }
        className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => router.push(createPageURL(page), { scroll: false })}
          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${
            currentPage === page
              ? "bg-red-600 text-white font-bold"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage >= totalPages}
        onClick={() =>
          router.push(createPageURL(currentPage + 1), { scroll: false })
        }
        className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      >
        Next
      </button>
    </div>
  );
}
