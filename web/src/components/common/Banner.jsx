import { useState, useEffect } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const Banner = ({ banners = [], autoPlay = true, interval = 5000 }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, banners.length]);

  if (!isVisible || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const closeBanner = () => {
    setIsVisible(false);
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group">
      {/* Close button */}
      <button
        onClick={closeBanner}
        className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label={t('common.close')}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Banner Image */}
      <div className="relative">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.alt || t('home.banner.alt')}
          className="w-full h-64 md:h-80 object-cover"
        />
        
        {/* Overlay with text if provided */}
        {(currentBanner.title || currentBanner.description) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
            <div className="p-6 text-white">
              {currentBanner.title && (
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {currentBanner.title}
                </h3>
              )}
              {currentBanner.description && (
                <p className="text-lg opacity-90">
                  {currentBanner.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label={t('common.previous')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label={t('common.next')}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`${t('common.goToSlide')} ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;
