import { useEffect, useState } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Upload,
  ExternalLink,
  Save,
  ChevronDown,
  Link as LinkIcon
} from 'lucide-react';
import MediaPicker from '../../components/admin/MediaPicker';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  setFeaturedBanner,
  removeFeaturedBanner
} from '../../store/slices/bannerSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchProducts } from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Banners = () => {
  const { t, isLoading: translationsLoading } = useLanguage();
  const dispatch = useDispatch();
  const { banners, isLoading, error } = useSelector((state) => state.banners);
  const { categories } = useSelector((state) => state.categories);
  const { products } = useSelector((state) => state.products);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleIs: '',
    description: '',
    descriptionIs: '',
    imageUrl: '',
    alt: '',
    link: '',
    sortOrder: 0,
    isFeatured: false,
    featuredOrder: null,
    // Hero banner fields
    isHero: false,
    backgroundType: 'gradient',
    gradientStartColor: '#374151',
    gradientEndColor: '#111827',
    gradientDirection: 'to-r',
    backgroundImageUrl: '',
    backgroundOpacity: 1.0,
    marqueeText: '',
    marqueeTextIs: '',
    marqueeSpeed: 50,
    marqueeCount: 3,
    heroLogoUrl: '',
    heroButtonText: '',
    heroButtonTextIs: '',
    heroButtonLink: '',
    heroSubtitle: '',
    heroSubtitleIs: '',
    textColor: '#ffffff',
    buttonBgColor: '#ffffff',
    buttonTextColor: '#1f2937',
    overlayOpacity: 0.0
  });

  useEffect(() => {
    dispatch(fetchBanners({ includeInactive: true }));
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLinkDropdown && !event.target.closest('.link-dropdown-container')) {
        setShowLinkDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLinkDropdown]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setEditingBanner(null);
        setFormData({
          title: '',
          titleIs: '',
          description: '',
          descriptionIs: '',
          imageUrl: '',
          alt: '',
          link: '',
          sortOrder: 0,
          isFeatured: false,
          featuredOrder: null,
          isHero: false,
          backgroundType: 'gradient',
          gradientStartColor: '#374151',
          gradientEndColor: '#111827',
          gradientDirection: 'to-r',
          backgroundImageUrl: '',
          backgroundOpacity: 1.0,
          marqueeText: '',
          marqueeTextIs: '',
          marqueeSpeed: 50,
          marqueeCount: 3,
          heroLogoUrl: '',
          heroButtonText: '',
          heroButtonTextIs: '',
          heroButtonLink: '',
          heroSubtitle: '',
          heroSubtitleIs: '',
          textColor: '#ffffff',
          buttonBgColor: '#ffffff',
          buttonTextColor: '#1f2937',
          overlayOpacity: 0.0
        });
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBanner) {
        await dispatch(updateBanner({ id: editingBanner.id, ...formData }));
      } else {
        await dispatch(createBanner(formData));
      }
      
      setIsModalOpen(false);
      setEditingBanner(null);
      setFormData({
        title: '',
        titleIs: '',
        description: '',
        descriptionIs: '',
        imageUrl: '',
        alt: '',
        link: '',
        sortOrder: 0
      });
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      titleIs: banner.titleIs || '',
      description: banner.description || '',
      descriptionIs: banner.descriptionIs || '',
      imageUrl: banner.imageUrl || '',
      alt: banner.alt || '',
      link: banner.link || '',
      sortOrder: banner.sortOrder || 0,
      isFeatured: banner.isFeatured || false,
      featuredOrder: banner.featuredOrder || null,
      // Hero banner fields
      isHero: banner.isHero || false,
      backgroundType: banner.backgroundType || 'gradient',
      gradientStartColor: banner.gradientStartColor || '#374151',
      gradientEndColor: banner.gradientEndColor || '#111827',
      gradientDirection: banner.gradientDirection || 'to-r',
      backgroundImageUrl: banner.backgroundImageUrl || '',
      backgroundOpacity: banner.backgroundOpacity !== undefined ? banner.backgroundOpacity : 1.0,
      marqueeText: banner.marqueeText || '',
      marqueeTextIs: banner.marqueeTextIs || '',
      marqueeSpeed: banner.marqueeSpeed || 50,
      marqueeCount: banner.marqueeCount || 3,
      heroLogoUrl: banner.heroLogoUrl || '',
      heroButtonText: banner.heroButtonText || '',
      heroButtonTextIs: banner.heroButtonTextIs || '',
      heroButtonLink: banner.heroButtonLink || '',
      heroSubtitle: banner.heroSubtitle || '',
      heroSubtitleIs: banner.heroSubtitleIs || '',
      textColor: banner.textColor || '#ffffff',
      buttonBgColor: banner.buttonBgColor || '#ffffff',
      buttonTextColor: banner.buttonTextColor || '#1f2937',
      overlayOpacity: banner.overlayOpacity !== undefined ? banner.overlayOpacity : 0.0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.banners.confirmDelete'))) {
      await dispatch(deleteBanner(id));
    }
  };

  const handleToggleStatus = async (id) => {
    await dispatch(toggleBannerStatus(id));
  };

  const handleToggleFeatured = async (banner) => {
    if (banner.isFeatured) {
      await dispatch(removeFeaturedBanner(banner.id));
    } else {
      // Find next available position
      const featuredBanners = banners.filter(b => b.isFeatured);
      const usedPositions = featuredBanners.map(b => b.featuredOrder).filter(Boolean);
      let nextPosition = 1;
      while (usedPositions.includes(nextPosition)) {
        nextPosition++;
      }
      await dispatch(setFeaturedBanner({ id: banner.id, featuredOrder: nextPosition }));
    }
  };
  const handleMediaSelect = (selectedMedia) => {
    if (selectedMedia && selectedMedia.url) {
      setFormData({ ...formData, imageUrl: selectedMedia.url });
    }
    setShowMediaPicker(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      titleIs: '',
      description: '',
      descriptionIs: '',
      imageUrl: '',
      alt: '',
      link: '',
      sortOrder: 0,
      isFeatured: false,
      featuredOrder: null,
      // Hero banner fields
      isHero: false,
      backgroundType: 'gradient',
      gradientStartColor: '#374151',
      gradientEndColor: '#111827',
      gradientDirection: 'to-r',
      backgroundImageUrl: '',
      backgroundOpacity: 1.0,
      marqueeText: '',
      marqueeTextIs: '',
      marqueeSpeed: 50,
      marqueeCount: 3,
      heroLogoUrl: '',
      heroButtonText: '',
      heroButtonTextIs: '',
      heroButtonLink: '',
      heroSubtitle: '',
      heroSubtitleIs: '',
      textColor: '#ffffff',
      buttonBgColor: '#ffffff',
      buttonTextColor: '#1f2937',
      overlayOpacity: 0.0
    });
  };

  if (isLoading || translationsLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          icon={ImageIcon}
          title={t('admin.banners.title')}
          description={t('admin.banners.subtitle')}
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('admin.banners.addBanner')}
            </button>
          }
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.alt || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                 {/* Status Badges */}
                 <div className="absolute top-2 right-2 flex gap-2">
                   {banner.isFeatured && (
                     <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                       {t('admin.banners.featured')} #{banner.featuredOrder}
                     </span>
                   )}
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                     banner.isActive
                       ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                       : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                   }`}>
                     {banner.isActive ? t('common.active') : t('common.inactive')}
                   </span>
                 </div>
              </div>

              {/* Banner Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {banner.titleIs || banner.title || t('admin.banners.untitled')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {banner.descriptionIs || banner.description || t('admin.banners.noDescription')}
                </p>
                
                {banner.link && (
                  <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mb-3">
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{banner.link}</span>
                  </div>
                )}

                 {/* Actions */}
                 <div className="flex items-center justify-between">
                   <div className="flex gap-2">
                     <button
                       onClick={() => handleEdit(banner)}
                       className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                       title={t('common.edit')}
                     >
                       <Edit className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => handleToggleFeatured(banner)}
                       className={`p-2 transition-colors ${
                         banner.isFeatured
                           ? 'text-blue-600 dark:text-blue-400'
                           : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                       }`}
                       title={banner.isFeatured ? t('admin.banners.removeFromFeatured') : t('admin.banners.addToFeatured')}
                     >
                       <Eye className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => handleToggleStatus(banner.id)}
                       className={`p-2 transition-colors ${
                         banner.isActive
                           ? 'text-gray-400 hover:text-orange-600 dark:hover:text-orange-400'
                           : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                       }`}
                       title={banner.isActive ? t('admin.banners.deactivate') : t('admin.banners.activate')}
                     >
                       {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                     <button
                       onClick={() => handleDelete(banner.id)}
                       className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                       title={t('common.delete')}
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    #{banner.sortOrder}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {banners.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('admin.banners.noBanners')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('admin.banners.noBannersDescription')}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              {t('admin.banners.addFirstBanner')}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingBanner ? t('admin.banners.editBanner') : t('admin.banners.addBanner')}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* English Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.banners.titleEn')}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('admin.banners.titlePlaceholder')}
                    />
                  </div>

                  {/* Icelandic Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.banners.titleIs')}
                    </label>
                    <input
                      type="text"
                      value={formData.titleIs}
                      onChange={(e) => setFormData({ ...formData, titleIs: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('admin.banners.titlePlaceholderIs')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* English Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.banners.descriptionEn')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('admin.banners.descriptionPlaceholder')}
                    />
                  </div>

                  {/* Icelandic Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.banners.descriptionIs')}
                    </label>
                    <textarea
                      value={formData.descriptionIs}
                      onChange={(e) => setFormData({ ...formData, descriptionIs: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('admin.banners.descriptionPlaceholderIs')}
                    />
                  </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Image URL */}
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('admin.banners.imageUrl')} *
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {t('admin.banners.imageHelpText')}
                      </p>
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder={t('adminPlaceholders.enterImageUrl')}
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{t('adminMedia.select')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => window.open('/admin/media?collection=BANNERS', '_blank')}
                            className="px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>{t('admin.banners.manageImages')}</span>
                          </button>
                        </div>
                     </div>
                   </div>

                  {/* Alt Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.banners.altText')}
                    </label>
                    <input
                      type="text"
                      value={formData.alt}
                      onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('admin.banners.altPlaceholder')}
                    />
                  </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Link */}
                   <div className="link-dropdown-container">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       {t('admin.banners.link')}
                     </label>
                     <div className="relative">
                       <input
                         type="url"
                         value={formData.link}
                         onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                         className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                         placeholder={t('adminPlaceholders.enterWebsiteUrl')}
                       />
                       <button
                         type="button"
                         onClick={() => setShowLinkDropdown(!showLinkDropdown)}
                         className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                         title={t('admin.banners.selectLink')}
                       >
                         <ChevronDown className="w-4 h-4" />
                       </button>
                     </div>

                     {/* Link Dropdown */}
                     {showLinkDropdown && (
                       <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                         {/* Categories */}
                         {categories.map((category) => (
                           <div key={category.id}>
                             <button
                               type="button"
                               onClick={() => {
                                 setFormData({ ...formData, link: `/products?category=${category.name.toUpperCase()}` });
                                 setShowLinkDropdown(false);
                               }}
                               className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                             >
                               <div className="flex items-center gap-2">
                                 <LinkIcon className="w-4 h-4" />
                                 <span>{category.nameIs || category.name} ({t('admin.banners.category')})</span>
                               </div>
                             </button>

                             {/* Subcategories */}
                             {category.subcategories && category.subcategories.map((subcategory) => (
                               <button
                                 key={subcategory.id}
                                 type="button"
                                 onClick={() => {
                                   setFormData({ ...formData, link: `/products?category=${category.name.toUpperCase()}&subcategory=${subcategory.name.toUpperCase()}` });
                                   setShowLinkDropdown(false);
                                 }}
                                 className="w-full px-6 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                               >
                                 <div className="flex items-center gap-2">
                                   <LinkIcon className="w-3 h-3" />
                                   <span>{subcategory.nameIs || subcategory.name} ({t('admin.banners.subcategory')})</span>
                                 </div>
                               </button>
                             ))}
                           </div>
                         ))}

                         {/* Products */}
                         {products.slice(0, 20).map((product) => (
                           <button
                             key={product.id}
                             type="button"
                             onClick={() => {
                               setFormData({ ...formData, link: `/products/${product.id}` });
                               setShowLinkDropdown(false);
                             }}
                             className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                           >
                             <div className="flex items-center gap-2">
                               <LinkIcon className="w-4 h-4" />
                               <span>{product.nameIs || product.name} ({t('admin.banners.product')})</span>
                             </div>
                           </button>
                         ))}
                       </div>
                     )}
                   </div>

                   {/* Sort Order */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       {t('admin.banners.sortOrder')}
                     </label>
                     <input
                       type="number"
                       value={formData.sortOrder}
                       onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                       min="0"
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Featured Banner */}
                   <div>
                     <label className="flex items-center space-x-2">
                       <input
                         type="checkbox"
                         checked={formData.isFeatured}
                         onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                         className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                       />
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                         {t('admin.banners.featuredBanner')}
                       </span>
                     </label>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                       {t('admin.banners.featuredBannerHelp')}
                     </p>
                   </div>

                   {/* Featured Order */}
                   {formData.isFeatured && (
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         {t('admin.banners.featuredOrder')}
                       </label>
                       <select
                         value={formData.featuredOrder || ''}
                         onChange={(e) => setFormData({ ...formData, featuredOrder: e.target.value ? parseInt(e.target.value) : null })}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                       >
                         <option value="">{t('admin.banners.selectPosition')}</option>
                         <option value="1">{t('admin.banners.position')} 1</option>
                         <option value="2">{t('admin.banners.position')} 2</option>
                         <option value="3">{t('admin.banners.position')} 3</option>
                       </select>
                     </div>
                   )}
                 </div>

                 {/* Hero Banner Section */}
                 <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                   <div className="mb-4">
                     <label className="flex items-center space-x-2">
                       <input
                         type="checkbox"
                         checked={formData.isHero}
                         onChange={(e) => setFormData({ ...formData, isHero: e.target.checked })}
                         className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                       />
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                         Hero Banner (Homepage)
                       </span>
                     </label>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                       Use this banner as the hero section on the homepage
                     </p>
                   </div>

                   {formData.isHero && (
                     <div className="space-y-4">
                       {/* Background Type */}
                       <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                           Background Type
                         </label>
                         <select
                           value={formData.backgroundType}
                           onChange={(e) => setFormData({ ...formData, backgroundType: e.target.value })}
                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                         >
                           <option value="gradient">Color Gradient</option>
                           <option value="image">Background Image</option>
                           <option value="marquee">Marquee Background</option>
                         </select>
                       </div>

                       {/* Gradient Settings */}
                       {formData.backgroundType === 'gradient' && (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Start Color
                             </label>
                             <input
                               type="color"
                               value={formData.gradientStartColor}
                               onChange={(e) => setFormData({ ...formData, gradientStartColor: e.target.value })}
                               className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                             />
                           </div>
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               End Color
                             </label>
                             <input
                               type="color"
                               value={formData.gradientEndColor}
                               onChange={(e) => setFormData({ ...formData, gradientEndColor: e.target.value })}
                               className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                             />
                           </div>
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                               Direction
                             </label>
                             <select
                               value={formData.gradientDirection}
                               onChange={(e) => setFormData({ ...formData, gradientDirection: e.target.value })}
                               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             >
                               <option value="to-r">Left to Right</option>
                               <option value="to-l">Right to Left</option>
                               <option value="to-t">Bottom to Top</option>
                               <option value="to-b">Top to Bottom</option>
                               <option value="to-br">Top-Left to Bottom-Right</option>
                               <option value="to-bl">Top-Right to Bottom-Left</option>
                               <option value="to-tr">Bottom-Left to Top-Right</option>
                               <option value="to-tl">Bottom-Right to Top-Left</option>
                             </select>
                           </div>
                         </div>
                       )}

                       {/* Background Image */}
                       {formData.backgroundType === 'image' && (
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Background Image URL
                           </label>
                           <input
                             type="url"
                             value={formData.backgroundImageUrl}
                             onChange={(e) => setFormData({ ...formData, backgroundImageUrl: e.target.value })}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             placeholder="Enter background image URL"
                           />
                         </div>
                       )}

                       {/* Marquee Settings */}
                       {formData.backgroundType === 'marquee' && (
                         <div className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                 Marquee Text (English)
                               </label>
                               <input
                                 type="text"
                                 value={formData.marqueeText}
                                 onChange={(e) => setFormData({ ...formData, marqueeText: e.target.value })}
                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                 placeholder="Enter scrolling text"
                               />
                             </div>
                             <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                 Marquee Text (Icelandic)
                               </label>
                               <input
                                 type="text"
                                 value={formData.marqueeTextIs}
                                 onChange={(e) => setFormData({ ...formData, marqueeTextIs: e.target.value })}
                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                 placeholder="Sláðu inn rúllunartext"
                               />
                             </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                 Speed (px/sec)
                               </label>
                               <input
                                 type="number"
                                 value={formData.marqueeSpeed}
                                 onChange={(e) => setFormData({ ...formData, marqueeSpeed: parseInt(e.target.value) || 50 })}
                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                 min="10"
                                 max="200"
                               />
                             </div>
                             <div>
                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                 Repeat Count
                               </label>
                               <input
                                 type="number"
                                 value={formData.marqueeCount}
                                 onChange={(e) => setFormData({ ...formData, marqueeCount: parseInt(e.target.value) || 3 })}
                                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                 min="1"
                                 max="10"
                               />
                             </div>
                           </div>
                         </div>
                       )}

                       {/* Hero Content */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Hero Subtitle (English)
                           </label>
                           <input
                             type="text"
                             value={formData.heroSubtitle}
                             onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             placeholder="Enter hero subtitle"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Hero Subtitle (Icelandic)
                           </label>
                           <input
                             type="text"
                             value={formData.heroSubtitleIs}
                             onChange={(e) => setFormData({ ...formData, heroSubtitleIs: e.target.value })}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             placeholder="Sláðu inn undirtitil"
                           />
                         </div>
                       </div>

                       {/* Logo URL */}
                       <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                           Hero Logo URL
                         </label>
                         <input
                           type="url"
                           value={formData.heroLogoUrl}
                           onChange={(e) => setFormData({ ...formData, heroLogoUrl: e.target.value })}
                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                           placeholder="Enter logo URL (leave empty for default)"
                         />
                       </div>

                       {/* Button Customization */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Button Text (EN)
                           </label>
                           <input
                             type="text"
                             value={formData.heroButtonText}
                             onChange={(e) => setFormData({ ...formData, heroButtonText: e.target.value })}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             placeholder="Button text"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Button Text (IS)
                           </label>
                           <input
                             type="text"
                             value={formData.heroButtonTextIs}
                             onChange={(e) => setFormData({ ...formData, heroButtonTextIs: e.target.value })}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             placeholder="Texti á hnapp"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Button Link
                           </label>
                           <input
                             type="text"
                             value={formData.heroButtonLink}
                             onChange={(e) => setFormData({ ...formData, heroButtonLink: e.target.value })}
                             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                             placeholder="/products"
                           />
                         </div>
                       </div>

                       {/* Color Customization */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Text Color
                           </label>
                           <input
                             type="color"
                             value={formData.textColor}
                             onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                             className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Button Background
                           </label>
                           <input
                             type="color"
                             value={formData.buttonBgColor}
                             onChange={(e) => setFormData({ ...formData, buttonBgColor: e.target.value })}
                             className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Button Text Color
                           </label>
                           <input
                             type="color"
                             value={formData.buttonTextColor}
                             onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                             className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                           />
                         </div>
                       </div>

                       {/* Overlay Opacity */}
                       <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                           Overlay Opacity ({formData.overlayOpacity})
                         </label>
                         <input
                           type="range"
                           min="0"
                           max="1"
                           step="0.1"
                           value={formData.overlayOpacity}
                           onChange={(e) => setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) })}
                           className="w-full"
                         />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                           Adds a dark overlay to improve text readability
                         </p>
                       </div>
                     </div>
                   )}
                 </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-outline"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingBanner ? t('common.update') : t('common.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        collection="BANNERS"
        multiple={false}
      />
    </AdminLayout>
  );
};

export default Banners;
