import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import ProductImage from './ProductImage';
import LoadingSpinner from './LoadingSpinner';
import { getProductName, getProductDescription } from '../../utils/languageUtils';

const CategoryProducts = ({ category, limit = 6 }) => {
  const { t, i18n } = useTranslation();
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/products?category=${category.name}&limit=${limit}`);
        setCategoryProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching category products:', error);
        setCategoryProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category.name, limit]);

  const scrollLeft = (element) => {
    element.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = (element) => {
    element.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (isLoading && categoryProducts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {category.nameIs || category.name}
          </h3>
        </div>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="medium" />
        </div>
      </div>
    );
  }

  if (categoryProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {category.nameIs || category.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {categoryProducts.length} {t('common.itemsLabel')}
          </p>
        </div>
        <Link
          to={`/products?category=${category.name}`}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
        >
          {t('common.viewAll')}
        </Link>
      </div>

      <div className="relative">
        <div 
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categoryProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-64">
              <div className="group h-full">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                  <Link to={`/products/${product.id}`} className="block flex-shrink-0">
                    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-900">
                      <ProductImage 
                        product={product}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        currentLanguage={i18n.language}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-lg ${
                          product.stock > 0 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {product.stock > 0 ? t('products.inStock') : t('products.outOfStock')}
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-3 flex-1">
                      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2 leading-tight">
                        {getProductName(i18n.language, product)}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
                        {getProductDescription(i18n.language, product)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {product.price.toLocaleString()} {t('common.currency')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll buttons */}
        <button
          onClick={(e) => scrollLeft(e.target.closest('.relative').querySelector('.overflow-x-auto'))}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:shadow-xl transition-shadow duration-200 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={(e) => scrollRight(e.target.closest('.relative').querySelector('.overflow-x-auto'))}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:shadow-xl transition-shadow duration-200 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default CategoryProducts;
