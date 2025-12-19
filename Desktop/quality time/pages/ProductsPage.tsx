import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import Card from '../components/Card';

interface ProductsPageProps {
  addToCart: (p: Product) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b18] text-white" dir="rtl">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-8">
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-[#c5a059] text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-3">Our Collection</h2>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">تشكيلة الساعات الفاخرة</h1>
          <div className="w-24 h-1 bg-[#c5a059] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 justify-items-center">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-[#0f172a] rounded-xl p-3 md:p-4 border border-white/10">
                <div className="aspect-square bg-gray-800 rounded-lg mb-3 md:mb-4" />
                <div className="space-y-2">
                  <div className="h-3 md:h-4 w-3/4 bg-gray-700 rounded" />
                  <div className="h-2 md:h-3 w-1/2 bg-gray-700 rounded" />
                </div>
              </div>
            ))
          ) : (
            products.map((product) => (
              <Card
                key={product.id}
                image={product.images?.[0] || 'https://via.placeholder.com/400x400'}
                title={product.name}
                price={Number(product.price)}
                onAddToCart={() => addToCart(product)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;