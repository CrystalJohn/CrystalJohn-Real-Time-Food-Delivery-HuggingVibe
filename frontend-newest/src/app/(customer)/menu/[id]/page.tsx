import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { menuService } from '@/features/menu/menu.service';

const currencyFormatter = new Intl.NumberFormat('vi-VN');

function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)}đ`;
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;
    const product = await menuService.getById(id);

    if (!product) {
      return notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg p-6 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Product Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner group">
                <Image
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2600'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {product.category && (
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase text-gray-800 shadow-md">
                    {product.category}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col space-y-8 lg:px-8">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-3xl font-black text-red-600">
                    {formatVnd(product.price)}
                  </p>
                  {!product.available && (
                     <div className="inline-block px-4 py-2 bg-red-100 text-red-800 font-bold rounded-lg mt-2 text-sm uppercase tracking-wide">
                       Tat ban (Sold Out)
                     </div>
                  )}
                </div>

                <div className="prose prose-lg text-gray-600">
                  <p className="text-lg leading-relaxed">
                    {product.description || 'Mon an tuyet ngon hap dan cho bua an cua ban! De dang ket hop voi cac loai do uong yeu thich cua chung toi.'}
                  </p>
                </div>

                <div className="pt-8 border-t border-gray-100 w-full flex flex-col sm:flex-row gap-4 mt-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-bold bg-red-600 hover:bg-red-700 text-white"
                    disabled={!product.available}
                  >
                    {product.available ? 'Them vao gio' : 'Het hang'}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
