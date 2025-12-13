import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/EnhancedAuthContext';
import { supabase, uploadImage } from '../../lib/supabase';
import { Product, Order } from '../../types';
import { 
  Loader2, Plus, Edit, Trash2, Package, Grid, LogOut, 
  CheckCircle2, XCircle, DollarSign, ShoppingBag, 
  Activity, Search, Filter, ChevronDown, MoreHorizontal,
  Users, TrendingUp, AlertTriangle, Eye, Download,
  Calendar, BarChart3, PieChart, Settings, Bell,
  ArrowUp, ArrowDown, RefreshCw, Copy, Share2
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
}

interface FilterOptions {
  status: string;
  dateRange: string;
  category: string;
  search: string;
}

export const EnhancedAdminDashboard: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers' | 'analytics'>('overview');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalProducts: 0,
    totalCustomers: 0,
    averageOrderValue: 0
  });

  // Filter State
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateRange: '30',
    category: 'all',
    search: ''
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', brand: '', price: 0, description: '', stock_quantity: 0, specs: {}, images: []
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (session) {
      fetchData();
      calculateStats();
    }
  }, [session, filters]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      let productsQuery = supabase.from('products').select('*');
      let ordersQuery = supabase.from('orders').select('*');

      // Apply filters
      if (filters.search) {
        productsQuery = productsQuery.ilike('name', `%${filters.search}%`);
        ordersQuery = ordersQuery.ilike('customer_name', `%${filters.search}%`);
      }

      if (filters.status !== 'all') {
        ordersQuery = ordersQuery.eq('status', filters.status);
      }

      if (filters.dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
        ordersQuery = ordersQuery.gte('created_at', daysAgo.toISOString());
      }

      const { data: productsData } = await productsQuery.order('created_at', { ascending: false });
      if (productsData) setProducts(productsData);

      const { data: ordersData } = await ordersQuery.order('created_at', { ascending: false });
      if (ordersData) setOrders(ordersData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const calculateStats = async () => {
    try {
      const { data: ordersData } = await supabase.from('orders').select('*');
      const { data: productsData } = await supabase.from('products').select('*');

      if (ordersData && productsData) {
        const totalRevenue = ordersData.reduce((acc, order) => 
          order.status !== 'CANCELLED' ? acc + order.total : acc, 0);
        
        const totalCustomers = new Set(ordersData.map(o => o.email)).size;
        const averageOrderValue = ordersData.length > 0 ? totalRevenue / ordersData.length : 0;

        // Calculate growth (mock data for now)
        const revenueGrowth = 12.5;
        const ordersGrowth = 8.3;

        setStats({
          totalRevenue,
          revenueGrowth,
          totalOrders: ordersData.length,
          ordersGrowth,
          pendingOrders: ordersData.filter(o => o.status === 'PENDING').length,
          lowStockProducts: productsData.filter(p => p.stock_quantity < 5).length,
          totalProducts: productsData.length,
          totalCustomers,
          averageOrderValue
        });
      }
    } catch (e) {
      console.error('Error calculating stats:', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      alert('فشل تسجيل الدخول');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      let imageUrls = editingProduct?.images || [];
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (url) imageUrls = [url, ...imageUrls];
      }

      const productData = { ...productForm, images: imageUrls };
      
      if (editingProduct) {
        await supabase.from('products').update(productData).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert([productData]);
      }
      setIsModalOpen(false);
      setImageFile(null);
      setEditingProduct(null);
      setProductForm({ name: '', brand: '', price: 0, description: '', stock_quantity: 0, specs: {}, images: [] });
      fetchData();
    } catch (e) {
        console.error(e);
        alert('خطأ في حفظ المنتج');
    } finally {
        setLoginLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if(!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
      await supabase.from('orders').update({ status }).eq('id', id);
      fetchData();
  };

  const exportData = (type: 'orders' | 'products') => {
    const data = type === 'orders' ? orders : products;
    const csv = data.map(item => Object.values(item).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export.csv`;
    a.click();
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center text-gold-500 bg-dark-800">
      <Loader2 className="animate-spin w-10 h-10" />
    </div>
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2574')] bg-cover opacity-10"></div>
        <div className="w-full max-w-md bg-dark-700/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-white mb-2">لوحة التحكم</h2>
            <p className="text-gray-400">وصول آمن للإدارة فقط</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2 block">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-dark-900/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-gold-500 transition-colors" 
                  placeholder="admin@qualitytime.com" 
                />
            </div>
            <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2 block">كلمة المرور</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-dark-900/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-gold-500 transition-colors" 
                  placeholder="••••••••" 
                />
            </div>
            <button 
              disabled={loginLoading} 
              className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-dark-900 py-4 rounded-lg font-bold hover:shadow-lg hover:shadow-gold-500/20 transition-all transform hover:-translate-y-0.5"
            >
                {loginLoading ? <Loader2 className="animate-spin mx-auto"/> : 'الدخول للوحة التحكم'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-800 pb-12">
      {/* Enhanced Header */}
      <header className="bg-dark-700/50 backdrop-blur-lg border-b border-white/5 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl text-white font-serif font-bold">لوحة التحكم المتقدمة</h1>
                    <p className="text-xs text-gray-400">مرحباً بك مرة أخرى، مدير النظام</p>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-2 bg-dark-900/50 border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        النظام يعمل بشكل طبيعي
                      </div>
                      <button className="relative text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      </button>
                      <button className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button onClick={handleLogout} className="text-gray-400 hover:text-white flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                          <LogOut className="w-4 h-4" /> تسجيل الخروج
                      </button>
                  </div>
              </div>
          </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg group hover:border-gold-500/30 transition-all hover:shadow-gold-500/10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gold-500/10 rounded-lg text-gold-500">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                        <ArrowUp className="w-3 h-3" /> {stats.revenueGrowth}%
                    </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">إجمالي الإيرادات</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalRevenue.toLocaleString()} د.ج</p>
                <p className="text-xs text-gray-500 mt-2">+{Math.round(stats.totalRevenue * 0.125).toLocaleString()} د.ج هذا الشهر</p>
            </div>

            <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg group hover:border-gold-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                        <ArrowUp className="w-3 h-3" /> {stats.ordersGrowth}%
                    </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">إجمالي الطلبات</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-2">متوسط قيمة الطلب: {stats.averageOrderValue.toLocaleString()} د.ج</p>
            </div>

            <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg group hover:border-gold-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                        <Users className="w-6 h-6" />
                    </div>
                    {stats.pendingOrders > 0 && <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">{stats.pendingOrders} في الانتظار</span>}
                </div>
                <h3 className="text-gray-400 text-sm font-medium">العملاء</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalCustomers}</p>
                <p className="text-xs text-gray-500 mt-2">عملاء نشطين</p>
            </div>

            <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg group hover:border-gold-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-pink-500/10 rounded-lg text-pink-400">
                        <Package className="w-6 h-6" />
                    </div>
                     {stats.lowStockProducts > 0 && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">{stats.lowStockProducts} مخزون منخفض</span>}
                </div>
                <h3 className="text-gray-400 text-sm font-medium">المنتجات</h3>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500 mt-2">منتج في الكتالوج</p>
            </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-dark-700/50 p-1 rounded-xl border border-white/5">
            <div className="flex flex-wrap gap-2">
                {[
                  { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
                  { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
                  { id: 'products', label: 'المنتجات', icon: Grid },
                  { id: 'customers', label: 'العملاء', icon: Users },
                  { id: 'analytics', label: 'التحليلات', icon: TrendingUp }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-gold-500 text-dark-900 shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4"/>
                    {tab.label}
                  </button>
                ))}
            </div>
        </div>

        {/* Enhanced Filters and Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="relative group flex-1 lg:w-64">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3 group-focus-within:text-gold-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="بحث..." 
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                        className="w-full bg-dark-700/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
                    />
                </div>
                
                <select 
                  value={filters.status}
                  onChange={e => setFilters({...filters, status: e.target.value})}
                  className="bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
                >
                    <option value="all">كل الحالات</option>
                    <option value="PENDING">في الانتظار</option>
                    <option value="CONFIRMED">مؤكد</option>
                    <option value="SHIPPED">تم الشحن</option>
                    <option value="DELIVERED">تم التوصيل</option>
                    <option value="CANCELLED">ملغي</option>
                </select>

                <select 
                  value={filters.dateRange}
                  onChange={e => setFilters({...filters, dateRange: e.target.value})}
                  className="bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
                >
                    <option value="7">آخر 7 أيام</option>
                    <option value="30">آخر 30 يوم</option>
                    <option value="90">آخر 90 يوم</option>
                    <option value="all">كل الوقت</option>
                </select>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => fetchData()}
                  className="bg-dark-700/50 hover:bg-dark-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4"/> تحديث
                </button>
                
                {(activeTab === 'orders' || activeTab === 'products') && (
                  <button 
                    onClick={() => exportData(activeTab as 'orders' | 'products')}
                    className="bg-dark-700/50 hover:bg-dark-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4"/> تصدير
                  </button>
                )}
                
                {activeTab === 'products' && (
                    <button 
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({ name: '', brand: '', price: 0, description: '', stock_quantity: 0, specs: {}, images: [] });
                        setIsModalOpen(true);
                      }}
                      className="bg-gold-500 hover:bg-gold-400 text-dark-900 px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-gold-500/10"
                    >
                        <Plus className="w-4 h-4"/> إضافة منتج
                    </button>
                )}
            </div>
        </div>

        {/* Content Area with Enhanced Tables */}
        <div className="bg-dark-700/30 rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            {loadingData ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
              </div>
            ) : activeTab === 'overview' ? (
              <div className="p-8">
                <h2 className="text-xl font-bold text-white mb-6">نظرة عامة سريعة</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-dark-800/50 p-6 rounded-lg border border-white/5">
                    <h3 className="text-lg font-medium text-white mb-4">آخر الطلبات</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-dark-900/50 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{order.customer_name}</p>
                            <p className="text-gray-500 text-sm">{order.total.toLocaleString()} د.ج</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 
                            order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-dark-800/50 p-6 rounded-lg border border-white/5">
                    <h3 className="text-lg font-medium text-white mb-4">المنتجات منخفضة المخزون</h3>
                    <div className="space-y-3">
                      {products.filter(p => p.stock_quantity < 5).slice(0, 5).map(product => (
                        <div key={product.id} className="flex justify-between items-center p-3 bg-dark-900/50 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            <p className="text-gray-500 text-sm">{product.brand}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500">
                            {product.stock_quantity} متبقي
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'orders' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-900/50 text-gray-400 font-medium uppercase text-xs tracking-wider border-b border-white/5">
                            <tr>
                                <th className="p-5">تفاصيل الطلب</th>
                                <th className="p-5">العميل</th>
                                <th className="p-5">المبلغ</th>
                                <th className="p-5">الحالة</th>
                                <th className="p-5">التاريخ</th>
                                <th className="p-5 text-right">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-5">
                                        <div className="font-mono text-gold-500 font-medium">{order.id}</div>
                                        <div className="text-gray-500 text-xs mt-1">{order.items.length} عناصر</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-white font-medium">{order.customer_name}</div>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                        <div className="text-xs text-gray-500">{order.email}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-bold text-white">{order.total.toLocaleString()} د.ج</div>
                                        <div className="text-xs text-gray-500">{order.delivery_method === 'stop_desk' ? 'نقطة التوقف' : 'توصيل للمنزل'}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                            order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                order.status === 'PENDING' ? 'bg-yellow-500' : 
                                                order.status === 'DELIVERED' ? 'bg-green-500' :
                                                order.status === 'CANCELLED' ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`}></span>
                                            {order.status === 'PENDING' ? 'في الانتظار' :
                                             order.status === 'DELIVERED' ? 'تم التوصيل' :
                                             order.status === 'CANCELLED' ? 'ملغي' :
                                             order.status === 'CONFIRMED' ? 'مؤكد' :
                                             order.status === 'SHIPPED' ? 'تم الشحن' : order.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-blue-400 hover:text-blue-400 text-gray-400 transition-colors">
                                                <Eye className="w-4 h-4"/>
                                            </button>
                                            <button className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-green-400 hover:text-green-400 text-gray-400 transition-colors">
                                                <Copy className="w-4 h-4"/>
                                            </button>
                                            <div className="relative inline-block">
                                                <select 
                                                    value={order.status} 
                                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                    className="bg-dark-900 border border-white/10 rounded-md py-1.5 pl-3 pr-8 text-xs text-white outline-none appearance-none cursor-pointer hover:border-gold-500 focus:border-gold-500 transition-colors"
                                                >
                                                    <option value="PENDING">في الانتظار</option>
                                                    <option value="CONFIRMED">مؤكد</option>
                                                    <option value="SHIPPED">تم الشحن</option>
                                                    <option value="DELIVERED">تم التوصيل</option>
                                                    <option value="CANCELLED">ملغي</option>
                                                </select>
                                                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : activeTab === 'products' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-900/50 text-gray-400 font-medium uppercase text-xs tracking-wider border-b border-white/5">
                            <tr>
                                <th className="p-5">المنتج</th>
                                <th className="p-5">السعر</th>
                                <th className="p-5">المخزون</th>
                                <th className="p-5">الحالة</th>
                                <th className="p-5 text-right">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded bg-dark-900 border border-white/10 overflow-hidden flex-shrink-0">
                                                <img src={product.images?.[0]} className="w-full h-full object-cover" alt=""/>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-gold-500 font-mono font-medium">{product.price.toLocaleString()} د.ج</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-white">{product.stock_quantity} <span className="text-gray-500 text-xs">قطعة</span></div>
                                    </td>
                                    <td className="p-5">
                                        {product.stock_quantity > 5 ? (
                                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">متوفر</span>
                                        ) : product.stock_quantity > 0 ? (
                                            <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">مخزون منخفض</span>
                                        ) : (
                                            <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">نفد المخزون</span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setProductForm(product);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-blue-400 hover:text-blue-400 text-gray-400 transition-colors"
                                            >
                                                <Edit className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-red-400 hover:text-red-400 text-gray-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : activeTab === 'customers' ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>قسم العملاء قيد التطوير</p>
              </div>
            ) : activeTab === 'analytics' ? (
              <div className="p-8 text-center text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>قسم التحليلات قيد التطوير</p>
              </div>
            ) : null}
            
            {/* Empty States */}
            {((activeTab === 'orders' && orders.length === 0) || (activeTab === 'products' && products.length === 0)) && !loadingData && (
                <div className="p-12 text-center text-gray-500">
                    <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 opacity-50"/>
                    </div>
                    <p>لا توجد سجلات found.</p>
                </div>
            )}
        </div>
      </div>

      {/* Enhanced Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-dark-800 w-full max-w-2xl rounded-xl border border-white/10 max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-700/50">
                    <div>
                        <h2 className="text-xl text-white font-serif font-bold">{editingProduct ? 'تعديل الساعة' : 'إضافة ساعة جديدة'}</h2>
                        <p className="text-xs text-gray-400 mt-1">املأ التفاصيل أدناه لتحديث الكتالوج الخاص بك.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"><XCircle /></button>
                </div>
                
                <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">اسم المنتج</label>
                            <input className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="مثال: Royal Oak" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">اسم العلامة التجارية</label>
                            <input className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="مثال: Audemars Piguet" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">السعر (د.ج)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500 font-serif">د.ج</span>
                                <input type="number" className="w-full bg-dark-900 border border-white/10 p-3 pl-16 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="0.00" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">كمية المخزون</label>
                            <input type="number" className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="0" value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: parseInt(e.target.value)})} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">الوصف</label>
                        <textarea rows={4} className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="وصف تفصيلي للساعة..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">المواصفات</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="الحركة: Automatic" />
                            <input className="w-full bg-dark-900 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500 transition-colors" placeholder="مقاومة الماء: 100m" />
                        </div>
                    </div>
                    
                    <div className="bg-dark-900/50 p-4 rounded-lg border border-white/10 border-dashed hover:border-gold-500/50 transition-colors">
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                            <div className="bg-white/5 p-3 rounded-full mb-3 text-gold-500">
                                <Package className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-white mb-1">رفع صورة المنتج</span>
                            <span className="text-xs text-gray-500 mb-4">PNG, JPG حتى 5MB</span>
                            <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden"/>
                            <div className="bg-white/10 text-white px-4 py-2 rounded text-xs font-bold hover:bg-white/20 transition-colors">
                                {imageFile ? imageFile.name : 'اختر ملف'}
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-gray-400 hover:text-white transition-colors">إلغاء</button>
                        <button type="submit" disabled={loginLoading} className="bg-gold-500 text-dark-900 px-6 py-2 rounded-lg font-bold hover:bg-gold-400 shadow-lg shadow-gold-500/20 transition-all transform hover:-translate-y-0.5">
                             {loginLoading ? <Loader2 className="animate-spin" /> : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
