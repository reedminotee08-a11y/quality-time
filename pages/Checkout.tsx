import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft, Building2, Truck, CheckCircle2, ShieldCheck, Lock, MapPin, User, Phone, Check } from 'lucide-react';

const wilayas = [
  "1 - Adrar", "2 - Chlef", "3 - Laghouat", "4 - Oum El Bouaghi", "5 - Batna", "6 - Béjaïa", "7 - Biskra", "8 - Béchar", "9 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Algiers", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane",
  "49 - Timimoun", "50 - Bordj Badji Mokhtar", "51 - Ouled Djellal", "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa"
];

// Shipping prices in DA
const SHIPPING_PRICES = {
  stop_desk: 800,
  home_delivery: 400
};

export const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    wilaya: '',
    municipality: '',
    delivery_method: 'stop_desk' as 'stop_desk' | 'home_delivery',
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shippingCost = SHIPPING_PRICES[formData.delivery_method];
  const finalTotal = cartTotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-dark-800 relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-dark-800 to-dark-800"></div>
        <div className="relative z-10 text-center px-4">
            <h2 className="text-4xl font-serif mb-4 text-white">مجموعتك في انتظارك</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto font-light">سلة التسوق فارغة حالياً. تصفح مجموعتنا لتجد ساعتك المثالية.</p>
            <button 
            onClick={() => navigate('/')} 
            className="group inline-flex items-center gap-2 px-10 py-4 bg-gold-500 text-dark-900 rounded-sm hover:bg-gold-400 transition-all duration-300 font-bold tracking-wider"
            >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" /> 
            <span>العودة إلى المجموعة</span>
            </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeliveryChange = (method: 'stop_desk' | 'home_delivery') => {
    setFormData({ ...formData, delivery_method: method });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.images?.[0]
      }));

      const { error } = await supabase.from('orders').insert([{
        id: orderId,
        ...formData,
        email: "",
        shipping_address: "", 
        items: orderItems,
        total: finalTotal,
        status: 'PENDING'
      }]);

      if (error) throw error;

      clearCart();
      alert(`شكراً لشرائك. تم تأكيد الطلب ${orderId} بنجاح.`);
      navigate('/');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-800 text-gray-200" dir="rtl">
      {/* Checkout Progress Header */}
      <div className="bg-dark-900 border-b border-white/5 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
                <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للسلة
            </button>
            <div className="flex items-center gap-2 text-gold-500">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">دفع آمن</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Main Form Section */}
          <div className="lg:col-span-7">
            <div className="mb-10">
                <h1 className="font-serif text-4xl text-white mb-2">إتمام الطلب</h1>
                <p className="text-gray-400 font-light">يرجى ملء المعلومات التالية لإكمال عملية الشراء.</p>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-12">
              
              {/* Contact Details */}
              <div className="animate-fade-in-up">
                 <h2 className="text-xl font-serif text-white mb-6 pb-2 border-b border-white/5 flex items-center justify-between">
                    <span>معلومات الاتصال</span>
                    <span className="text-xs font-sans text-gray-500 font-normal">خطوة 1 من 3</span>
                 </h2>
                 <div className="space-y-6">
                    <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">الاسم الكامل</label>
                       <div className="relative group">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gold-500 transition-colors" />
                            <input 
                                required 
                                name="customer_name" 
                                onChange={handleInputChange} 
                                className="w-full bg-dark-900 border border-white/10 rounded-sm py-4 pr-12 pl-4 text-white placeholder-gray-600 focus:border-gold-500 outline-none transition-all" 
                                placeholder="مثال: محمد بن علي" 
                            />
                       </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">رقم الهاتف</label>
                        <div className="relative group">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gold-500 transition-colors" />
                            <input 
                                required 
                                name="phone" 
                                type="tel" 
                                onChange={handleInputChange} 
                                className="w-full bg-dark-900 border border-white/10 rounded-sm py-4 pr-12 pl-4 text-white placeholder-gray-600 focus:border-gold-500 outline-none transition-all" 
                                placeholder="مثال: 0550 12 34 56" 
                                style={{ direction: 'ltr', textAlign: 'right' }}
                            />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Shipping Address */}
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                 <h2 className="text-xl font-serif text-white mb-6 pb-2 border-b border-white/5 flex items-center justify-between">
                    <span>عنوان الشحن</span>
                    <span className="text-xs font-sans text-gray-500 font-normal">خطوة 2 من 3</span>
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">الولاية</label>
                        <div className="relative group">
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gold-500 transition-colors" />
                            <select 
                                required 
                                name="wilaya" 
                                value={formData.wilaya}
                                onChange={handleInputChange} 
                                className="w-full bg-dark-900 border border-white/10 rounded-sm py-4 pr-12 pl-4 text-white appearance-none cursor-pointer focus:border-gold-500 outline-none transition-all"
                            >
                                <option value="" disabled>اختر الولاية</option>
                                {wilayas.map((wilaya) => (
                                <option key={wilaya} value={wilaya} className="bg-dark-900">{wilaya}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">البلدية</label>
                        <div className="relative group">
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gold-500 transition-colors" />
                            <input 
                                required 
                                name="municipality" 
                                onChange={handleInputChange} 
                                className="w-full bg-dark-900 border border-white/10 rounded-sm py-4 pr-12 pl-4 text-white placeholder-gray-600 focus:border-gold-500 outline-none transition-all" 
                                placeholder="مثال: القبة" 
                            />
                        </div>
                    </div>
                 </div>
              </div>

              {/* Delivery Method */}
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                 <h2 className="text-xl font-serif text-white mb-6 pb-2 border-b border-white/5 flex items-center justify-between">
                    <span>طريقة التوصيل</span>
                    <span className="text-xs font-sans text-gray-500 font-normal">خطوة 3 من 3</span>
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                        onClick={() => handleDeliveryChange('stop_desk')}
                        className={`cursor-pointer group relative p-6 rounded-sm border transition-all duration-300 flex flex-col gap-4 ${formData.delivery_method === 'stop_desk' ? 'border-gold-500 bg-gold-500/5 shadow-[0_4px_20px_rgba(212,175,55,0.1)]' : 'border-white/10 bg-dark-900 hover:border-white/20'}`}
                    >
                        <div className="flex justify-between items-start">
                             <div className={`p-3 rounded-full transition-colors ${formData.delivery_method === 'stop_desk' ? 'bg-gold-500 text-dark-900' : 'bg-white/5 text-gray-400 group-hover:bg-white/10'}`}>
                                <Building2 className="w-5 h-5" />
                             </div>
                             {formData.delivery_method === 'stop_desk' && <div className="bg-gold-500 rounded-full p-0.5"><Check className="w-3 h-3 text-dark-900" /></div>}
                        </div>
                        <div>
                            <h3 className={`font-serif text-lg mb-1 ${formData.delivery_method === 'stop_desk' ? 'text-white' : 'text-gray-300'}`}>مكتب التوصيل (Stop Desk)</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">استلم طردك من أقرب مكتب في ولايتك.</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 mt-auto flex justify-between items-center">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">الرسوم</span>
                            <span className={`text-sm font-bold ${formData.delivery_method === 'stop_desk' ? 'text-gold-500' : 'text-gray-400'}`}>+800 د.ج</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => handleDeliveryChange('home_delivery')}
                        className={`cursor-pointer group relative p-6 rounded-sm border transition-all duration-300 flex flex-col gap-4 ${formData.delivery_method === 'home_delivery' ? 'border-gold-500 bg-gold-500/5 shadow-[0_4px_20px_rgba(212,175,55,0.1)]' : 'border-white/10 bg-dark-900 hover:border-white/20'}`}
                    >
                        <div className="flex justify-between items-start">
                             <div className={`p-3 rounded-full transition-colors ${formData.delivery_method === 'home_delivery' ? 'bg-gold-500 text-dark-900' : 'bg-white/5 text-gray-400 group-hover:bg-white/10'}`}>
                                <Truck className="w-5 h-5" />
                             </div>
                             {formData.delivery_method === 'home_delivery' && <div className="bg-gold-500 rounded-full p-0.5"><Check className="w-3 h-3 text-dark-900" /></div>}
                        </div>
                         <div>
                            <h3 className={`font-serif text-lg mb-1 ${formData.delivery_method === 'home_delivery' ? 'text-white' : 'text-gray-300'}`}>توصيل للمنزل</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">توصيل آمن مباشرة إلى باب منزلك.</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 mt-auto flex justify-between items-center">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">الرسوم</span>
                            <span className={`text-sm font-bold ${formData.delivery_method === 'home_delivery' ? 'text-gold-500' : 'text-gray-400'}`}>+400 د.ج</span>
                        </div>
                    </div>
                 </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
              <div className="sticky top-20">
                  <div className="bg-dark-700/50 backdrop-blur-xl rounded-sm border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                      {/* Abstract decorative shapes */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                      
                      <h2 className="text-xl font-serif text-white mb-6">ملخص الطلب</h2>
                      
                      <div className="space-y-6 max-h-[45vh] overflow-y-auto custom-scrollbar mb-8 pr-2 pl-2">
                          {cart.map(item => (
                              <div key={item.id} className="flex gap-4 items-center group">
                                  <div className="h-16 w-16 rounded-sm overflow-hidden bg-dark-900 border border-white/10 shrink-0 group-hover:border-gold-500/30 transition-colors">
                                      <img src={item.images?.[0]} alt={item.name} className="h-full w-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start">
                                          <h3 className="font-serif text-white text-sm truncate pl-2">{item.name}</h3>
                                          <p className="text-gold-500 text-sm font-medium whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} د.ج</p>
                                      </div>
                                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">{item.brand}</p>
                                      <p className="text-gray-600 text-xs">الكمية: {item.quantity}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                      
                      <div className="space-y-3 pt-6 border-t border-white/10">
                          <div className="flex justify-between text-gray-400 text-sm">
                              <span>المجموع الفرعي</span>
                              <span className="text-white">{cartTotal.toLocaleString()} د.ج</span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-sm">
                              <span>الشحن</span>
                              <span className="text-gold-500">+{shippingCost} د.ج</span>
                          </div>
                          
                          <div className="pt-6 mt-4 border-t border-white/10">
                              <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-bold uppercase tracking-widest text-white">الإجمالي</span>
                                <span className="text-3xl font-serif text-gold-500 font-bold">{finalTotal.toLocaleString()} <span className="text-sm font-sans font-normal text-gray-500">د.ج</span></span>
                              </div>
                              <p className="text-left text-xs text-gray-500">شامل جميع الرسوم</p>
                          </div>
                      </div>

                      <button 
                          type="submit" 
                          form="checkout-form"
                          disabled={loading}
                          className="w-full mt-8 bg-gold-500 text-dark-900 py-4 rounded-sm font-bold text-sm uppercase tracking-widest hover:bg-gold-400 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-gold-500/20 flex justify-center items-center gap-3"
                      >
                          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                              <>
                                  <ShieldCheck className="w-5 h-5" />
                                  <span>تأكيد الطلب</span>
                              </>
                          )}
                      </button>
                      
                      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 bg-white/5 py-2 rounded">
                          <CheckCircle2 className="w-3 h-3 text-green-500" /> 
                          <span>الدفع عند الاستلام (كاش)</span>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};