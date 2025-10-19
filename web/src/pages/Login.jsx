import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { login, clearError } from '../store/slices/authSlice';
import { buildKenniAuthorizeUrl } from '../utils/oidc';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [showPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => { e.preventDefault(); };

  const handleKenni = (e) => {
    e.preventDefault();
    try {
      const url = buildKenniAuthorizeUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
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
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {t('authExtra.loginWithElectronicIdDescription')}
          </p>
        </div>

        {/* Only Kenni login on this page */}
        <div className="mt-6">
          <button
            onClick={handleKenni}
            className="group relative w-full flex flex-col items-center justify-center py-3 px-4 border border-primary-600 text-base font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <span>{t('auth.login')}</span>
            <span className="text-sm opacity-90">{t('authExtra.loginWithElectronicId')}</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/admin-login"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {t('authExtra.adminDeliveryLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


