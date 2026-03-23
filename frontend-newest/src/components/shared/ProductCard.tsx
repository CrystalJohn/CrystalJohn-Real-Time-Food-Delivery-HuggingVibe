'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

/**
 * Product Interface
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: 'NEW' | 'HOT' | 'BEST SELLER' | 'SALE';
  discount?: number;
}

/**
 * ProductCard Component
 * Display product with image, name, price, and add to cart button
 */
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onClick?: (product: Product) => void;
  index?: number;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN');

function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)}đ`;
}

// Snappy spring transition for morph effect
export const MORPH_TRANSITION = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

export function ProductCard({ product, onAddToCart, onClick, index = 0 }: ProductCardProps) {
  const badgeVariant = {
    NEW: { className: 'bg-yellow-500 text-white', label: 'NEW' },
    HOT: { className: 'bg-red-600 text-white', label: 'HOT' },
    'BEST SELLER': { className: 'bg-red-600 text-white', label: 'BEST SELLER' },
    SALE: { className: 'bg-green-600 text-white', label: `-${product.discount}%` },
  };

  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  const handleCardClick = () => {
    onClick?.(product);
  };

  return (
    <motion.div
      layoutId={`product-card-${product.id}`}
      transition={MORPH_TRANSITION}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col"
    >
      {product.badge && badgeVariant[product.badge] && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
          className="absolute top-3 left-3 z-20 pointer-events-none"
        >
          <Badge className={`font-bold px-3 py-1 text-xs uppercase ${badgeVariant[product.badge].className}`}>
            {badgeVariant[product.badge].label}
          </Badge>
        </motion.div>
      )}

      <div onClick={handleCardClick} className="block relative w-full h-48 lg:h-56 overflow-hidden bg-gray-100 cursor-pointer">
        <motion.div layoutId={`product-image-container-${product.id}`} transition={MORPH_TRANSITION} className="relative w-full h-full">
          <Image
            src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2600'}
            alt={product.name || 'Product'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none" />
      </div>

      <div className="p-4 space-y-3 flex flex-col flex-grow">
        <div onClick={handleCardClick} className="block group-hover:text-red-600 transition-colors cursor-pointer">
          <motion.h3 layoutId={`product-title-${product.id}`} transition={MORPH_TRANSITION} className="font-semibold text-gray-900 text-base line-clamp-2 min-h-[3rem]">
            {product.name}
          </motion.h3>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <motion.span layoutId={`product-price-${product.id}`} transition={MORPH_TRANSITION} className="text-red-600 font-bold text-lg">{formatVnd(product.price)}</motion.span>
            {product.originalPrice ? (
              <span className="text-gray-400 text-xs line-through">
                {formatVnd(product.originalPrice)}
              </span>
            ) : (
              <span className="h-4"></span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors z-10"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="w-full rounded-full border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors py-2 h-auto text-sm font-semibold z-10"
          >
            Them vao gio
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 pointer-events-none" />
    </motion.div>
  );
}