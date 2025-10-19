import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';

const DemoData = () => {
  const { t } = useTranslation();
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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
               <div>
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('demoData.title')}</h1>
                 <p className="text-gray-600 dark:text-gray-400 mt-2">{t('demoData.description')}</p>
               </div>
             </div>
           </div>
         </div>

      {/* Demo Data Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('demoData.overview')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoDataInfo.map((item) => (
            <div key={item.type} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                  {t(`demoData.${item.type}`)}
                </h3>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-2.5 py-0.5 rounded">
                  {item.count}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {item.description}
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
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
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              {t('demoData.warningTitle')}
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {t('demoData.warningMessage')}
            </p>
          </div>
        </div>
       </div>

       {/* Actions */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="px-4 sm:px-6 lg:px-8 py-6">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
             {t('demoData.actions')}
           </h2>
           <div className="flex flex-col sm:flex-row gap-4">
             <button
               onClick={handleInsertDemoData}
               disabled={isLoading}
               className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
             >
               {isLoading && operation === 'insert' ? (
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
               ) : (
                 <Play className="h-4 w-4" />
               )}
               {t('demoData.insertButton')}
             </button>

             <button
               onClick={handleRemoveDemoData}
               disabled={isLoading}
               className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
             >
               {isLoading && operation === 'remove' ? (
                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
               ) : (
                 <Trash2 className="h-4 w-4" />
               )}
               {t('demoData.removeButton')}
             </button>
           </div>

           <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
             <p className="flex items-center gap-2 mb-2">
               <CheckCircle className="h-4 w-4 text-green-500" />
               {t('demoData.insertNote')}
             </p>
             <p className="flex items-center gap-2">
               <XCircle className="h-4 w-4 text-red-500" />
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