
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { Banner } from '../types';

interface HeroProps {
  banners: Banner[];
}

const Hero: React.FC<HeroProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!banners || banners.length === 0) {
    return null; // Don't render anything if there are no active banners
  }

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className="py-4">
      <div className="relative w-full h-[300px] bg-gray-200 group">
        <div className="w-full h-full">
          <img 
              key={currentBanner.id}
              src={currentBanner.imageUrl} 
              alt={currentBanner.altText || currentBanner.title} 
              className="w-full h-full object-cover" 
          />
          {/* Text Overlay */}
          {(currentBanner.title || currentBanner.subtitle || currentBanner.buttonText) && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/30"
              style={{ color: currentBanner.textColor || '#FFFFFF' }}
            >
              {currentBanner.title && <h2 className="text-4xl font-bold drop-shadow-md">{currentBanner.title}</h2>}
              {currentBanner.subtitle && <p className="text-lg mt-2 drop-shadow">{currentBanner.subtitle}</p>}
              {currentBanner.buttonText && (
                <a href={currentBanner.link} className="mt-4 bg-white text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors">
                  {currentBanner.buttonText}
                </a>
              )}
            </div>
          )}
        </div>
        
        {banners.length > 1 && (
            <>
                <button 
                    onClick={prevSlide} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    aria-label="Previous banner"
                >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                </button>
                <button 
                    onClick={nextSlide} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    aria-label="Next banner"
                >
                    <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default Hero;