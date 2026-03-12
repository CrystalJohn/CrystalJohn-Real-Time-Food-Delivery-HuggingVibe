'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { menuService } from '@/features/menu/menu.service';
import type { MenuItem } from '@/types/menu';
import { AddToCartButton } from './AddToCartButton';
import { Spinner } from '@/components/ui/Spinner';
import type { Product } from './ProductCard';

interface MenuItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  initialProduct: Product;
}

const vndFormatter = new Intl.NumberFormat('vi-VN');

function formatVnd(price: number) {
  return `${vndFormatter.format(price)} VNĐ`;
}

export function MenuItemDetailModal({ isOpen, onClose, itemId, initialProduct }: MenuItemDetailModalProps) {
  const [data, setData] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (data && String(data.id) === String(itemId)) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const itemDetail = await menuService.getById(itemId);
        setData(itemDetail);
      } catch (err) {
        console.error('[MenuItemDetailModal] Fetch Error:', err);
        setError('Không thể tải chi tiết món ăn.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, itemId, data]);

  // Merge loaded data with initialProduct so we show something immediately
  const displayData = {
    name: data?.name || initialProduct.name,
    description: data?.description || initialProduct.description,
    price: data?.price ?? initialProduct.price,
    imageUrl: data?.imageUrl || initialProduct.image,
    category: data?.category || '',
    available: data ? data.available : true,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Modal Content - Shared Layout Transition */}
          <motion.div
            layoutId={`product-card-${itemId}`}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6 z-10 overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Display subtle loading spinner un-intrusively instead of wiping UI */}
            {loading && !error && (
              <div className="absolute top-4 right-14 z-20">
                <div className="scale-75"><Spinner /></div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <motion.div
                layoutId={`product-image-${itemId}`}
                className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[300px] bg-gray-100 rounded-2xl overflow-hidden shrink-0"
              >
                <Image
                  src={displayData.imageUrl}
                  alt={displayData.name}
                  fill
                  className="object-cover"
                />
                {!displayData.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-sm font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
                      Hết hàng
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Details */}
              <div className="flex flex-col flex-1 pb-2 mt-4 md:mt-0">
                <motion.h2
                  layoutId={`product-title-${itemId}`}
                  className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2 pr-8"
                >
                  {displayData.name}
                </motion.h2>

                {displayData.category && (
                  <div className="mb-4">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                      {displayData.category}
                    </span>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-gray-600 leading-relaxed mb-6 flex-1"
                >
                  {error ? (
                    <p className="text-red-500 font-medium">{error}</p>
                  ) : (
                    <p>{displayData.description || 'Đang tải mô tả ...'}</p>
                  )}
                </motion.div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <motion.div
                    layoutId={`product-price-${itemId}`}
                    className="flex flex-col"
                  >
                    <span className="text-sm text-gray-400 font-semibold mb-0.5">Giá</span>
                    <span className="text-2xl font-black text-red-600">
                      {formatVnd(displayData.price)}
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="scale-110 origin-right transition-transform"
                  >
                    {displayData.available ? (
                      <AddToCartButton
                        productId={itemId}
                        name={displayData.name}
                        price={displayData.price}
                      />
                    ) : (
                      <button disabled className="px-4 py-2 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                        Hết hàng
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Absolute Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-20"
            >
              ✕
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
