import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLanguage } from "../../contexts/LanguageContext";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  X,
  User,
  CreditCard,
  Banknote,
  Clock,
  Printer,
  Send,
  Download,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

const POSOrders = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products, categories } = useSelector((state) => state.products);

  // State for POS interface
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus] = useState('COMPLETED');
  const [notes, setNotes] = useState('');
  const [shippingOptionId, setShippingOptionId] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Load initial data
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dispatch(fetchProducts({ limit: 100 }));
      dispatch(fetchCategories());
      fetchShippingOptions();
    }
  }, [dispatch, user]);

  const fetchShippingOptions = async () => {
    try {
      const response = await api.get('/shipping');
      setShippingOptions(response.data);
      if (response.data.length > 0) {
        setShippingOptionId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching shipping options:', error);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.nameIs.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory && product.isActive;
  });

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        product: product,
        quantity: 1,
        price: product.price
      }]);
    }
  };

  // Update cart item quantity
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedShipping = shippingOptions.find(option => option.id === parseInt(shippingOptionId));
  const shippingCost = selectedShipping ? selectedShipping.fee : 0;
  const total = subtotal + shippingCost;

  // Search customers
  const searchCustomers = async (query) => {
    if (query.length < 2) return;
    
    try {
      const response = await api.get(`/customers?search=${query}&limit=10`);
      return response.data.customers || [];
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  };

  // Process order
  const processOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!selectedCustomer && !guestInfo.email) {
      toast.error('Please select a customer or enter guest information');
      return;
    }

    if (!shippingOptionId) {
      toast.error('Please select a shipping option');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        shippingOptionId: parseInt(shippingOptionId),
        paymentMethod,
        paymentStatus,
        notes,
        ...(selectedCustomer ? { customerId: selectedCustomer.id } : { guestInfo })
      };

      const response = await api.post('/orders/pos', orderData);
      
      setCurrentOrder(response.data.order);
      setShowReceipt(true);
      
      // Clear cart and form
      setCart([]);
      setSelectedCustomer(null);
      setGuestInfo({ name: '', email: '', phone: '' });
      setNotes('');
      
      toast.success('Order processed successfully!');
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error(error.response?.data?.message || 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Print receipt
  const printReceipt = () => {
    window.print();
  };

  // Email receipt
  const emailReceipt = async (email) => {
    if (!currentOrder) return;
    
    try {
      await api.post(`/orders/${currentOrder.id}/receipt/email`, { email });
      toast.success('Receipt sent successfully!');
    } catch (error) {
      console.error('Error sending receipt:', error);
      toast.error('Failed to send receipt');
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!currentOrder) return;
    
    try {
      const response = await api.get(`/orders/${currentOrder.id}/receipt/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${currentOrder.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access the POS system.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pos.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('pos.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Product Selection */}
          <div className="col-span-8">
            {/* Customer Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('pos.customer')}</h2>
              
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={t('pos.searchCustomers')}
                      className="input pl-10 w-full"
                      onChange={async (e) => {
                        const query = e.target.value;
                        if (query.length >= 2) {
                          await searchCustomers(query);
                          // You could show a dropdown here with search results
                        }
                      }}
                    />
                  </div>
                  
                  <div className="text-center text-gray-500 dark:text-gray-400">{t('pos.or')}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder={t('pos.guestName')}
                      value={guestInfo.name}
                      onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                      className="input"
                    />
                    <input
                      type="email"
                      placeholder={t('pos.guestEmail')}
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      className="input"
                    />
                    <input
                      type="tel"
                      placeholder={t('pos.guestPhone')}
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Product Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={t('pos.searchProducts')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input w-full md:w-48"
                >
                  <option value="">{t('pos.allCategories')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {product.price.toLocaleString()} ISK
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('pos.stock')}: {product.stock}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cart & Checkout */}
          <div className="col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                                {t('pos.cartTitle')} ({cart.length} {t('pos.cartItems')})
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.price.toLocaleString()} ISK each
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                                    <span>{t('pos.subtotal')}:</span>
                  <span>{subtotal.toLocaleString()} ISK</span>
                </div>
                <div className="flex justify-between text-sm">
                                    <span>{t('pos.shipping')}:</span>
                  <span>{shippingCost.toLocaleString()} ISK</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span>{t('pos.total')}:</span>
                  <span>{total.toLocaleString()} ISK</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('pos.paymentMethod')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 rounded-lg border text-sm font-medium ${
                      paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1" />
                    {t('pos.cash')}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2 rounded-lg border text-sm font-medium ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    {t('pos.card')}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('pay_later')}
                    className={`p-2 rounded-lg border text-sm font-medium ${
                      paymentMethod === 'pay_later'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    {t('pos.payLater')}
                  </button>
                </div>
              </div>

              {/* Shipping Option */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('pos.shippingOption')}
                </label>
                <select
                  value={shippingOptionId}
                  onChange={(e) => setShippingOptionId(e.target.value)}
                  className="input w-full"
                >
                  {shippingOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name} - {option.fee.toLocaleString()} ISK
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('pos.notes')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input w-full h-20 resize-none"
                                    placeholder={t('pos.orderNotes')}
                />
              </div>

              {/* Process Order Button */}
              <button
                onClick={processOrder}
                disabled={cart.length === 0 || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('pos.processOrder')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && currentOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order Receipt - {currentOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Receipt Content */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Order Date:</p>
                    <p>{new Date(currentOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Status:</p>
                    <p className="capitalize">{currentOrder.status}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Items:</p>
                  <div className="space-y-2">
                    {currentOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString()} ISK</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('pos.total')}:</span>
                    <span>{currentOrder.totalAmount.toLocaleString()} ISK</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={printReceipt}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => {
                    const email = prompt('Enter email address:');
                    if (email) emailReceipt(email);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Email
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default POSOrders;
