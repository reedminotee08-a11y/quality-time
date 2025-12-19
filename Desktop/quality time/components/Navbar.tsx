import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  // 1. ميزة إخفاء الشريط عند التمرير لأسفل وإظهاره عند التمرير لأعلى
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // 2. إغلاق القائمة عند تغيير الصفحة أو منع التمرير عند فتحها
  useEffect(() => {
    setIsOpen(false);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [location.pathname, isOpen]);

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'المجموعة الكاملة', path: '/products' },
  ];

  return (
    <>
      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 w-full z-[70] bg-[#050b18]/80 backdrop-blur-xl border-b border-gold/10"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* الأيقونات اليسرى */}
            <div className="flex items-center gap-1 md:gap-5 order-last md:order-first z-20">
               <Link to="/cart" className="relative p-2 md:p-2 text-gray-300 hover:text-[#c5a059] transition-colors">
                <ShoppingCart size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-0 right-0 bg-[#c5a059] text-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-lg"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
              <Link to="/admin/login" className="hidden sm:block p-2 text-gray-300 hover:text-[#c5a059] transition-colors">
                <User size={20} strokeWidth={1.5} />
              </Link>
              <button onClick={() => setIsOpen(true)} className="md:hidden p-2 text-gray-300">
                <Menu size={22} />
              </button>
            </div>

            {/* الروابط الوسطى (Desktop) */}
            <div className="hidden md:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-[13px] tracking-[0.2em] font-medium uppercase transition-colors ${
                    location.pathname === link.path ? 'text-[#c5a059]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div layoutId="underline" className="absolute -bottom-2 left-0 w-full h-[1px] bg-[#c5a059]" />
                  )}
                </Link>
              ))}
            </div>

            {/* الشعار (Center/Right) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 md:flex md:items-center md:gap-3 z-10">
              <Link to="/" className="flex items-center gap-2 md:gap-3 group">
                <div className="flex flex-col text-center md:text-right">
                  <span className="text-sm md:text-lg font-serif font-bold tracking-tighter text-white leading-none">QUALITY TIME</span>
                  <span className="text-[8px] md:text-[9px] tracking-[0.3em] text-[#c5a059] uppercase opacity-80">Luxury Boutique</span>
                </div>
                <img 
                  src="https://mayiosolklryjbxxfohi.supabase.co/storage/v1/object/public/logo/logo.png" 
                  alt="Logo" 
                  className="w-8 h-8 md:w-10 md:h-10 object-contain brightness-125 hidden md:block"
                />
                 <img 
                  src="https://mayiosolklryjbxxfohi.supabase.co/storage/v1/object/public/logo/logo.png" 
                  alt="Logo" 
                  className="w-8 h-8 md:w-10 md:h-10 object-contain brightness-125 md:hidden block mx-auto"
                />
              </Link>
            </div>
          </div>
        </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] md:hidden"
            />
            
            {/* محتوى القائمة */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#0a1128] z-[90] shadow-2xl p-6 md:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-[#c5a059] font-serif font-bold">القائمة</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>

              <nav className="space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center justify-between text-xl text-white group"
                  >
                    <span className={location.pathname === link.path ? "text-[#c5a059]" : ""}>
                      {link.name}
                    </span>
                    <ChevronRight className="text-[#c5a059] opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-10 left-8 right-8">
                <Link 
                  to="/admin/login" 
                  className="block w-full py-4 bg-transparent border border-[#c5a059]/30 text-[#c5a059] text-center text-sm tracking-widest hover:bg-[#c5a059] hover:text-black transition-all"
                >
                  دخول المسؤول
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;