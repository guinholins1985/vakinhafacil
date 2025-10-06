
import React from 'react';
import { Brand } from '../types';

interface BrandLogosProps {
    brands: Brand[];
}

const BrandLogos: React.FC<BrandLogosProps> = ({ brands }) => {
  return (
    <div className="px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white h-32 flex items-center justify-center p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <img src={brand.logoUrl} alt={brand.name} className="max-h-12 w-auto object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandLogos;