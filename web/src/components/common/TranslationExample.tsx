import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const TranslationExample: React.FC = () => {
  const { t } = useLanguage();
  const { currentLanguage, toggleLanguage } = useLanguageSwitcher();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Translation Example - {currentLanguage.toUpperCase()}
      </h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Basic Translation:</h3>
          <p>{t('common.loading')}</p>
        </div>
        
        <div>
          <h3 className="font-semibold">Nested Translation:</h3>
          <p>{t('search.placeholder')}</p>
        </div>
        
        <div>
          <h3 className="font-semibold">With Fallback:</h3>
          <p>{tWithFallback('products', 'title', 'Default Product Title')}</p>
        </div>
        
        <div>
          <h3 className="font-semibold">Check if Translation Exists:</h3>
          <p>
            {hasTranslation('common', 'loading') ? '✅ Exists' : '❌ Missing'}
          </p>
        </div>
        
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('common.language')}: {currentLanguage === 'is' ? 'English' : 'Íslenska'}
        </button>
      </div>
    </div>
  );
};

export default TranslationExample;