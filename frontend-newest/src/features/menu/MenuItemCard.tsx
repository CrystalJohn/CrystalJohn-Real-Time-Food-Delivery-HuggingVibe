'use client';

import Image from 'next/image';
import type { MenuItem } from '@/types';

/** Tiny 1×1 neutral-gray JPEG used as blur placeholder */
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsM' +
  'DhEQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQU' +
  'FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QA' +
  'FAABAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AAAB//9k=';

interface MenuItemCardProps {
  item: MenuItem;
  index?: number;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuItemCard({ item, index = 99, onAddToCart }: MenuItemCardProps) {
  return (
    <div className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Image wrapper — aspect-[4/3] */}
      {item.imageUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 6}
            quality={75}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xl font-bold text-red-600">${item.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(item)}
            disabled={!item.available}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {item.available ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
