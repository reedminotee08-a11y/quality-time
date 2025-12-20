import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Crown, Star } from 'lucide-react';
import Button from './Button';

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  oldPrice?: number;
  brand?: string;
  rating?: number;
  stock?: number;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  id, 
  image, 
  title, 
  price, 
  oldPrice,
  brand,
  rating = 0,
  stock = 0,
  onAddToCart 
}) => {
  const isLowStock = stock > 0 && stock <= 3;
  const isOutOfStock = stock === 0;
  const hasDiscount = oldPrice && oldPrice > price;
  const discountPercentage = hasDiscount ? Math.round(((oldPrice! - price) / oldPrice!) * 100) : 0;

  return (
    <div className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-white/5 hover:border-gold/20 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-1">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border border-red-400 shadow-lg">
            -{discountPercentage}%
          </div>
        </div>
      )}

      {/* Crown Icon for Luxury */}
      {!hasDiscount && (
        <div className="absolute top-3 left-3 z-10">
          <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
            <Crown size={16} className="text-gold" />
          </div>
        </div>
      )}

      {/* Low Stock Badge */}
      {isLowStock && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
            متوفر {stock} قطع
          </span>
        </div>
      )}

      {/* Out of Stock Overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center">
          <div className="text-center">
            <span className="text-red-400 font-bold text-lg">نفد المخزون</span>
          </div>
        </div>
      )}

      {/* Product Image */}
      <Link to={`/product/${id}`} className="block aspect-square overflow-hidden bg-neutral-800">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        {brand && (
          <p className="text-gold text-xs font-bold uppercase tracking-wider mb-1">
            {brand}
          </p>
        )}

        {/* Title */}
        <Link to={`/product/${id}`}>
          <h3 className="text-white font-bold text-base mb-2 line-clamp-2 hover:text-gold transition-colors">
            {title}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={`${i < rating ? 'text-gold fill-gold' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-gray-400 text-xs">({rating}.0)</span>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <p className="text-gold text-lg font-bold">
                  {price.toLocaleString()} دج
                </p>
                <p className="text-gray-500 text-sm line-through">
                  {oldPrice!.toLocaleString()} دج
                </p>
              </div>
            ) : (
              <p className="text-gold text-lg font-bold">
                {price.toLocaleString()} دج
              </p>
            )}
          </div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="p-2 rounded-full hover:scale-110 transition-transform"
          >
            <ShoppingCart size={16} />
          </Button>
        </div>
      </div>

      {/* Luxury Border Animation */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-gold via-platinum to-gold bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
    </div>
  );
};

export default ProductCard;