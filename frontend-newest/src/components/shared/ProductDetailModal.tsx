'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';
import { menuService } from '@/features/menu/menu.service';
import { Product, MORPH_TRANSITION } from './ProductCard';
import { AddToCartButton } from '@/features/menu/components/AddToCartButton';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN');
function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)}đ`;
}

export function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setLoading(true);
      menuService.getById(product.id)
        .then(data => setDetails(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setDetails(null);
    }
  }, [product]);

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            layoutId={`product-card-${product.id}`}
            transition={MORPH_TRANSITION}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row cursor-default max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full md:w-1/2 relative bg-gray-100 aspect-square md:aspect-auto">
              <motion.div layoutId={`product-image-container-${product.id}`} transition={MORPH_TRANSITION} className="absolute inset-0 w-full h-full">
                <Image
                  src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2600'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-white z-10">
              <motion.h3 layoutId={`product-title-${product.id}`} transition={MORPH_TRANSITION} className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">
                {product.name}
              </motion.h3>

              <motion.span layoutId={`product-price-${product.id}`} transition={MORPH_TRANSITION} className="text-2xl font-bold text-red-600 mb-6 block">
                {formatVnd(product.price)}
              </motion.span>

              <div className="flex-grow">
                {loading ? (
                  <div className="flex items-center space-x-3 text-gray-500 p-4 bg-gray-50 rounded-xl">
                    <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                    <span className="font-medium">Loading details from server...</span>
                  </div>
                ) : details ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="prose prose-lg text-gray-600"
                  >
                    <p className="leading-relaxed">
                      {details.description || 'Mon an tuyet ngon hap dan cho bua an cua ban! Chua co mo ta chi tiet.'}
                    </p>
                    {details.category && (
                       <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                         <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">Category:</span>
                         <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{details.category}</span>
                       </div>
                    )}
                  </motion.div>
                ) : null}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <AddToCartButton
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  variant="full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
