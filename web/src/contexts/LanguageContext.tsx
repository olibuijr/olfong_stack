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
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.8.62:5000/api';
      const response = await fetch(`${API_BASE_URL}/translations?locale=${currentLanguage}`);
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
        'common.close': 'Loka',
        'common.sending': 'Sendir...',
        'common.unknown': 'Óþekkt',
        'adminPage.update': 'Uppfæra',
        'adminPage.updateOrder': 'Uppfæra pöntun',
        'adminPage.newStatus': 'Ný staða',
        'adminPage.assign': 'Úthluta',
        'adminPage.assignDeliveryPerson': 'Úthluta afhendingaraðila',
        'adminPage.deliveryPerson': 'Afhendingaraðili',
        'receipts.print': 'Prenta',
        'receipts.downloadPdf': 'Sækja PDF',
        'receipts.emailReceipt': 'Senda kvittun í tölvupósti',
        'receipts.emailSent': 'Tölvupóstur sendur',
        'receipts.emailSentSuccess': 'Kvittun send',
        'receipts.emailSendError': 'Villa við að senda tölvupóst',
        'receipts.noEmailAddress': 'Enginn tölvupóstur skráður',
        'receipts.pdfDownloadError': 'Villa við að sækja PDF',
        'receipts.receipt': 'Kvittun',
        'receipts.receiptForOrder': 'Kvittun fyrir pöntun',
        'receipts.settingsNotFound': 'Stillingar fundust ekki',
        'receipts.viewReceipt': 'Skoða kvittun',
        'receipts.configureInSettings': 'Vinsamlegast stilltu kvittanastillingar til að birta kvittunina þína',
        'adminMenu.sales': 'Sölur',
        'adminMenu.orders': 'Pantanir',
        'adminMenu.pointOfSale': 'Sölustaður',
        'adminMenu.deliveries': 'Afhendingar',
        'adminMenu.catalog': 'Vörulisti',
        'adminMenu.products': 'Vörur',
        'adminMenu.categories': 'Flokkar',
        'adminMenu.media': 'Myndefni',
        'adminMenu.analytics': 'Greiningar',
        'adminMenu.analyticsLink': 'Greiningar',
        'adminMenu.customers': 'Viðskiptavinir',
        'adminMenu.reports': 'Skýrslur',
        'adminMenu.content': 'Innihald',
        'adminMenu.banners': 'Borðar',
        'adminMenu.messages': 'Skilaboð',
        'adminMenu.notifications': 'Tilkynningar',
        'adminMenu.settingsSection': 'Stillingar',
        'adminMenu.general': 'Almennt',
        'adminMenu.payment': 'Greiðslur',
        'adminMenu.receipts': 'Kvittanir',
        'adminMenu.system': 'Kerfi',
        'adminMenu.translations': 'Þýðingar',
        'adminMenu.demoData': 'Sýnisgögn',
        'adminMenu.dashboard': 'Mælaborð',
        'adminMenu.manageBusinessSettings': 'Hafðu umsjón með fyrirtækinu og stillingum',
        'adminMenu.helpText': 'Vantar þig hjálp? Kíktu í',
        'adminMenu.supportCenter': 'þjónustuverið',
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
        'common.close': 'Close',
        'common.sending': 'Sending...',
        'common.unknown': 'Unknown',
        'adminPage.update': 'Update',
        'adminPage.updateOrder': 'Update Order',
        'adminPage.newStatus': 'New Status',
        'adminPage.assign': 'Assign',
        'adminPage.assignDeliveryPerson': 'Assign Delivery Person',
        'adminPage.deliveryPerson': 'Delivery Person',
        'receipts.print': 'Print',
        'receipts.downloadPdf': 'Download PDF',
        'receipts.emailReceipt': 'Email Receipt',
        'receipts.emailSent': 'Email Sent',
        'receipts.emailSentSuccess': 'Receipt sent successfully',
        'receipts.emailSendError': 'Error sending email',
        'receipts.noEmailAddress': 'No email address on file',
        'receipts.pdfDownloadError': 'Error downloading PDF',
        'receipts.receipt': 'Receipt',
        'receipts.receiptForOrder': 'Receipt for Order',
        'receipts.settingsNotFound': 'Settings Not Found',
        'receipts.viewReceipt': 'View Receipt',
        'receipts.configureInSettings': 'Please configure receipt settings to display your receipt',
        'adminMenu.sales': 'Sales',
        'adminMenu.orders': 'Orders',
        'adminMenu.pointOfSale': 'Point of Sale',
        'adminMenu.deliveries': 'Deliveries',
        'adminMenu.catalog': 'Catalog',
        'adminMenu.products': 'Products',
        'adminMenu.categories': 'Categories',
        'adminMenu.media': 'Media',
        'adminMenu.analytics': 'Analytics',
        'adminMenu.analyticsLink': 'Analytics',
        'adminMenu.customers': 'Customers',
        'adminMenu.reports': 'Reports',
        'adminMenu.content': 'Content',
        'adminMenu.banners': 'Banners',
        'adminMenu.messages': 'Messages',
        'adminMenu.notifications': 'Notifications',
        'adminMenu.settingsSection': 'Settings',
        'adminMenu.general': 'General',
        'adminMenu.payment': 'Payment',
        'adminMenu.receipts': 'Receipts',
        'adminMenu.system': 'System',
        'adminMenu.translations': 'Translations',
        'adminMenu.demoData': 'Demo Data',
        'adminMenu.dashboard': 'Dashboard',
        'adminMenu.manageBusinessSettings': 'Manage your business and settings',
        'adminMenu.helpText': 'Need help? Check the',
        'adminMenu.supportCenter': 'support center',
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