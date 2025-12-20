
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
        <div className="fixed inset-0 bg-black/80 z-[55] md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-[#0a1128] border-l border-white/5 flex flex-col z-[58] shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        {/* رأس السايدبار للهواتف */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <img 
              src="https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png" 
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
            src="https://ranhfnjyqwuoiarosxrk.supabase.co/storage/v1/object/public/logo/unnamed2%20(1).png" 
            alt="Quality Time Logo" 
            className="w-16 h-16 filter brightness-110"
          />
          <span className="text-[10px] font-black text-gold tracking-[0.3em] uppercase">Admin Portal</span>
        </div>
        <nav className="flex-grow p-6 space-y-2 text-right">
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3 px-2">القائمة الرئيسية</div>
            <Link to="/admin/dashboard" className="flex flex-row-reverse items-center gap-4 p-4 bg-gold/10 text-gold border-r-4 border-gold font-black rounded-sm shadow-lg shadow-gold/5">
              <LayoutDashboard size={20} /> لوحة التحكم
            </Link>
            <Link to="/admin/products" className="flex flex-row-reverse items-center gap-4 p-4 text-gray-500 hover:text-white hover:bg-white/5 transition-all rounded-sm">
              <Package size={20} /> إدارة المنتجات
            </Link>
            <Link to="/admin/orders" className="flex flex-row-reverse items-center gap-4 p-4 text-gray-500 hover:text-white hover:bg-white/5 transition-all rounded-sm">
              <ShoppingCart size={20} /> إدارة الطلبات
            </Link>
          </div>
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex flex-row-reverse items-center justify-center gap-3 p-4 text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-sm">
            <LogOut size={20} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-8 text-right">
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">لوحة التحكم</h1>
                <p className="text-gray-400 text-sm">مرحباً بك في نظام إدارة المتجر</p>
              </div>
            </div>
            
            <div className="hidden md:flex bg-neutral-900/50 border border-white/5 px-6 py-3 rounded-sm items-center gap-3 shadow-xl">
              <Clock size={18} className="text-gold" />
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{new Date().toLocaleDateString('ar-DZ')}</span>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-6">التنقل السريع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/admin/products" 
              className="bg-[#0a1128]/50 border border-white/10 p-6 rounded-xl hover:border-gold/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gold/10 p-3 rounded-lg text-gold group-hover:bg-gold group-hover:text-black transition-all">
                  <Package size={20} />
                </div>
                <div>
                  <div className="font-bold text-white">المنتجات</div>
                  <div className="text-xs text-gray-400">إدارة المخزون</div>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/orders" 
              className="bg-[#0a1128]/50 border border-white/10 p-6 rounded-xl hover:border-gold/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gold/10 p-3 rounded-lg text-gold group-hover:bg-gold group-hover:text-black transition-all">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <div className="font-bold text-white">الطلبات</div>
                  <div className="text-xs text-gray-400">تتبع الطلبات</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
