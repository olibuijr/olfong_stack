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

  if (!product.imageUrl || imageError) {
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

  return (
    <img
      src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://192.168.8.62:5000'}${product.imageUrl}`}
      alt={getProductName(currentLanguage, product)}
      className={className}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

ProductImage.propTypes = {
  product: PropTypes.object.isRequired,
  className: PropTypes.string,
  currentLanguage: PropTypes.string,
};

export default ProductImage;