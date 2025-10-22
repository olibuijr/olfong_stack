import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import addressReducer from './slices/addressSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import dashboardReducer from './slices/dashboardSlice';
import bannerReducer from './slices/bannerSlice';
import chatReducer from './slices/chatSlice';
import analyticsReducer from './slices/analyticsSlice';
import reportsReducer from './slices/reportsSlice';
import receiptSettingsReducer from './slices/receiptSettingsSlice';
import smtpSettingsReducer from './slices/smtpSettingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    orders: orderReducer,
    addresses: addressReducer,
    subscriptions: subscriptionReducer,
    dashboard: dashboardReducer,
    banners: bannerReducer,
    chat: chatReducer,
    analytics: analyticsReducer,
    reports: reportsReducer,
    receiptSettings: receiptSettingsReducer,
    smtpSettings: smtpSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Debug: Log store creation
console.log('Store created:', store);
console.log('Store state:', store.getState());

// Expose store on window for debugging
if (typeof window !== 'undefined') {
  window.store = store;
}

// TypeScript types (commented out for JavaScript project)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

