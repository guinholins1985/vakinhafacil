
import React, { useRef } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ChevronRightIcon, ChevronLeftIcon } from './Icons';

interface ProductSectionProps {
  title: string;
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  showTitle?: boolean;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, products, onAddToCart, showTitle = true }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section>
      {showTitle && (
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-3xl font-extrabold text-gray-800">{title}</h2>
          <a href="#" className="border border-gray-300 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors">
            Mostrar mais
          </a>
        </div>
      )}
      <div className="relative group">
        <div ref={scrollContainerRef} className="flex space-x-6 overflow-x-auto pb-4 -mb-4 scrollbar-hide py-4 px-2 -mx-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 transform-gpu bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-100 z-10 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4" aria-label="Scroll left">
          <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 transform-gpu bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-100 z-10 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4" aria-label="Scroll right">
          <ChevronRightIcon className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </section>
  );
};

export default ProductSection;