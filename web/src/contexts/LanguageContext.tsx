import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface LanguageContextType {
  currentLanguage: string;
  t: (key: string) => string;
  isLoading: boolean;
  refreshTranslations: () => Promise<void>;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage] = useState('is'); // Permanently set to Icelandic
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Simple translation function
  const t = useCallback((key: string): string => {
    if (translations[key]) {
      return translations[key];
    }
    console.error(`Translation not found for key: ${key}`);
    return key; // Return the key itself as a fallback
  }, [translations]);

  // Load translations from API
  const loadTranslations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/translations'); // Assuming this endpoint returns all Icelandic translations
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
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize translations on mount
  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  // Refresh translations
  const refreshTranslations = useCallback(async () => {
    await loadTranslations();
  }, [loadTranslations]);

  const value = {
    currentLanguage,
    t,
    isLoading,
    refreshTranslations,
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