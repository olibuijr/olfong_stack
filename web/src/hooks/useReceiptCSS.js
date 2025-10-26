import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceiptSettings } from '../store/slices/receiptSettingsSlice';

/**
 * Custom hook to load receipt settings and inject CSS globally
 */
export const useReceiptCSS = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.receiptSettings);

  useEffect(() => {
    // Load receipt settings if not already loaded
    if (!settings) {
      dispatch(fetchReceiptSettings());
    }
  }, [dispatch, settings]);

  useEffect(() => {
    // Inject CSS when settings are loaded
    if (settings && settings.customCss) {
      // Check if style element already exists
      let styleElement = document.getElementById('receipt-settings-css');

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'receipt-settings-css';
        document.head.appendChild(styleElement);
      }

      // Update the CSS content
      styleElement.textContent = settings.customCss;
    }
  }, [settings]);

  return { settings };
};
