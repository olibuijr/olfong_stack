import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import useAdmin from '../hooks/useAdmin';
import { Link } from 'react-router-dom';
import { Wine, Beer, Truck, Shield } from 'lucide-react';
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchBanners, fetchFeaturedBanners, fetchHeroBanner, setFeaturedBanner, removeFeaturedBanner } from '../store/slices/bannerSlice';
import { fetchProducts } from '../store/slices/productSlice';
import CategoryProducts from '../components/common/CategoryProducts';
import DiscountedProducts from '../components/common/DiscountedProducts';
import Marquee from '../components/common/Marquee';


const Home = () => {
  const { t, language } = useLanguage();
  const dispatch = useDispatch();
  const isAdmin = useAdmin();
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.categories);
  const { banners, featuredBanners, heroBanner } = useSelector((state) => state.banners);
  const { products } = useSelector((state) => state.products);

  // Fetch categories, featured banners, hero banner, and products on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFeaturedBanners());
    dispatch(fetchHeroBanner());
    if (isAdmin) {
      dispatch(fetchBanners({ includeInactive: true }));
    }
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch, isAdmin]);

  // Use featured banners from database only
  const displayBanners = useMemo(() => {
    return featuredBanners.map(banner => ({
      id: banner.id,
      imageUrl: banner.imageUrl,
      responsiveData: banner.responsiveData,
      alt: banner.alt || 'Ölföng Banner',
      title: banner.titleIs || banner.title,
      description: banner.descriptionIs || banner.description,
      link: banner.link,
      featuredOrder: banner.featuredOrder
    }));
  }, [featuredBanners]);

  // Check if there are any discounted products
  const hasDiscountedProducts = products.some(product =>
    product.discountPercentage && product.discountPercentage > 0
  );

  // State to track selected banners (now using featured banners directly)
  const [selectedBanners, setSelectedBanners] = useState([]);

  // Effect to set selected banners from featured banners
  useEffect(() => {
    if (displayBanners.length === 0) {
      setSelectedBanners([]);
      return;
    }

    // Sort by featured order and take up to 3
    const sorted = [...displayBanners].sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
    const selected = sorted.slice(0, Math.min(3, displayBanners.length));
    setSelectedBanners(selected);
  }, [displayBanners]);

  // Function to get a banner by index (for display)
  const getBannerByIndex = (index) => {
    return selectedBanners[index] || null;
  };

  // Admin function to switch banner
  const handleBannerSwitch = async (position, newBannerId) => {
    if (!isAdmin) return;

    try {
      const currentBanner = selectedBanners[position];
      if (currentBanner && currentBanner.id) {
        // Remove current banner from featured
        await dispatch(removeFeaturedBanner(currentBanner.id));
      }

      if (newBannerId) {
        // Set new banner as featured at this position
        await dispatch(setFeaturedBanner({ id: newBannerId, featuredOrder: position + 1 }));
      }

      // Refresh featured banners
      dispatch(fetchFeaturedBanners());
    } catch (error) {
      console.error('Error switching banner:', error);
    }
  };

  const features = useMemo(() => [
    {
      icon: <Wine className="w-8 h-8 text-primary-600" />,
      title: t('home.features.wineTitle'),
      description: t('home.features.wineDescription'),
      link: '/products?category=WINE'
    },
    {
      icon: <Beer className="w-8 h-8 text-primary-600" />,
      title: t('home.features.beerTitle'),
      description: t('home.features.beerDescription'),
      link: '/products?category=BEER'
    },
    {
      icon: <Truck className="w-8 h-8 text-primary-600" />,
      title: t('home.features.deliveryTitle'),
      description: t('home.features.deliveryDescription'),
      link: '/products'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: t('home.features.ageVerificationTitle'),
      description: t('home.features.ageVerificationDescription'),
      link: '/products'
    }
  ], [t]); // Keep t as dependency but fix the infinite re-render issue differently

  // Hero banner content with fallback
  const heroContent = useMemo(() => {
    if (heroBanner) {
      return {
        backgroundType: heroBanner.backgroundType || 'gradient',
        gradientStartColor: heroBanner.gradientStartColor || '#374151',
        gradientEndColor: heroBanner.gradientEndColor || '#111827',
        gradientDirection: heroBanner.gradientDirection || 'to-r',
        backgroundImageUrl: heroBanner.backgroundImageUrl,
        backgroundOpacity: heroBanner.backgroundOpacity !== undefined ? heroBanner.backgroundOpacity : 1.0,
        marqueeText: language === 'is' ? (heroBanner.marqueeTextIs || heroBanner.marqueeText) : heroBanner.marqueeText,
        marqueeSpeed: heroBanner.marqueeSpeed || 50,
        marqueeCount: heroBanner.marqueeCount || 3,
        logoUrl: heroBanner.heroLogoUrl || '/logo_black-web.webp',
        subtitle: language === 'is' ? (heroBanner.heroSubtitleIs || heroBanner.heroSubtitle || t('home.hero.subtitle')) : (heroBanner.heroSubtitle || t('home.hero.subtitle')),
        buttonText: language === 'is' ? (heroBanner.heroButtonTextIs || heroBanner.heroButtonText || t('home.hero.startShopping')) : (heroBanner.heroButtonText || t('home.hero.startShopping')),
        buttonLink: heroBanner.heroButtonLink || '/products',
        textColor: heroBanner.textColor || '#ffffff',
        buttonBgColor: heroBanner.buttonBgColor || '#ffffff',
        buttonTextColor: heroBanner.buttonTextColor || '#1f2937',
        overlayOpacity: heroBanner.overlayOpacity !== undefined ? heroBanner.overlayOpacity : 0.0,
      };
    }
    // Fallback defaults
    return {
      backgroundType: 'gradient',
      gradientStartColor: '#374151',
      gradientEndColor: '#111827',
      gradientDirection: 'to-r',
      backgroundImageUrl: null,
      backgroundOpacity: 1.0,
      marqueeText: null,
      marqueeSpeed: 50,
      marqueeCount: 3,
      logoUrl: '/logo_black-web.webp',
      subtitle: t('home.hero.subtitle'),
      buttonText: t('home.hero.startShopping'),
      buttonLink: '/products',
      textColor: '#ffffff',
      buttonBgColor: '#ffffff',
      buttonTextColor: '#1f2937',
      overlayOpacity: 0.0,
    };
  }, [heroBanner, language, t]);

  // Generate background style based on hero banner config
  const getBackgroundStyle = () => {
    const { backgroundType, gradientStartColor, gradientEndColor, gradientDirection, backgroundImageUrl, backgroundOpacity } = heroContent;

    if (backgroundType === 'image' && backgroundImageUrl) {
      return {
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: backgroundOpacity,
      };
    } else if (backgroundType === 'gradient') {
      const directionMap = {
        'to-r': 'to right',
        'to-l': 'to left',
        'to-t': 'to top',
        'to-b': 'to bottom',
        'to-br': 'to bottom right',
        'to-bl': 'to bottom left',
        'to-tr': 'to top right',
        'to-tl': 'to top left',
      };
      return {
        background: `linear-gradient(${directionMap[gradientDirection] || 'to right'}, ${gradientStartColor}, ${gradientEndColor})`,
        opacity: backgroundOpacity,
      };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={getBackgroundStyle()}
        />

        {/* Marquee Background */}
        {heroContent.backgroundType === 'marquee' && heroContent.marqueeText && (
          <div
            className="absolute inset-0 flex flex-col justify-center"
            style={{
              background: `linear-gradient(to right, ${heroContent.gradientStartColor}, ${heroContent.gradientEndColor})`,
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <Marquee
                key={i}
                text={heroContent.marqueeText}
                speed={heroContent.marqueeSpeed}
                count={heroContent.marqueeCount}
                className="text-6xl md:text-8xl font-bold opacity-5"
                style={{ color: heroContent.textColor }}
              />
            ))}
          </div>
        )}

        {/* Dark Overlay (optional) */}
        {heroContent.overlayOpacity > 0 && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: heroContent.overlayOpacity }}
          />
        )}

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img
                src={heroContent.logoUrl}
                alt={t('home.olfongLogoAlt')}
                className="h-20 md:h-32 w-auto"
                style={{
                  filter: heroContent.logoUrl === '/logo_black-web.webp' ? 'invert(1)' : 'none',
                }}
              />
            </div>
            <p
              className="text-xl md:text-2xl mb-8"
              style={{ color: heroContent.textColor }}
            >
              {heroContent.subtitle}
            </p>
            <div className="flex justify-center">
              <Link
                to={heroContent.buttonLink}
                className="btn px-8 py-3 text-lg transition-colors duration-200"
                style={{
                  backgroundColor: heroContent.buttonBgColor,
                  color: heroContent.buttonTextColor,
                }}
              >
                {heroContent.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </section>

       {/* Features Section - Establish trust and value proposition early */}
       <section className="py-16 bg-gray-50 dark:bg-gray-900">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.why.title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.why.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
         </div>
       </section>

       {/* Discounted Products Section - Only show if there are discounted products */}
      {hasDiscountedProducts && (
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
      )}

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

               {/* Admin Banner Switcher */}
               {isAdmin && (
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                   <select
                     className="bg-black/80 text-white text-sm px-3 py-1 rounded border border-white/20"
                     value={getBannerByIndex(0)?.id || ''}
                     onChange={(e) => handleBannerSwitch(0, e.target.value || null)}
                   >
                     <option value="">Select Banner</option>
                     {banners.filter(b => b.isActive).map(banner => (
                       <option key={banner.id} value={banner.id}>
                         {banner.titleIs || banner.title || `Banner ${banner.id}`}
                       </option>
                     ))}
                   </select>
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

               {/* Admin Banner Switcher */}
               {isAdmin && (
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                   <select
                     className="bg-black/80 text-white text-sm px-3 py-1 rounded border border-white/20"
                     value={getBannerByIndex(1)?.id || ''}
                     onChange={(e) => handleBannerSwitch(1, e.target.value || null)}
                   >
                     <option value="">Select Banner</option>
                     {banners.filter(b => b.isActive).map(banner => (
                       <option key={banner.id} value={banner.id}>
                         {banner.titleIs || banner.title || `Banner ${banner.id}`}
                       </option>
                     ))}
                   </select>
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
                &quot;{t('home.testimonials.review1')}&quot;
              </p>
              <div className="font-semibold text-gray-900 dark:text-white">{t('home.testimonials.review1Author')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('home.testimonials.review1Location')}</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                &quot;{t('home.testimonials.review2')}&quot;
              </p>
              <div className="font-semibold text-gray-900 dark:text-white">{t('home.testimonials.review2Author')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('home.testimonials.review2Location')}</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                &quot;{t('home.testimonials.review3')}&quot;
              </p>
              <div className="font-semibold text-gray-900 dark:text-white">{t('home.testimonials.review3Author')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('home.testimonials.review3Location')}</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;


