
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CartItem } from '../types';
import { CheckCircle, Truck, MapPin, Phone, User, Mail, CreditCard, Building2, Home, ShoppingCart } from 'lucide-react';
import Button from '../components/Button';


interface CheckoutPageProps {
  cart: CartItem[];
  clearCart: () => void;
}

const ALGERIA_WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", "البويرة",
  "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة",
  "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة",
  "وهران", "البيض", "إيليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان"
];

const SHIPPING_COSTS = {
  OFFICE: 450,
  HOME: 800
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    wilaya: ALGERIA_WILAYAS[0],
    municipality: '',
    address: '',
    delivery_method: 'HOME', // 'OFFICE' or 'HOME'
    payment_method: 'Cash on Delivery'
  });

  const cartTotal = useMemo(() => (cart || []).reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const shippingCost = formData.delivery_method === 'HOME' ? SHIPPING_COSTS.HOME : SHIPPING_COSTS.OFFICE;
  const grandTotal = cartTotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const generatedId = `QT-${Math.floor(Math.random() * 900000) + 100000}`;
    
    const orderData = {
      customer_name: formData.name,
      email: formData.email || null, // Optional email
      phone: formData.phone,
      wilaya: formData.wilaya,
      municipality: formData.municipality,
      shipping_address: formData.address,
      delivery_method: formData.delivery_method === 'HOME' ? 'توصيل للمنزل' : 'توصيل للمكتب',
      subtotal: cartTotal,
      shipping_cost: shippingCost,
      total: grandTotal,
      status: 'PENDING',
      payment_method: formData.payment_method
    };

    const { data, error } = await supabase.from('orders').insert([orderData]).select().single();

    if (!error && data) {
      // Create order items
      for (const item of cart) {
        await supabase.from('order_items').insert([{
          order_id: data.id,
          product_id: item.id,
          product_name: item.name,
          product_brand: item.brand,
          product_image: item.images[0],
          unit_price: item.price,
          quantity: item.quantity,
          total_price: item.price * item.quantity
        }]);
      }
      
      setOrderId(data.id);
      setSuccess(true);
      clearCart();
    } else {
      alert('حدث خطأ أثناء إتمام الطلب. يرجى المحاولة لاحقاً.');
      console.error(error);
    }
    setLoading(false);
  };

  

  if (success) {
    return (
      <>
        
        <div className="min-h-screen bg-black">
          <div className="flex items-center justify-center p-4" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="max-w-md w-full bg-neutral-900 border border-gold/30 p-10 text-center rounded-sm">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">تم الطلب بنجاح!</h2>
              <p className="text-gray-400 mb-6">شكراً لاختيارك Quality Time. سنقوم بالتواصل معك قريباً لتأكيد طلبك.</p>
              <div className="bg-black p-4 border border-white/10 rounded-sm mb-8">
                <p className="text-sm text-gray-500">رقم الطلب</p>
                <p className="text-2xl font-mono font-bold text-gold">{orderId}</p>
              </div>
              
              <div className="space-y-3">
                
                <Button 
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  العودة للرئيسية
                </Button>
              </div>
            </div>
          </div>
          
        </div>
      </>
    );
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light text-gray-800 mb-3">إتمام الطلب</h1>
          <p className="text-gray-600">أكمل معلوماتك لتأكيد الطلب</p>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">المعلومات الشخصية</h3>
                  <p className="text-sm text-gray-500">معلومات الاتصال الأساسية</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                  <input 
                    required 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="05 XX XX XX XX"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني (اختياري)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">معلومات الشحن</h3>
                  <p className="text-sm text-gray-500">عنوان التوصيل</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الولاية *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={formData.wilaya}
                    onChange={(e) => setFormData({...formData, wilaya: e.target.value})}
                  >
                    {ALGERIA_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البلدية *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.municipality}
                    onChange={(e) => setFormData({...formData, municipality: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="أدخل البلدية"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان المفصل *</label>
                  <textarea 
                    required 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="أدخل العنوان الكامل"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Truck size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">طريقة الشحن</h3>
                  <p className="text-sm text-gray-500">اختر طريقة التوصيل</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.delivery_method === 'OFFICE' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input 
                    type="radio" 
                    name="delivery" 
                    checked={formData.delivery_method === 'OFFICE'}
                    onChange={() => setFormData({...formData, delivery_method: 'OFFICE'})}
                    className="sr-only" 
                  />
                  <div className="text-center">
                    <Building2 className={`mx-auto mb-2 ${formData.delivery_method === 'OFFICE' ? 'text-purple-600' : 'text-gray-400'}`} size={32} />
                    <p className="font-semibold text-gray-800">الشحن للمكتب</p>
                    <p className={`text-sm mt-1 ${formData.delivery_method === 'OFFICE' ? 'text-purple-600' : 'text-gray-500'}`}>
                      + {SHIPPING_COSTS.OFFICE} دج
                    </p>
                  </div>
                  {formData.delivery_method === 'OFFICE' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
                
                <label className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.delivery_method === 'HOME' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input 
                    type="radio" 
                    name="delivery" 
                    checked={formData.delivery_method === 'HOME'}
                    onChange={() => setFormData({...formData, delivery_method: 'HOME'})}
                    className="sr-only" 
                  />
                  <div className="text-center">
                    <Home className={`mx-auto mb-2 ${formData.delivery_method === 'HOME' ? 'text-purple-600' : 'text-gray-400'}`} size={32} />
                    <p className="font-semibold text-gray-800">الشحن للمنزل</p>
                    <p className={`text-sm mt-1 ${formData.delivery_method === 'HOME' ? 'text-purple-600' : 'text-gray-500'}`}>
                      + {SHIPPING_COSTS.HOME} دج
                    </p>
                  </div>
                  {formData.delivery_method === 'HOME' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">طريقة الدفع</h3>
                  <p className="text-sm text-gray-500">اختر طريقة الدفع</p>
                </div>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="font-medium text-gray-800">الدفع عند الاستلام</span>
                  </div>
                  <CheckCircle className="text-orange-500" size={20} />
                </div>
                <p className="text-sm text-gray-600 mt-2">ادفع المبلغ عند استلام الطلب</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">محتوى الطلب</h3>
                  <p className="text-sm text-gray-500">{cart.length} منتج</p>
                </div>
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-gray-500 text-xs">{item.quantity} × {item.price.toLocaleString()} دج</p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{(item.price * item.quantity).toLocaleString()} دج</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span>{cartTotal.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>تكلفة الشحن</span>
                  <span>{shippingCost.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200">
                  <span>الإجمالي</span>
                  <span className="text-indigo-600">{grandTotal.toLocaleString()} دج</span>
                </div>
              </div>

              <Button 
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="mt-6 py-4 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? 'جاري المعالجة...' : 'تأكيد الطلب'}
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                بالضغط على "تأكيد الطلب" أنت توافق على شروط الخدمة
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
