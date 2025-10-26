import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook to fetch and provide the active currency symbol
 * Falls back to 'kr' (ISK) if unable to fetch
 */
const useCurrency = () => {
  const [currencySymbol, setCurrencySymbol] = useState('kr');
  const [currencyCode, setCurrencyCode] = useState('ISK');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        setIsLoading(true);
        // Fetch from public settings endpoint (no auth required)
        const response = await api.get('/settings/public?category=GENERAL');

        const settings = response.data?.data?.settings || response.data?.settings || [];

        // Find currency symbol and code from settings
        const currencySymbolSetting = settings.find(s => s.key === 'currencySymbol');
        const currencyCodeSetting = settings.find(s => s.key === 'currencyCode');

        if (currencySymbolSetting?.value) {
          setCurrencySymbol(currencySymbolSetting.value);
        }
        if (currencyCodeSetting?.value) {
          setCurrencyCode(currencyCodeSetting.value);
        }
      } catch (error) {
        console.error('Failed to fetch currency settings:', error);
        // Use defaults on error
        setCurrencySymbol('kr');
        setCurrencyCode('ISK');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrency();
  }, []);

  return {
    currencySymbol,
    currencyCode,
    isLoading
  };
};

export default useCurrency;
