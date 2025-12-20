import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, ChevronRight, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { supabase } from '../supabaseClient';
import { Product } from '../types';

interface ProductsPageProps {
  addToCart: (p: Product) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Update document title and meta tags
  React.useEffect(() => {
    document.title = 'المنتجات | Quality Time DZ - ساعات فاخرة جزائرية';
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'استكشف مجموعتنا الفاخرة من الساعات الرجالية والنسائية في Quality Time DZ. ساعات بتصميم أصيل وجودة عالمية بأسعار اقتصادية.');
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'ساعات, منتجات, ساعات فاخرة, ساعات رجالية, ساعات نسائية, تسوق, جودة, luxury watches, quality time dz');
    
    // Update Open Graph meta tags
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:title', 'المنتجات | Quality Time DZ - ساعات فاخرة جزائرية');
    updateMetaTag('og:description', 'استكشف مجموعتنا الفاخرة من الساعات الرجالية والنسائية في Quality Time DZ.');
    updateMetaTag('og:image', 'https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png');
    
    // Update Twitter meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'المنتجات | Quality Time DZ');
    updateMetaTag('twitter:description', 'استكشف مجموعتنا الفاخرة من الساعات');
    updateMetaTag('twitter:image', 'https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png');
    
    // Add structured data for product collection
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "مجموعة الساعات الفاخرة - Quality Time DZ",
      "description": "استكشف مجموعتنا الفاخرة من الساعات الرجالية والنسائية",
      "url": "https://qualitytime-dz.com/#/products",
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": products.length,
        "itemListElement": products.map((product, index) => ({
          "@type": "Product",
          "position": index + 1,
          "name": product.name,
          "description": product.description,
          "image": product.images?.[0],
          "brand": {
            "@type": "Brand",
            "name": "Quality Time DZ"
          },
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "DZD",
            "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }))
      }
    };
    
    // Add structured data script
    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script') as HTMLScriptElement;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, [products]);
  
  const updateMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) || 
               document.querySelector(`meta[name="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      if (property.startsWith('og:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

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

      if (error) {
        throw new Error(error.message || 'Failed to fetch products');
      }
      setProducts(data || []);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      // In a real application, you might want to show an error message to the user
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
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.images?.[0] || 'https://via.placeholder.com/400x400'}
                title={product.name}
                price={Number(product.price)}
                brand={product.brand}
                stock={product.stock_quantity}
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