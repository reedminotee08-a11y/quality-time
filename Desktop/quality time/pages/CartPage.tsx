
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';
import Button from '../components/Button';

interface CartPageProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, removeFromCart, updateQuantity }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Safe string helper to prevent [object Object]
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

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black text-center px-3 sm:px-4">
        <ShoppingBag size={60} className="sm:size-80 text-neutral-800 mb-6 sm:mb-8" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">سلة المشتريات فارغة</h2>
        <p className="text-gray-400 mb-8 sm:mb-10 text-base sm:text-lg px-4">يبدو أنك لم تختر أي ساعة بعد، اكتشف مجموعتنا الآن!</p>
        <Link to="/products" className="w-full max-w-xs sm:max-w-none">
          <Button variant="primary" size="lg" className="w-full">
            تصفح المنتجات
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-8 sm:mb-12 text-center">حقيبة التسوق</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 justify-items-center lg:justify-items-start">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="bg-neutral-900 border border-white/5 p-4 sm:p-6 rounded-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-neutral-800 rounded-sm overflow-hidden">
                  <img src={item.images[0]} alt={s(item.name)} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow text-right">
                  <p className="text-gold text-xs font-bold uppercase">{s(item.brand)}</p>
                  <h3 className="text-base sm:text-lg font-bold text-white">{s(item.name)}</h3>
                  <p className="text-gray-400 text-sm sm:text-base">{Number(item.price).toLocaleString()} دج</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 bg-black border border-white/10 p-2 rounded-sm">
                  <Button variant="icon" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={16} className="sm:size-18" />
                  </Button>
                  <span className="text-white font-bold w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                  <Button variant="icon" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={16} className="sm:size-18" />
                  </Button>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white w-24 sm:w-32 text-left">
                  {(Number(item.price) * item.quantity).toLocaleString()} دج
                </div>
                <Button 
                  variant="danger" 
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={18} className="sm:size-20" />
                </Button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-gold/30 p-6 sm:p-8 rounded-sm sticky top-20 sm:top-24">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8 border-b border-white/5 pb-4">ملخص الطلب</h3>
              <div className="space-y-4 mb-6 sm:mb-8">
                <div className="flex justify-between text-gray-400 text-sm sm:text-base">
                  <span>{(total).toLocaleString()} دج</span>
                  <span>المجموع الفرعي</span>
                </div>
                <div className="flex justify-between text-white text-lg sm:text-xl font-bold pt-4 border-t border-white/5">
                  <span className="text-gold">{total.toLocaleString()} دج</span>
                  <span>الإجمالي</span>
                </div>
              </div>
              <Link 
                to="/checkout" 
                className="w-full"
              >
                <Button variant="primary" size="lg" fullWidth className="py-3 sm:py-4">
                  إتمام الطلب <ArrowRight size={18} className="sm:size-20" />
                </Button>
              </Link>
              <div className="mt-6 flex items-center justify-center gap-4 opacity-50">
                <img src="https://cdn-icons-png.flaticon.com/128/349/349221.png" className="h-6 grayscale" alt="Visa" />
                <img src="https://cdn-icons-png.flaticon.com/128/349/349228.png" className="h-6 grayscale" alt="Mastercard" />
                <img src="https://cdn-icons-png.flaticon.com/128/196/196566.png" className="h-6 grayscale" alt="PayPal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
