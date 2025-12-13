import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Loader2, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToCollection = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2574&auto=format&fit=crop" 
            alt="Luxury Watch Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-800/20 via-transparent to-dark-800"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="text-gold-500 tracking-[0.2em] uppercase font-bold text-sm mb-4 block animate-fade-in">
            Excellence in every second
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Timeless <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">Elegance</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            Discover a curated collection of the world's most prestigious timepieces. 
            Designed for those who value precision and prestige.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={scrollToCollection}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold-500 text-dark-900 px-8 py-4 rounded-sm font-bold tracking-wider hover:bg-gold-400 transition-all duration-300 cursor-pointer min-w-[200px]"
            >
              View Collection <ArrowRight className="w-4 h-4" />
            </button>
            
            <a 
              href="https://www.tiktok.com/@equality_time" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-dark-900/50 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-sm font-bold tracking-wider hover:bg-white/10 hover:border-white/40 transition-all duration-300 cursor-pointer min-w-[200px]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
              Follow on TikTok
            </a>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="font-serif text-3xl text-white font-bold">Latest Arrivals</h2>
            <div className="h-1 w-20 bg-gold-500 mt-2"></div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-lg border border-white/5">
            <p className="text-gray-400 text-lg">Our collection is being curated. Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};