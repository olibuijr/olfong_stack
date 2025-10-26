import { useState } from 'react';
import PropTypes from 'prop-types';
import { Wine, Beer, Package } from 'lucide-react';
import { getProductName } from '../../utils/languageUtils';

const ProductImage = ({ product, className = "w-full h-64 object-contain", currentLanguage = 'is' }) => {
  const [imageError, setImageError] = useState(false);

  // Normalize category input which can be a string or an object { name, slug }
  const getCategoryName = (category) => {
    if (typeof category === 'string') return category;
    if (category && typeof category === 'object') {
      return category.name || category.slug || '';
    }
    return '';
  };

  // Get appropriate icon based on product category
  const getCategoryIcon = (category) => {
    const name = getCategoryName(category);
    switch (name?.toUpperCase()) {
      case 'WINE':
        return <Wine className="w-16 h-16 text-primary-300" />;
      case 'BEER':
        return <Beer className="w-16 h-16 text-primary-300" />;
      case 'NICOTINE':
        return <Package className="w-16 h-16 text-primary-300" />;
      default:
        return <Package className="w-16 h-16 text-primary-300" />;
    }
  };

  // Get gradient colors based on category
  const getCategoryGradient = (category) => {
    const name = getCategoryName(category);
    switch (name?.toUpperCase()) {
      case 'WINE':
        return 'from-red-50 to-red-100';
      case 'BEER':
        return 'from-amber-50 to-amber-100';
      case 'NICOTINE':
        return 'from-gray-50 to-gray-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  // Check if we have responsive image data from backend
  const getResponsiveImageData = () => {
    if (product.responsiveData) {
      return product.responsiveData;
    }
    // Fallback for old image URL format
    if (product.imageUrl) {
      return {
        src: product.imageUrl,
        alt: getProductName(currentLanguage, product),
        picture: {
          webp: { srcset: product.imageUrl },
          jpeg: { srcset: product.imageUrl },
          img: { src: product.imageUrl }
        },
        sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
      };
    }
    return null;
  };

  const responsiveData = getResponsiveImageData();

  if (!responsiveData || imageError) {
    return (
      <div className={`bg-gradient-to-br ${getCategoryGradient(product.category)} flex items-center justify-center relative ${className}`}>
        <div className="text-center">
          {getCategoryIcon(product.category)}
          <div className="mt-2">
            <span className="text-primary-400 text-sm font-medium">
              {getCategoryName(product.category)?.toLowerCase() || 'Product'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render responsive picture element with WebP and JPEG variants
  return (
    <picture>
      {responsiveData.picture?.webp?.srcset && (
        <source
          srcSet={responsiveData.picture.webp.srcset}
          type="image/webp"
          sizes={responsiveData.sizes}
        />
      )}
      {responsiveData.picture?.jpeg?.srcset && (
        <source
          srcSet={responsiveData.picture.jpeg.srcset}
          type="image/jpeg"
          sizes={responsiveData.sizes}
        />
      )}
      <img
        src={responsiveData.picture?.img?.src || responsiveData.src}
        alt={responsiveData.picture?.img?.alt || responsiveData.alt}
        className={className}
        onError={() => setImageError(true)}
        loading="lazy"
        sizes={responsiveData.sizes}
        srcSet={responsiveData.picture?.jpeg?.srcset || responsiveData.srcset}
      />
    </picture>
  );
};

ProductImage.propTypes = {
  product: PropTypes.object.isRequired,
  className: PropTypes.string,
  currentLanguage: PropTypes.string,
};

export default ProductImage;