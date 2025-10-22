import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from "../contexts/LanguageContext";
import { useDispatch, useSelector } from 'react-redux';

import { login, clearError, dummyLogin } from '../store/slices/authSlice';
import { buildKenniAuthorizeUrl } from '../utils/oidc';

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);


  const [showDummyLogin, setShowDummyLogin] = useState(false);
  const [showTestLogin, setShowTestLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testFormData, setTestFormData] = useState({ email: '', password: '' });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);



  const handleKenni = (e) => {
    e.preventDefault();
    try {
      const url = buildKenniAuthorizeUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  const handleDummyLoginToggle = (e) => {
    e.preventDefault();
    setShowDummyLogin(!showDummyLogin);
  };

  const handleDummyLogin = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    try {
      await dispatch(dummyLogin({ phone: phoneNumber })).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Dummy login failed:', err);
    }
  };

  const handleTestLoginToggle = (e) => {
    e.preventDefault();
    setShowTestLogin(!showTestLogin);
  };

  const handleTestLogin = async (e) => {
    e.preventDefault();
    if (!testFormData.email.trim() || !testFormData.password.trim()) return;

    try {
      // For test login, use 'test_customer' as username since that's what the API expects
      await dispatch(login({
        username: 'test_customer',
        password: testFormData.password
      })).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Test login failed:', err);
    }
  };

  const handleTestFormChange = (e) => {
    setTestFormData({
      ...testFormData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div>
          <div className="flex justify-center">
            <img 
              src="/logo_black-web.webp" 
              alt="Ölföng Logo" 
              className="h-16 w-auto dark:invert"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth', 'login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {t('authExtra', 'loginWithElectronicIdDescription')}
          </p>
        </div>

        {/* Only Kenni login on this page */}
        <div className="mt-6 space-y-4">
          <button
            onClick={handleKenni}
            className="group relative w-full flex flex-col items-center justify-center py-3 px-4 border border-primary-600 text-base font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <span>{t('auth', 'login')}</span>
            <span className="text-sm opacity-90">{t('authExtra', 'loginWithElectronicId')}</span>
          </button>

           {/* Dummy login button */}
           <button
             onClick={handleDummyLoginToggle}
             className="group relative w-full flex flex-col items-center justify-center py-3 px-4 border border-orange-600 text-base font-semibold rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
           >
             <span>Test Login</span>
             <span className="text-sm opacity-90">Dummy Electronic ID (Testing)</span>
           </button>

           {/* Test login button for Playwright tests */}
           <button
             onClick={handleTestLoginToggle}
             className="group relative w-full flex flex-col items-center justify-center py-3 px-4 border border-green-600 text-base font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
           >
             <span>Automated Test Login</span>
             <span className="text-sm opacity-90">Email/Password (For Tests)</span>
           </button>

           {/* Phone input for dummy login */}
           {showDummyLogin && (
             <div className="space-y-3">
               <div>
                 <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   Insert your phone number
                 </label>
                 <input
                   id="phone"
                   type="tel"
                   value={phoneNumber}
                   onChange={(e) => setPhoneNumber(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   placeholder="Enter phone number"
                 />
               </div>
               <button
                 onClick={handleDummyLogin}
                 disabled={!phoneNumber.trim() || isLoading}
                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isLoading ? 'Logging in...' : 'Login with Phone'}
               </button>
             </div>
           )}

           {/* Email/password input for test login */}
           {showTestLogin && (
             <form onSubmit={handleTestLogin} className="space-y-3">
               <div>
                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   Email
                 </label>
                 <input
                   id="email"
                   name="email"
                   type="email"
                   required
                   value={testFormData.email}
                   onChange={handleTestFormChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   placeholder="Enter email address"
                 />
               </div>
               <div>
                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   Password
                 </label>
                 <input
                   id="password"
                   name="password"
                   type="password"
                   required
                   value={testFormData.password}
                   onChange={handleTestFormChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   placeholder="Enter password"
                 />
               </div>
               <button
                 type="submit"
                 disabled={!testFormData.email.trim() || !testFormData.password.trim() || isLoading}
                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isLoading ? 'Logging in...' : 'Login with Email'}
               </button>
             </form>
           )}
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/admin-login"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {t('authExtra', 'adminDeliveryLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


