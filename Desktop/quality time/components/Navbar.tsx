import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronRight, Search, Home, Watch, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // إخفاء/إظهار الشريط عند التمرير
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  // إغلاق القائمة عند تغيير الصفحة
  useEffect(() => {
    setIsOpen(false);
    setShowSearch(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'المجموعة الكاملة', path: '/products', icon: Watch },
    { name: 'السلة', path: '/cart', icon: ShoppingBag },
  ];

  const adminLinks = [
    { name: 'لوحة التحكم', path: '/admin/dashboard' },
    { name: 'المنتجات', path: '/admin/products' },
    { name: 'الطلبات', path: '/admin/orders' },
    { name: 'العملاء', path: '/admin/customers' },
  ];

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 w-full z-[70] transition-all duration-300 ${
          scrolled 
            ? 'bg-[#050b18]/95 backdrop-blur-xl border-b border-gold/20 shadow-2xl' 
            : 'bg-[#050b18]/80 backdrop-blur-md border-b border-gold/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* الأيقونات اليسرى */}
            <div className="flex items-center gap-2 md:gap-4 order-last md:order-first z-20">
              {/* زر البحث */}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-300 hover:text-[#c5a059] transition-colors"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              
              {/* عداد السلة */}
              <Link to="/cart" className="relative p-2 text-gray-300 hover:text-[#c5a059] transition-colors group">
                <ShoppingCart size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-[#c5a059] text-black text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-lg border border-black/20"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
                {/* تلميح */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  السلة ({cartCount})
                </div>
              </Link>
              
              {/* دخول المسؤول */}
              <Link 
                to={isAdminPage ? "/admin/dashboard" : "/admin/login"} 
                className="hidden sm:flex items-center gap-2 p-2 text-gray-300 hover:text-[#c5a059] transition-colors group"
              >
                <User size={20} strokeWidth={1.5} />
                {/* تلميح */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {isAdminPage ? 'لوحة التحكم' : 'دخول المسؤول'}
                </div>
              </Link>
              
              {/* قائمة الهاتف */}
              <button 
                onClick={() => setIsOpen(true)} 
                className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* الروابط الوسطى (Desktop) */}
            <div className="hidden md:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-[13px] tracking-[0.2em] font-medium uppercase transition-all duration-300 group ${
                    location.pathname === link.path 
                      ? 'text-[#c5a059]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <link.icon size={16} className="opacity-60" />
                    {link.name}
                  </span>
                  
                  {location.pathname === link.path && (
                    <motion.div 
                      layoutId="underline" 
                      className="absolute -bottom-2 left-0 w-full h-[1px] bg-[#c5a059] shadow-lg shadow-[#c5a059]/30"
                    />
                  )}
                  
                  {/* خط تحتي عند hover */}
                  <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white/30 group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </div>

            {/* الشعار */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 md:flex md:items-center z-10">
              <Link 
                to="/" 
                className="flex items-center gap-2 md:gap-3 group active:scale-95 transition-transform"
              >
                {/* اسم الموقع للهاتف */}
                <div className="md:hidden">
                  <span className="text-sm font-serif font-bold tracking-wide">
                    <span className="text-white">Quality</span>
                    <span className="text-[#c5a059]"> Time</span>
                  </span>
                </div>
                
                {/* شعار كامل للكمبيوتر */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-12 h-12 overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png" 
                      alt="Logo" 
                      className="w-9 h-9 object-contain brightness-125"
                    />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-lg font-serif font-bold tracking-tighter text-white leading-none group-hover:text-[#c5a059]/90 transition-colors">
                      QUALITY TIME
                    </span>
                    <span className="text-[9px] tracking-[0.3em] text-[#c5a059]/80 uppercase opacity-90">
                      Luxury Boutique
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* شريط البحث */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gold/10 bg-black/95 backdrop-blur-xl"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن ساعات... (اضغط Enter للبحث)"
                    className="w-full bg-white/5 border border-[#c5a059]/30 rounded-lg py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5a059] hover:text-[#d4b068] transition-colors"
                  >
                    <Search size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* القائمة الجانبية (Mobile Sidebar) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* الخلفية المظلمة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] md:hidden"
            />
            
            {/* محتوى القائمة */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-gradient-to-b from-[#0a1128] to-[#050b18] z-[90] shadow-2xl flex flex-col"
            >
              {/* الهيدر */}
              <div className="p-6 border-b border-gold/10">
                <div className="flex items-center justify-between mb-8">
                  <Link 
                    to="/" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 overflow-hidden">
                      <img 
                        src="https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png" 
                        alt="Logo" 
                        className="w-full h-full object-contain brightness-125"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-serif font-bold text-white">QUALITY TIME</span>
                      <span className="text-[8px] text-[#c5a059]/80 uppercase tracking-widest">Luxury Boutique</span>
                    </div>
                  </Link>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={28} />
                  </button>
                </div>

                {/* حساب المستخدم/المسؤول */}
                <div className="flex items-center justify-between mb-6">
                  <Link 
                    to={isAdminPage ? "/admin/dashboard" : "/admin/login"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-gray-300 hover:text-[#c5a059] transition-colors"
                  >
                    <User size={20} />
                    <span>{isAdminPage ? 'لوحة التحكم' : 'دخول المسؤول'}</span>
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">({cartCount}) منتج</span>
                  </div>
                </div>
              </div>

              {/* روابط التنقل */}
              <div className="flex-1 p-6 overflow-y-auto">
                <nav className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between py-4 px-3 rounded-lg transition-all ${
                          location.pathname === link.path
                            ? 'bg-[#c5a059]/10 text-[#c5a059] border-r-4 border-[#c5a059]'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} className="opacity-70" />
                          <span className="text-base font-medium">{link.name}</span>
                        </div>
                        <ChevronRight 
                          size={18} 
                          className={`transition-transform ${
                            location.pathname === link.path ? 'text-[#c5a059]' : 'text-gray-500'
                          }`} 
                        />
                      </Link>
                    );
                  })}
                </nav>

                {/* روابط المسؤول الإضافية */}
                {isAdminPage && (
                  <div className="mt-10 pt-6 border-t border-white/10">
                    <h3 className="text-sm text-gray-400 mb-4 px-3">إدارة المتجر</h3>
                    <div className="space-y-1">
                      {adminLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between py-3 px-3 rounded-lg transition-all ${
                            location.pathname === link.path
                              ? 'bg-[#c5a059]/10 text-[#c5a059] border-r-4 border-[#c5a059]'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="text-sm">{link.name}</span>
                          <ChevronRight size={16} className="text-gray-500" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* الفوتر */}
              <div className="p-6 border-t border-white/10">
                <p className="text-xs text-center text-gray-500 pt-4">
                  © {new Date().getFullYear()} Quality Time. جميع الحقوق محفوظة.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* مساحة لتعويض ارتفاع الشريط */}
      <div className="h-16 md:h-20" />
    </>
  );
};

export default Navbar;