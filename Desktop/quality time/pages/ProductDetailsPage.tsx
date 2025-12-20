import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import Button from '../components/Button';

interface ProductDetailsPageProps {
  addToCart: (p: Product) => void;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  const s = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      try {
        return val.name || val.id || JSON.stringify(val);
      } catch (e) {
        return 'Object';
      }
    }
    return String(val);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch product');
        }
        
        setProduct(data);
      } catch (err: any) {
        console.error('Failed to fetch product:', err);
        // Optionally show an error message to the user
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="bg-black min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Button 
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-gray-400 hover:text-white"
        >
          <ArrowRight size={18} className="ml-1" /> العودة
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* قسم الصور */}
          <div className="space-y-6">
            {/* الصورة الرئيسية */}
            <div className="aspect-square bg-neutral-900 border border-white/5 rounded-lg overflow-hidden">
              <img 
                src={product.images[activeImage] || 'https://picsum.photos/800/800'} 
                alt={s(product.name)}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            
            {/* الصور المصغرة */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square border rounded-md overflow-hidden transition-all ${
                      activeImage === idx 
                        ? 'border-[#c5a059] ring-1 ring-[#c5a059]/20' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* قسم التفاصيل */}
          <div className="text-right">
            {/* العلامة التجارية */}
            <p className="text-[#c5a059] text-sm font-medium tracking-wider uppercase mb-2">
              {s(product.brand)}
            </p>

            {/* اسم المنتج */}
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-8">
              {s(product.name)}
            </h1>

            {/* السعر */}
            <div className="mb-10">
              {product.old_price && (
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-lg text-gray-500 line-through">
                    {Number(product.old_price).toLocaleString()} دج
                  </span>
                  <span className="text-sm text-[#c5a059] bg-[#c5a059]/10 px-2 py-1 rounded">
                    وفر {Number(product.old_price - product.price).toLocaleString()} دج
                  </span>
                </div>
              )}
              <div className="text-4xl sm:text-5xl font-bold text-white">
                {Number(product.price).toLocaleString()} 
                <span className="text-lg text-gray-400 mr-2">دج</span>
              </div>
            </div>

            {/* الوصف */}
            <div className="mb-10">
              <p className="text-gray-300 text-lg leading-relaxed">
                {s(product.description)}
              </p>
            </div>

            {/* المخزون */}
            <div className="mb-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                product.stock_quantity > 10 
                  ? 'bg-green-500/10 text-green-400' 
                  : product.stock_quantity > 0
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  product.stock_quantity > 10 
                    ? 'bg-green-400' 
                    : product.stock_quantity > 0
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`} />
                {product.stock_quantity > 10 
                  ? 'متوفر في المخزون' 
                  : product.stock_quantity > 0
                  ? `الكمية المتبقية: ${product.stock_quantity}`
                  : 'نفذت الكمية'
                }
              </div>
            </div>

            {/* زر الإضافة للسلة */}
            <div className="flex gap-4">
              <Button 
                variant="primary"
                size="lg"
                fullWidth
                disabled={product.stock_quantity === 0}
                onClick={() => addToCart(product)}
                className="h-14 text-lg font-medium"
              >
                {product.stock_quantity === 0 ? (
                  'نفذت الكمية'
                ) : (
                  <>
                    <ShoppingCart size={22} className="ml-2" />
                    إضافة للسلة
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;