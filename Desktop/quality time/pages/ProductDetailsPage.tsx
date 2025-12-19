
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { ShoppingCart, ArrowRight, Star } from 'lucide-react';
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

  // Safe string helper to prevent [object Object]
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(error);
        navigate('/products');
      } else {
        setProduct(data);
      }
      setLoading(false);
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
    <div className="bg-black min-h-screen py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <Button 
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 sm:mb-12"
        >
          <ArrowRight size={18} className="sm:size-20" /> العودة للتسوق
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 justify-items-center lg:justify-items-start">
          <div className="space-y-4 sm:space-y-6">
            <div className="aspect-square bg-neutral-900 border border-[#c5a059]/10 rounded-sm overflow-hidden">
              <img 
                src={product.images[activeImage] || 'https://picsum.photos/800/800'} 
                alt={s(product.name)}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square border-2 rounded-sm overflow-hidden transition-all ${activeImage === idx ? 'border-[#c5a059]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col text-center items-center">
            <p className="text-[#c5a059] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 text-sm sm:text-base">{s(product.brand)}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">{s(product.name)}</h1>
            
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex text-[#c5a059]">
                {[1,2,3,4,5].map(i => <Star key={i} size={18} className="sm:size-20" fill="currentColor" />)}
              </div>
              <span className="text-gray-400 text-sm">(12 تقييم)</span>
            </div>

            <div className="flex items-center justify-center gap-6 mb-8 bg-white/5 py-4 px-8 rounded-2xl border border-white/10 backdrop-blur-sm">
              {product.old_price && (
                <span className="text-xl sm:text-2xl text-gray-500 line-through decoration-red-500/50">{Number(product.old_price).toLocaleString()} دج</span>
              )}
              <span className="text-3xl sm:text-5xl font-serif text-[#c5a059] font-bold">{Number(product.price).toLocaleString()} <span className="text-lg text-white/50">دج</span></span>
            </div>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto opacity-90">
              {s(product.description)}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button 
                variant="primary"
                size="lg"
                fullWidth
                disabled={product.stock_quantity === 0}
                onClick={() => addToCart(product)}
                className="py-4 sm:py-5 text-lg sm:text-xl shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:shadow-[0_0_50px_rgba(197,160,89,0.4)] transition-all duration-300"
              >
                {product.stock_quantity === 0 ? 'نفذت الكمية' : (
                  <>
                    إضافة للسلة <ShoppingCart size={22} className="mr-2" />
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
