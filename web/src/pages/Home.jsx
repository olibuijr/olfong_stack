import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Wine, Beer, Truck, Shield } from 'lucide-react';
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchBanners } from '../store/slices/bannerSlice';
import CategoryProducts from '../components/common/CategoryProducts';
import DiscountedProducts from '../components/common/DiscountedProducts';
import Banner from '../components/common/Banner';

const Home = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.categories);
  const { banners, isLoading: bannersLoading } = useSelector((state) => state.banners);

  // Fetch categories and banners on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBanners());
  }, [dispatch]);

  // Fallback banners if API fails or no banners are configured
  const fallbackBanners = [
    {
      imageUrl: '/898-1200-x-300-px-2.webp',
      alt: 'Ölföng Banner 1',
      title: t('home.banner.title1'),
      description: t('home.banner.description1')
    },
    {
      imageUrl: '/Allir-nikotin-pudar-a-890-768-x-300-px-4.webp',
      alt: 'Ölföng Banner 2',
      title: t('home.banner.title2'),
      description: t('home.banner.description2')
    },
    {
      imageUrl: '/Allir-nikotin-pudar-a-890-768-x-300-px-768-x-250-px-2.webp',
      alt: 'Ölföng Banner 3',
      title: t('home.banner.title3'),
      description: t('home.banner.description3')
    },
    {
      imageUrl: '/Allir-nikotin-pudar-a-890-768-x-300-px-768-x-250-px.webp',
      alt: 'Ölföng Banner 4',
      title: t('home.banner.title4'),
      description: t('home.banner.description4')
    }
  ];

  // Use API banners if available, otherwise fallback to hardcoded banners
  const displayBanners = banners.length > 0 ? banners.map(banner => ({
    imageUrl: banner.imageUrl,
    alt: banner.alt || t('home.banner.alt'),
    title: banner.titleIs || banner.title,
    description: banner.descriptionIs || banner.description,
    link: banner.link
  })) : fallbackBanners;

  // State to track used banners and selected banners
  const [usedBannerIndices, setUsedBannerIndices] = useState(new Set());
  const [selectedBanners, setSelectedBanners] = useState([]);

  // Effect to select banners once when component mounts or banners change
  useEffect(() => {
    if (displayBanners.length === 0) {
      setSelectedBanners([]);
      return;
    }

    // Select 3 random banners without duplicates
    const shuffled = [...displayBanners].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, displayBanners.length));
    setSelectedBanners(selected);
  }, [displayBanners.length]); // Only depend on length, not the entire array

  // Function to get a banner by index (for display)
  const getBannerByIndex = (index) => {
    return selectedBanners[index] || null;
  };

  const features = [
    {
      icon: <Wine className="w-8 h-8 text-primary-600" />,
      title: t('navigation.wine'),
      description: t('home.features.wineDescription'),
      link: '/products?category=WINE'
    },
    {
      icon: <Beer className="w-8 h-8 text-primary-600" />,
      title: t('navigation.beer'),
      description: t('home.features.beerDescription'),
      link: '/products?category=BEER'
    },
    {
      icon: <Truck className="w-8 h-8 text-primary-600" />,
      title: t('delivery.title'),
      description: t('home.features.deliveryDescription'),
      link: '/products'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: t('home.features.ageVerificationTitle'),
      description: t('home.features.ageVerificationDescription'),
      link: '/products'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/logo_black-web.webp" 
                alt="Ölföng Logo" 
                className="h-20 md:h-32 w-auto invert"
              />
            </div>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex justify-center">
              <Link
                to="/products"
                className="btn bg-white text-gray-800 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                {t('home.hero.startShopping')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Establish trust and value proposition early */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.why.title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.why.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="card p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Discounted Products Section - Special offers prominently displayed */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.discounted.title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.discounted.subtitle')}
            </p>
          </div>
          <DiscountedProducts limit={6} />
        </div>
      </section>

      {/* Strategic Banner 1 - Break between offers and main content */}
      {getBannerByIndex(0) && (
        <section className="py-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group">
              <img
                src={getBannerByIndex(0).imageUrl}
                alt={getBannerByIndex(0).alt}
                className="w-full h-64 md:h-80 object-cover"
              />
              {(getBannerByIndex(0).title || getBannerByIndex(0).description) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 text-white">
                    {getBannerByIndex(0).title && (
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {getBannerByIndex(0).title}
                      </h3>
                    )}
                    {getBannerByIndex(0).description && (
                      <p className="text-lg opacity-90">
                        {getBannerByIndex(0).description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section - Main product content */}
      {!categoriesLoading && categories.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.categories.title')}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('home.categories.subtitle')}
              </p>
            </div>
            <div className="space-y-8">
              {categories.map((category) => (
                <CategoryProducts key={category.id} category={category} limit={6} />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* Strategic Banner 2 - Final call to action */}
      {getBannerByIndex(1) && (
        <section className="py-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group">
              <img
                src={getBannerByIndex(1).imageUrl}
                alt={getBannerByIndex(1).alt}
                className="w-full h-64 md:h-80 object-cover"
              />
              {(getBannerByIndex(1).title || getBannerByIndex(1).description) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 text-white">
                    {getBannerByIndex(1).title && (
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {getBannerByIndex(1).title}
                      </h3>
                    )}
                    {getBannerByIndex(1).description && (
                      <p className="text-lg opacity-90">
                        {getBannerByIndex(1).description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Customer Testimonials Section - Build trust on desktop */}
      <section className="py-16 bg-white dark:bg-gray-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.testimonials.title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "{t('home.testimonials.review1')}"
              </p>
              <div className="font-semibold text-gray-900 dark:text-white">Jón Sigurðsson</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Reykjavík</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "{t('home.testimonials.review2')}"
              </p>
              <div className="font-semibold text-gray-900 dark:text-white">Anna Þórðardóttir</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Akureyri</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "{t('home.testimonials.review3')}"
              </p>
              <div className="font-semibold text-gray-900 dark:text-white">Guðmundur Ólafsson</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Selfoss</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;


