import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Check, ShieldCheck, Truck, Loader2 } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0]);
      } else {
          setSelectedImage('https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600')
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-gold-500 animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-white">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-lg overflow-hidden border border-white/10 bg-dark-700">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-md overflow-hidden border ${selectedImage === img ? 'border-gold-500' : 'border-white/10 hover:border-white/30'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-white">
          <h2 className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2">{product.brand}</h2>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-light text-gray-200 mb-8">{product.price.toLocaleString()} DA</p>
          
          <div className="prose prose-invert max-w-none text-gray-400 mb-8">
            <p>{product.description}</p>
          </div>

          {/* Specs */}
          <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/5">
            <h3 className="font-serif text-lg font-bold mb-4">Specifications</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              {product.specs && Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-white/10 pb-2">
                  <dt className="text-gray-400 capitalize">{key.replace('_', ' ')}</dt>
                  <dd className="font-medium">{value as string}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 bg-gold-500 text-dark-900 py-4 px-8 rounded-sm font-bold text-lg hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" /> Add to Cart
            </button>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold-500" />
                <span>2 Year Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gold-500" />
                <span>Free Insured Shipping</span>
            </div>
             <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-gold-500" />
                <span>Authenticity Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};