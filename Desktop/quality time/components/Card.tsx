import React, { memo } from "react";

interface CardProps {
  image: string;
  title: string;
  price: number;
  onAddToCart: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = memo(({
  image,
  title,
  price,
  onAddToCart,
  className = "",
  style
}) => {
  return (
    <div
      className={`relative bg-[#0f172a] rounded-xl overflow-hidden border border-[#d4af37]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-3 md:p-4 ${className}`}
      style={style}
    >
      {/* Image */}
      <div className="w-full h-36 sm:h-40 md:h-48 rounded-lg overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Title and Price */}
      <div className="mt-2 md:mt-3 text-center">
        <h3 className="text-white text-sm md:text-base font-semibold line-clamp-2">
          {title}
        </h3>

        <p className="mt-1 text-sm md:text-lg font-bold text-[#d4af37]">
          {price.toLocaleString()}{" "}
          <span className="text-xs md:text-sm font-normal text-gray-400">
            دج
          </span>
        </p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={onAddToCart}
        className="mt-2 md:mt-3 w-full bg-[#d4af37] text-white py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-[#b8941f] text-sm md:text-base"
      >
        إضافة للسلة
      </button>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
