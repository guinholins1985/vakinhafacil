
import React from 'react';
import { Product } from '../types';
import { StarIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="w-52 flex-shrink-0 bg-white rounded-xl border border-transparent hover:border-[var(--color-border)] overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      <a href={`#/produto/${product.id}`} className="block">
        <div className="h-48 bg-gray-50 flex items-center justify-center overflow-hidden p-2 rounded-t-xl">
          <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
        </div>
      </a>
      <div className="p-4 flex flex-col flex-grow">
        <a href={`#/produto/${product.id}`} className="block">
          <h3 className="text-sm font-semibold text-gray-800 truncate-2-lines h-10 group-hover:text-[var(--color-primary)] transition-colors">{product.name}</h3>
        </a>
         <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4 text-yellow-400" />)}
        </div>
        <div className="mt-2 flex-grow">
          {product.originalPrice && <p className="text-xs text-gray-400 line-through">R$ {product.originalPrice.toFixed(2)}</p>}
          <p className="text-2xl font-extrabold text-gray-900">R$ {product.price.toFixed(2)}</p>
        </div>
        <div className="mt-auto pt-3">
          <button onClick={() => onAddToCart(product, 1)} className="w-full bg-[var(--color-secondary)] text-white font-bold text-sm py-3 rounded-lg hover:opacity-90 transition-opacity">
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

// Add this to your main CSS or style tag if you don't have a utility for it.
const style = document.createElement('style');
style.innerHTML = `
  .truncate-2-lines {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;
document.head.appendChild(style);


export default ProductCard;