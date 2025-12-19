
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  LogOut,
  PlusCircle,
  ListOrdered,
  DollarSign,
  Menu,
  X,
  Loader2,
  BarChart3,
  Users
} from 'lucide-react';

// تعريف واجهات TypeScript
interface DashboardStats {
  ordersCount: number;
  productsCount: number;
  totalSales: number;
  pendingOrders: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  color?: 'gold' | 'blue' | 'green' | 'red';
  format?: 'number' | 'currency' | 'percent';
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    ordersCount: 0,
    productsCount: 0,
    totalSales: 0,
    pendingOrders: 0
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: products } = await supabase.from('products').select('*', { count: 'exact' });
      
      if (orders) {
        setStats({
          ordersCount: orders.length,
          productsCount: products?.length || 0,
          totalSales: orders.reduce((sum, o) => sum + Number(o.total || 0), 0),
          pendingOrders: orders.filter(o => o.status === 'PENDING').length
        });
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen bg-[#050b18] text-white flex flex-col md:flex-row">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-[#0a1128] border-l border-white/5 flex flex-col z-[58] shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        {/* رأس السايدبار للهواتف */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <img 
              src="https://mayiosolklryjbxxfohi.supabase.co/storage/v1/object/public/logo/logo.png" 
              alt="Quality Time Logo" 
              className="w-8 h-8 filter brightness-110"
            />
            <span className="text-[10px] font-black text-gold tracking-[0.3em] uppercase">Admin</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="hidden md:flex p-10 border-b border-white/5 flex-col items-center gap-2">
          <img 
            src="https://mayiosolklryjbxxfohi.supabase.co/storage/v1/object/public/logo/logo.png" 
            alt="Quality Time Logo" 
            className="w-16 h-16 filter brightness-110"
          />
          <span className="text-[10px] font-black text-gold tracking-[0.3em] uppercase">Admin Portal</span>
        </div>
        <nav className="flex-grow p-6 space-y-3 text-right mt-10 md:mt-0">
          <Link to="/admin/dashboard" className="flex flex-row-reverse items-center gap-4 p-4 bg-gold/10 text-gold border-r-4 border-gold font-black rounded-sm shadow-lg shadow-gold/5">
            <LayoutDashboard size={20} /> لوحة التحكم
          </Link>
          <Link to="/admin/products" className="flex flex-row-reverse items-center gap-4 p-4 text-gray-500 hover:text-white hover:bg-white/5 transition-all rounded-sm">
            <Package size={20} /> إدارة المنتجات
          </Link>
          <Link to="/admin/orders" className="flex flex-row-reverse items-center gap-4 p-4 text-gray-500 hover:text-white hover:bg-white/5 transition-all rounded-sm">
            <ShoppingCart size={20} /> إدارة الطلبات
          </Link>
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex flex-row-reverse items-center justify-center gap-3 p-4 text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-sm">
            <LogOut size={20} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-12 text-right">
        <header className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-12">
          {/* زر القائمة للهواتف */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed top-4 right-4 z-[60] p-3 bg-[#0a1128] border border-white/10 rounded-lg text-white hover:bg-[#c5a059] hover:text-black transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="hidden md:flex bg-neutral-900/50 backdrop-blur-md border border-white/5 px-6 py-3 rounded-sm items-center gap-3 shadow-xl">
            <Clock size={18} className="text-gold" />
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{new Date().toLocaleDateString('ar-DZ')}</span>
          </div>
          <div className="w-full md:w-auto">
                                  </div>
        </header>

        
        {/* Navigation Links */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <h2 className="text-lg font-black mb-6 text-gray-500 uppercase tracking-widest text-[10px]">التنقل السريع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/admin/products" 
              className="luxury-widget p-6 rounded-sm hover:border-[#c5a059]/30 group flex items-center gap-4 transition-all"
            >
              <div className="bg-[#c5a059]/10 p-3 rounded-sm text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-black transition-all">
                <Package size={20} />
              </div>
              <span className="font-bold text-white">إدارة المنتجات</span>
            </Link>

            <Link 
              to="/admin/orders" 
              className="luxury-widget p-6 rounded-sm hover:border-[#c5a059]/30 group flex items-center gap-4 transition-all"
            >
              <div className="bg-[#c5a059]/10 p-3 rounded-sm text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-black transition-all">
                <ListOrdered size={20} />
              </div>
              <span className="font-bold text-white">إدارة الطلبات</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
