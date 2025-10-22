import { useLanguage } from "../../contexts/LanguageContext";
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/logo_black-web.webp" 
                alt="Ölföng Logo" 
                className="h-16 w-auto dark:invert"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              {t('footer', 'description')}
            </p>
            <div className="flex space-x-4">
              <span className="text-gray-600 dark:text-gray-300">📞 +354 555 1234</span>
              <span className="text-gray-600 dark:text-gray-300">✉️ info@olfong.is</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('footer', 'quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation', 'products')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=WINE" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation', 'wine')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=BEER" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation', 'beer')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=SPIRITS" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation', 'spirits')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=NON_ALCOHOLIC" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation', 'non_alcoholic')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('footer', 'customerService')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {t('navigation', 'orders')}
                </Link>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-300">{t('footer', 'openingHoursLabel')}</span>
              </li>
              <li className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{t('footer', 'openingHoursValue')}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">© 2025 Ölföng. {t('footer', 'rightsReserved')}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{t('footer', 'ageLimitNotice')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
