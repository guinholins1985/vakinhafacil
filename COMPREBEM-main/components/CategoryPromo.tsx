import React from 'react';
import { CategoryPromoItem } from '../types';

interface CategoryPromoProps {
  promos: CategoryPromoItem[];
  title: string;
}

const CategoryPromo: React.FC<CategoryPromoProps> = ({ promos, title }) => {
  return (
    <div className="px-4 py-8">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {promos.map((promo) => (
          <a href="#" key={promo.id} className="group block rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative pt-[125%] bg-gray-100">
              <img 
                src={promo.imageUrl} 
                alt={promo.subtitle} 
                className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-center">
                <p className="text-xs font-semibold uppercase tracking-wider">{promo.title}</p>
                <h3 className="text-lg font-bold leading-tight">{promo.subtitle}</h3>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategoryPromo;