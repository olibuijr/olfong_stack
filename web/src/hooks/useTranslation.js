import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { t, currentLanguage, isLoading, refreshTranslations } = useLanguage();

  return {
    t,
    currentLanguage,
    isLoading,
    refreshTranslations,
  };
};

export const useLanguageSwitcher = () => {
  // This might be needed by some components, but for now just return empty
  return {};
};