import { useState, useEffect } from 'react';

import { useLanguage } from "../../contexts/LanguageContext";
import { 
  MessageCircle, 
  X, 
  ShoppingBag, 
  HelpCircle, 
  Package, 
  CreditCard, 
  Truck, 
  Star,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import './ChatWidget.css';

const TopicSelection = ({ onTopicSelected, onClose }) => {
  const { t } = useLanguage();

  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const topics = [
    { id: 'general', label: t('chat.topics.general'), icon: HelpCircle, description: t('chat.topics.generalDesc') },
    { id: 'order', label: t('chat.topics.order'), icon: ShoppingBag, description: t('chat.topics.orderDesc') },
    { id: 'delivery', label: t('chat.topics.delivery'), icon: Truck, description: t('chat.topics.deliveryDesc') },
    { id: 'payment', label: t('chat.topics.payment'), icon: CreditCard, description: t('chat.topics.paymentDesc') },
    { id: 'product', label: t('chat.topics.product'), icon: Package, description: t('chat.topics.productDesc') },
    { id: 'feedback', label: t('chat.topics.feedback'), icon: Star, description: t('chat.topics.feedbackDesc') },
  ];

  useEffect(() => {
    if (selectedTopic === 'order') {
      fetchUserOrders();
    }
  }, [selectedTopic]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders?limit=10&status=COMPLETED,PROCESSING,SHIPPED');
      setUserOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
    if (topicId !== 'order') {
      setSelectedOrder(null);
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  const handleCustomTopicChange = (e) => {
    setCustomTopic(e.target.value);
  };

  const handleContinue = () => {
    if (selectedTopic === 'custom' && !customTopic.trim()) {
      return;
    }
    
    const topicData = {
      topic: selectedTopic,
      customTopic: selectedTopic === 'custom' ? customTopic : null,
      orderId: selectedOrder?.id || null,
      orderNumber: selectedOrder?.orderNumber || null,
    };
    
    onTopicSelected(topicData);
  };

  const canContinue = () => {
    if (selectedTopic === 'custom') {
      return customTopic.trim().length > 0;
    }
    if (selectedTopic === 'order') {
      return selectedOrder !== null;
    }
    return selectedTopic !== '';
  };

  return (
    <div className="chat-widget-topic-selection">
      <div className="chat-widget-header">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('chat.selectTopic')}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="chat-widget-content">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('chat.selectTopicDesc')}
        </p>

        <div className="space-y-2 mb-4">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedTopic === topic.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {topic.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {topic.description}
                    </div>
                  </div>
                  {selectedTopic === topic.id && (
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedTopic === 'order' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('chat.selectOrder')}
            </h4>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">{t('common.loading')}</p>
              </div>
            ) : userOrders.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleOrderSelect(order)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedOrder?.id === order.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {t('order.orderNumber')}: {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()} - {order.status}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.totalAmount} kr
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('chat.noOrders')}</p>
              </div>
            )}
          </div>
        )}

        {selectedTopic === 'custom' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('chat.customTopic')}
            </h4>
            <textarea
              value={customTopic}
              onChange={handleCustomTopicChange}
              placeholder={t('chat.customTopicPlaceholder')}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('chat.startChat')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;