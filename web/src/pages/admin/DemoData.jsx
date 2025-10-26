import { useState } from 'react';
import { useLanguage } from "../../contexts/LanguageContext";
import { Play, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import PageHeader from '../../components/admin/PageHeader';

const DemoData = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [operation, setOperation] = useState(null);

  const handleInsertDemoData = async () => {
    setIsLoading(true);
    setOperation('insert');

    try {
      const response = await fetch('/api/admin/demo-data/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('demoData.insertSuccess'));
      } else {
        toast.error(data.message || t('demoData.insertError'));
      }
    } catch (error) {
      console.error('Error inserting demo data:', error);
      toast.error(t('demoData.insertError'));
    } finally {
      setIsLoading(false);
      setOperation(null);
    }
  };

  const handleRemoveDemoData = async () => {
    setIsLoading(true);
    setOperation('remove');

    try {
      const response = await fetch('/api/admin/demo-data/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('demoData.removeSuccess'));
      } else {
        toast.error(data.message || t('demoData.removeError'));
      }
    } catch (error) {
      console.error('Error removing demo data:', error);
      toast.error(t('demoData.removeError'));
    } finally {
      setIsLoading(false);
      setOperation(null);
    }
  };

  const demoDataInfo = [
    {
      type: 'customers',
      count: 5,
      description: t('demoData.customersDescription'),
      details: [
        'Anna Johnson (anna.johnson@example.com)',
        'Björn Andersson (bjorn.andersson@example.com)',
        'Kristín Petersen (kristin.petersen@example.com)',
        'Magnús Þorsteinsson (magnus.thorsteinsson@example.com)',
        'Sara Guðmundsdóttir (sara.gudmundsdottir@example.com)'
      ]
    },
    {
      type: 'addresses',
      count: 5,
      description: t('demoData.addressesDescription'),
      details: [
        'Reykjavík addresses for each customer',
        'Default shipping addresses',
        'Various locations around Reykjavík'
      ]
    },
    {
      type: 'orders',
      count: 8,
      description: t('demoData.ordersDescription'),
      details: [
        'Various order statuses (PENDING, CONFIRMED, PREPARING, etc.)',
        'Different shipping methods (delivery & pickup)',
        'Mixed product types (wine, beer, nicotine, food)',
        'Realistic order amounts and dates'
      ]
    },
    {
      type: 'orderItems',
      count: 15,
      description: t('demoData.orderItemsDescription'),
      details: [
        'Multiple items per order',
        'Various quantities and prices',
        'Links orders to products correctly'
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <PageHeader
          icon={Play}
          title={t('demoData.title')}
          description={t('demoData.description')}
        />

      {/* Demo Data Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('demoData.overview')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demoDataInfo.map((item) => (
            <div key={item.type} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {t('demoData.${item', 'type}')}
                </h3>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-base font-medium px-3 py-1 rounded-lg">
                  {item.count}
                </span>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                {item.description}
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                {item.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              {t('demoData.warningTitle')}
            </h3>
            <p className="text-base text-yellow-700 dark:text-yellow-300 mt-2">
              {t('demoData.warningMessage')}
            </p>
          </div>
        </div>
       </div>

       {/* Actions */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
           <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
             {t('demoData.actions')}
           </h2>
           <div className="flex flex-col sm:flex-row gap-6">
             <button
               onClick={handleInsertDemoData}
               disabled={isLoading}
               className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors text-lg font-medium"
             >
               {isLoading && operation === 'insert' ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
               ) : (
                 <Play className="h-5 w-5" />
               )}
               {t('demoData.insertButton')}
             </button>

             <button
               onClick={handleRemoveDemoData}
               disabled={isLoading}
               className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-colors text-lg font-medium"
             >
               {isLoading && operation === 'remove' ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
               ) : (
                 <Trash2 className="h-5 w-5" />
               )}
               {t('demoData.removeButton')}
             </button>
           </div>

           <div className="mt-6 text-base text-gray-600 dark:text-gray-400">
             <p className="flex items-center gap-3 mb-3">
               <CheckCircle className="h-5 w-5 text-green-500" />
               {t('demoData.insertNote')}
             </p>
             <p className="flex items-center gap-3">
               <XCircle className="h-5 w-5 text-red-500" />
               {t('demoData.removeNote')}
             </p>
           </div>
         </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default DemoData;