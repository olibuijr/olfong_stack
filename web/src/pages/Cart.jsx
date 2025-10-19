import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getProductName } from '../utils/languageUtils';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { cart, isLoading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await dispatch(removeFromCart(itemId));
      return;
    }
    
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm(t('cartPage.clearCart') + '?')) {
      try {
        await dispatch(clearCart()).unwrap();
      } catch (error) {
        toast.error(t('navigation.language') === 'is' 
          ? 'Mistókst að tæma körfu' 
          : 'Failed to clear cart');
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error(t('common.loginRequired'));
      navigate('/login');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error(t('navigation.language') === 'is' 
        ? 'Körfan er tóm' 
        : 'Cart is empty');
      return;
    }

    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {t('cart.title')}
            </h1>
            <div className="card p-8">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('cartPage.loginToViewCart')}</h2>
              <p className="text-gray-600 mb-6">{t('cartPage.mustLoginToViewCart')}</p>
              <Link to="/login" className="btn btn-primary">{t('cartPage.login')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('cart.title')}
          </h1>
          <div className="text-center">
            <div className="card p-8">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('cartPage.emptyCart')}</h2>
              <p className="text-gray-600 mb-6">{t('cartPage.addItemsToStart')}</p>
              <Link to="/products" className="btn btn-primary">{t('home.hero.startShopping')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('cart.title')}
          </h1>
          {cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('cartPage.clearCart')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="card p-6">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={`http://localhost:5000${item.product.imageUrl}`}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">{t('cartPage.noImage')}</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {getProductName(i18n.language, item.product)}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {item.product.descriptionIs || item.product.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {t(`navigation.${item.product.category.toLowerCase()}`)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.product.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.product.stock > 0 ? t('products.inStock') : t('products.outOfStock')}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 text-center min-w-[60px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {(item.product.price * item.quantity).toLocaleString()} {t('common.currency')}
                    </div>
                    <div className="text-sm text-gray-500">{item.product.price.toLocaleString()} {t('common.currency')} {t('cartPage.each')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('cartPage.orderSummary')}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cartPage.items')} ({totalItems})</span>
                  <span className="font-medium">
                    {totalPrice.toLocaleString()} {t('common.currency')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cartPage.delivery')}</span>
                  <span className="font-medium text-green-600">{t('common.free')}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                    {t('common.total')}
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      {totalPrice.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn btn-primary w-full py-3 text-lg"
              >
                {t('cartPage.proceedToCheckout')}
              </button>

              <Link 
                to="/products" 
                className="btn btn-outline w-full mt-3"
              >
                {t('cartPage.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;


