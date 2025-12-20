import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';
import Button from '../components/Button';

interface CartPageProps {
  cart?: CartItem[]; // جعله اختياريًا
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, removeFromCart, updateQuantity }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // 1. فحص إذا كان cart undefined
  if (cart === undefined) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black text-center px-3 sm:px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold mb-4"></div>
        <h2 className="text-xl text-white mb-2">جاري التحميل...</h2>
        <p className="text-gray-400">يتم تحميل محتويات السلة</p>
      </div>
    );
  }

  // 2. التأكد أن cart هو array
  const safeCart = Array.isArray(cart) ? cart : [];
  
  // 3. إذا كان cart null
  if (cart === null) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black text-center px-3 sm:px-4">
        <div className="text-red-400 mb-4">
          <ShoppingBag size={60} />
        </div>
        <h2 className="text-xl text-white mb-2">خطأ في تحميل السلة</h2>
        <p className="text-gray-400 mb-4">تعذر تحميل محتويات السلة</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const total = safeCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Safe string helper
  const s = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      try {
        return val.name || val.id || JSON.stringify(val);
      } catch (e) {
        return 'Object';
      }
    }
    return String(val);
  };

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    
    setIsUpdating(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      updateQuantity(id, newQty);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج من السلة؟')) {
      setIsUpdating(id);
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        removeFromCart(id);
      } finally {
        setIsUpdating(null);
      }
    }
  };

  if (safeCart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black text-center px-3 sm:px-4">
        <div className="relative mb-6 sm:mb-8">
          <ShoppingBag size={isMobile ? 60 : 80} className="text-neutral-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gold/10 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">?</span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">سلة المشتريات فارغة</h2>
        <p className="text-gray-400 mb-8 sm:mb-10 text-base sm:text-lg max-w-md px-4">
          لم تقم بإضافة أي ساعات إلى سلة التسوق بعد. اكتشف مجموعتنا المميزة من الساعات الفاخرة!
        </p>
        <Link to="/products" className="w-full max-w-xs">
          <Button variant="primary" size="lg" className="w-full group">
            <span className="flex items-center justify-center gap-2">
              تصفح المنتجات
              <ArrowRight size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-2">سلة التسوق</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            لديك {safeCart.length} منتج{safeCart.length > 1 ? 'ات' : ''} في السلة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* قائمة المنتجات */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {safeCart.map((item) => (
              <div 
                key={item.id} 
                className={`bg-neutral-900 border border-white/5 rounded-lg overflow-hidden transition-all duration-300 ${
                  isUpdating === item.id ? 'opacity-70' : 'opacity-100'
                }`}
              >
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* صورة المنتج */}
                  <Link 
                    to={`/product/${item.id}`} 
                    className="block w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 bg-neutral-800 rounded-lg overflow-hidden group relative"
                  >
                    <img 
                      src={item.images[0]} 
                      alt={s(item.name)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </Link>

                  {/* معلومات المنتج */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-right">
                        <p className="text-gold text-xs font-bold uppercase tracking-wider mb-1">
                          {s(item.brand)}
                        </p>
                        <Link to={`/product/${item.id}`}>
                          <h3 className="text-base sm:text-lg font-bold text-white hover:text-gold transition-colors mb-2 line-clamp-2">
                            {s(item.name)}
                          </h3>
                        </Link>
                        <p className="text-gold text-lg font-bold mb-4">
                          {Number(item.price).toLocaleString()} دج
                        </p>
                      </div>
                      
                      {/* زر الحذف - كبير الشاشات */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating === item.id}
                        className="hidden sm:flex hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>

                    {/* أدوات التحكم بالكمية */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-sm ml-3">الكمية:</span>
                        <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating === item.id}
                            className="h-8 w-8 rounded-none hover:bg-white/5 border-r border-white/5"
                          >
                            <Minus size={14} />
                          </Button>
                          <div className="w-12 text-center">
                            {isUpdating === item.id ? (
                              <div className="h-8 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : (
                              <span className="text-white font-medium text-sm block h-8 leading-8">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating === item.id}
                            className="h-8 w-8 rounded-none hover:bg-white/5 border-l border-white/5"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* المجموع والسعر */}
                      <div className="text-left">
                        <p className="text-gray-400 text-sm mb-1">المجموع</p>
                        <p className="text-white text-lg font-bold">
                          {(Number(item.price) * item.quantity).toLocaleString()} دج
                        </p>
                      </div>
                    </div>

                    {/* زر الحذف - الهواتف */}
                    <div className="sm:hidden mt-4 pt-4 border-t border-white/5">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating === item.id}
                        className="w-full text-red-400 border-red-400/20 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} className="ml-2" />
                        إزالة المنتج
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-gold/20 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-white/5">ملخص الطلب</h3>
              
              {/* زر إتمام الطلب */}
              <Link to="/checkout" className="block mb-6">
                <Button 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  className="py-3.5 text-base font-bold group"
                >
                  <span className="flex items-center justify-center gap-2">
                    متابعة الدفع
                    <ArrowRight size={18} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>

              {/* رابط متابعة التسوق */}
              <div className="mt-6 text-center">
                <Link to="/products" className="inline-block">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    ← متابعة التسوق
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;