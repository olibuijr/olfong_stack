import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  refreshTranslations: () => Promise<void>;
  availableLanguages: string[];
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Load saved language from localStorage or default to 'is'
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    const saved = localStorage.getItem('preferred_language');
    return saved === 'en' ? 'en' : 'is'; // Default to IS if not explicitly EN
  });

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const availableLanguages = ['is', 'en'];

  // Simple translation function with fallback
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key];

    if (!translation) {
      // Log missing translation in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation not found for key: ${key} in language: ${currentLanguage}`);
      }
      // Return the key itself as a fallback (better than showing nothing)
      return key;
    }

    // Replace parameters in the translation string
    if (params) {
      Object.keys(params).forEach(paramKey => {
        const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
        translation = translation.replace(regex, String(params[paramKey]));
      });
    }

    return translation;
  }, [translations, currentLanguage]);

  // Load translations from API based on current language
  const loadTranslations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/translations?locale=${currentLanguage}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Transform flat array of { key, value } into a key-value object
        const transformedTranslations = data.data.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
          acc[item.key] = item.value;
          return acc;
        }, {});
        setTranslations(transformedTranslations);
      } else {
        console.error('Failed to load translations: Invalid response format', data);

        // Load fallback translations if API fails
        loadFallbackTranslations();
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Load fallback translations on error
      loadFallbackTranslations();
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Fallback translations for critical UI elements
  const loadFallbackTranslations = () => {
    const fallbacks = {
      is: {
        'nav.home': 'Heim',
        'nav.products': 'Vörur',
        'nav.cart': 'Karfa',
        'nav.orders': 'Pantanir',
        'nav.profile': 'Prófíll',
        'nav.admin': 'Stjórnborð',
        'nav.login': 'Innskráning',
        'nav.logout': 'Útskráning',
        'common.loading': 'Hleður...',
        'common.error': 'Villa',
        'common.success': 'Tókst',
        'common.save': 'Vista',
        'common.cancel': 'Hætta við',
        'common.delete': 'Eyða',
        'common.edit': 'Breyta',
        'common.add': 'Bæta við',
        'common.search': 'Leita',
        'common.filter': 'Sía',
        'common.sort': 'Raða',
        'common.yes': 'Já',
        'common.no': 'Nei',
      },
      en: {
        'nav.home': 'Home',
        'nav.products': 'Products',
        'nav.cart': 'Cart',
        'nav.orders': 'Orders',
        'nav.profile': 'Profile',
        'nav.admin': 'Admin',
        'nav.login': 'Login',
        'nav.logout': 'Logout',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.sort': 'Sort',
        'common.yes': 'Yes',
        'common.no': 'No',
      }
    };

    setTranslations(fallbacks[currentLanguage as keyof typeof fallbacks] || fallbacks.is);
  };

  // Initialize translations on mount and when language changes
  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  // Set language and persist to localStorage
  const setCurrentLanguage = useCallback((lang: string) => {
    if (availableLanguages.includes(lang)) {
      setCurrentLanguageState(lang);
      localStorage.setItem('preferred_language', lang);
    } else {
      console.error(`Invalid language: ${lang}. Available languages:`, availableLanguages);
    }
  }, [availableLanguages]);

  // Refresh translations (useful after admin updates)
  const refreshTranslations = useCallback(async () => {
    await loadTranslations();
  }, [loadTranslations]);

  const value = {
    currentLanguage,
    setCurrentLanguage,
    t,
    isLoading,
    refreshTranslations,
    availableLanguages,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};