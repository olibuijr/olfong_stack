import { useSelector } from 'react-redux';
import {
  Settings as SettingsIcon,
  Building,
  Truck,
  Percent,
  Key,
  CreditCard,
  Wifi,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useLanguage } from "../../contexts/LanguageContext";
import { Link, Navigate } from 'react-router-dom';

const SettingsOverview = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);

  // Redirect to general settings as the default
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/settings/general" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="text-red-400 mb-4">
              <RefreshCw className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">{t('admin.accessDenied')}</h1>
            <p className="text-gray-700">{t('admin.accessDeniedMessage')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const settingsCategories = [
    {
      title: t('adminSettings.storeSettings'),
      description: t('adminSettings.storeSettingsDescription'),
      icon: SettingsIcon,
      color: 'blue',
      items: [
        {
          name: t('adminSettings.general'),
          description: t('adminSettings.generalDescription'),
          href: '/admin/settings/general',
          icon: SettingsIcon
        },
        {
          name: t('adminSettings.business'),
          description: t('adminSettings.businessDescription'),
          href: '/admin/settings/business',
          icon: Building
        },
        {
          name: t('adminSettings.shipping'),
          description: t('adminSettings.shippingDescription'),
          href: '/admin/settings/shipping',
          icon: Truck
        },
        {
          name: t('adminSettings.vat'),
          description: t('adminSettings.vatDescription'),
          href: '/admin/settings/vat',
          icon: Percent
        }
      ]
    },
    {
      title: t('adminSettings.integrations'),
      description: t('adminSettings.integrationsDescription'),
      icon: Wifi,
      color: 'green',
      items: [
        {
          name: t('adminSettings.apiKeys'),
          description: t('adminSettings.apiKeysDescription'),
          href: '/admin/settings/api-keys',
          icon: Key
        },
        {
          name: t('adminSettings.paymentGateways'),
          description: t('adminSettings.paymentGatewayDescription'),
          href: '/admin/settings/payment-gateways',
          icon: CreditCard
        },
        {
          name: t('adminSettings.integrations'),
          description: t('adminSettings.integrationsDescription'),
          href: '/admin/settings/integrations',
          icon: Wifi
        }
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminSettings.settings')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('adminSettings.manageSystemSettings')}</p>
        </div>

        {/* Settings Categories */}
        <div className="space-y-8">
          {settingsCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-${category.color}-100 dark:bg-${category.color}-900/20 rounded-lg flex items-center justify-center`}>
                  <category.icon className={`w-4 h-4 text-${category.color}-600 dark:text-${category.color}-400`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{category.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                </div>
              </div>

              {/* Category Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                        <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsOverview;