import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="group relative glass-card rounded-lg overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold-500/10">
      <div className="aspect-[4/5] w-full overflow-hidden bg-gray-800 relative">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-full bg-gold-500 text-dark-900 py-3 px-4 rounded-sm font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gold-400"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>
      <Link to={`/product/${product.id}`} className="block p-4">
        <p className="text-xs text-gold-500 font-bold tracking-widest uppercase mb-1">{product.brand}</p>
        <h3 className="text-lg font-medium text-white group-hover:text-gold-500 transition-colors truncate">{product.name}</h3>
        <p className="mt-2 font-serif text-xl text-gray-200">{product.price.toLocaleString()} DA</p>
      </Link>
    </div>
  );
};