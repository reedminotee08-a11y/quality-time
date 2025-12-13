import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Order, Product } from '../../types';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package,
  Calendar, BarChart3, PieChart, Activity, ArrowUp, ArrowDown,
  Download, RefreshCw, Eye, Filter, Clock, AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Product[];
  recentOrders: Order[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  categoryRevenue: { category: string; revenue: number; percentage: number }[];
  customerStats: { new: number; returning: number; total: number };
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'customers'>('revenue');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
      
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      if (orders && products) {
        const analyticsData = calculateAnalytics(orders, products);
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (orders: Order[], products: Product[]): AnalyticsData => {
    const validOrders = orders.filter(order => order.status !== 'CANCELLED');
    
    // Basic metrics
    const totalRevenue = validOrders.reduce((acc, order) => acc + order.total, 0);
    const totalOrders = validOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Customer metrics
    const uniqueCustomers = new Set(validOrders.map(order => order.email).filter(Boolean));
    const totalCustomers = uniqueCustomers.size;
    
    // Calculate growth (mock data for demonstration)
    const revenueGrowth = 15.3;
    const ordersGrowth = 8.7;
    const customersGrowth = 12.1;
    
    // Top products by sales
    const productSales = new Map<string, { product: Product; quantity: number; revenue: number }>();
    
    validOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.name);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          const product = products.find(p => p.name === item.name);
          if (product) {
            productSales.set(item.name, {
              product,
              quantity: item.quantity,
              revenue: item.price * item.quantity
            });
          }
        }
      });
    });
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(item => item.product);

    // Monthly revenue data
    const monthlyRevenue = generateMonthlyData(validOrders);
    
    // Category revenue
    const categoryRevenue = calculateCategoryRevenue(validOrders, products);
    
    // Customer stats
    const customerStats = calculateCustomerStats(validOrders);
    
    // Conversion rate (mock data)
    const conversionRate = 3.2;

    return {
      totalRevenue,
      revenueGrowth,
      totalOrders,
      ordersGrowth,
      totalCustomers,
      customersGrowth,
      totalProducts: products.length,
      averageOrderValue,
      conversionRate,
      topProducts,
      recentOrders: orders.slice(0, 10),
      monthlyRevenue,
      categoryRevenue,
      customerStats
    };
  };

  const generateMonthlyData = (orders: Order[]) => {
    const monthlyData = new Map<string, { revenue: number; orders: number }>();
    
    orders.forEach(order => {
      const month = new Date(order.created_at).toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' });
      const existing = monthlyData.get(month) || { revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      monthlyData.set(month, existing);
    });
    
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .slice(-12); // Last 12 months
  };

  const calculateCategoryRevenue = (orders: Order[], products: Product[]) => {
    const categoryData = new Map<string, number>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.name === item.name);
        if (product) {
          const category = product.brand;
          const existing = categoryData.get(category) || 0;
          categoryData.set(category, existing + (item.price * item.quantity));
        }
      });
    });
    
    const total = Array.from(categoryData.values()).reduce((acc, val) => acc + val, 0);
    
    return Array.from(categoryData.entries())
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: total > 0 ? (revenue / total) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  };

  const calculateCustomerStats = (orders: Order[]) => {
    const customerOrders = new Map<string, number>();
    
    orders.forEach(order => {
      if (order.email) {
        const existing = customerOrders.get(order.email) || 0;
        customerOrders.set(order.email, existing + 1);
      }
    });
    
    const newCustomers = Array.from(customerOrders.values()).filter(count => count === 1).length;
    const returningCustomers = Array.from(customerOrders.values()).filter(count => count > 1).length;
    
    return {
      new: newCustomers,
      returning: returningCustomers,
      total: customerOrders.size
    };
  };

  const exportReport = () => {
    if (!data) return;
    
    const reportData = {
      summary: {
        totalRevenue: data.totalRevenue,
        totalOrders: data.totalOrders,
        totalCustomers: data.totalCustomers,
        averageOrderValue: data.averageOrderValue,
        conversionRate: data.conversionRate
      },
      topProducts: data.topProducts.map(p => ({ name: p.name, brand: p.brand, price: p.price })),
      categoryRevenue: data.categoryRevenue,
      customerStats: data.customerStats,
      monthlyRevenue: data.monthlyRevenue
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-12 h-12 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 bg-dark-700/30 rounded-xl border border-white/5">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
        <p className="text-gray-400 text-lg">لا توجد بيانات تحليلية</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">لوحة التحليلات</h2>
          <p className="text-gray-400 text-sm mt-1">نظرة شاملة على أداء المتجر</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-dark-700/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
          >
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوم</option>
            <option value="90">آخر 90 يوم</option>
            <option value="365">آخر سنة</option>
          </select>
          
          <button
            onClick={exportReport}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-500 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> تصدير التقرير
          </button>
          
          <button
            onClick={fetchAnalyticsData}
            className="bg-dark-700/50 hover:bg-dark-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg hover:border-gold-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gold-500/10 rounded-lg text-gold-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
              data.revenueGrowth > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {data.revenueGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(data.revenueGrowth)}%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">إجمالي الإيرادات</h3>
          <p className="text-2xl font-bold text-white mt-1">{data.totalRevenue.toLocaleString()} د.ج</p>
          <p className="text-xs text-gray-500 mt-2">متوسط قيمة الطلب: {data.averageOrderValue.toLocaleString()} د.ج</p>
        </div>

        <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg hover:border-gold-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
              data.ordersGrowth > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {data.ordersGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(data.ordersGrowth)}%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">إجمالي الطلبات</h3>
          <p className="text-2xl font-bold text-white mt-1">{data.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-2">معدل التحويل: {data.conversionRate}%</p>
        </div>

        <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg hover:border-gold-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
              data.customersGrowth > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {data.customersGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(data.customersGrowth)}%
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">العملاء</h3>
          <p className="text-2xl font-bold text-white mt-1">{data.totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-2">جدد: {data.customerStats.new} | عائدون: {data.customerStats.returning}</p>
        </div>

        <div className="bg-dark-700/50 backdrop-blur p-6 rounded-xl border border-white/5 shadow-lg hover:border-gold-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink-500/10 rounded-lg text-pink-400">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">المنتجات</h3>
          <p className="text-2xl font-bold text-white mt-1">{data.totalProducts}</p>
          <p className="text-xs text-gray-500 mt-2">منتج في الكتالوج</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-dark-700/30 rounded-xl border border-white/5 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">اتجاهات الإيرادات</h3>
            <div className="flex gap-2">
              {['revenue', 'orders', 'customers'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedMetric === metric
                      ? 'bg-gold-500 text-dark-900'
                      : 'bg-dark-900/50 text-gray-400 hover:text-white'
                  }`}
                >
                  {metric === 'revenue' ? 'الإيرادات' : metric === 'orders' ? 'الطلبات' : 'العملاء'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center bg-dark-900/50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">مخطط الإيرادات</p>
              <p className="text-sm text-gray-500 mt-2">سيتم عرض البيانات هنا</p>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-dark-700/30 rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-medium text-white mb-6">توزيع الإيرادات حسب الفئة</h3>
          
          <div className="h-64 flex items-center justify-center bg-dark-900/50 rounded-lg">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">مخطط الفئات</p>
              <p className="text-sm text-gray-500 mt-2">سيتم عرض البيانات هنا</p>
            </div>
          </div>
          
          {/* Category List */}
          <div className="mt-6 space-y-3">
            {data.categoryRevenue.map((category, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gold-500"></div>
                  <span className="text-sm text-gray-300">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{category.revenue.toLocaleString()} د.ج</p>
                  <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-dark-700/30 rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-medium text-white mb-6">أفضل المنتجات مبيعاً</h3>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold-500/20 rounded-lg flex items-center justify-center text-gold-500 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                </div>
                <p className="text-gold-500 font-bold">{product.price.toLocaleString()} د.ج</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Stats */}
        <div className="bg-dark-700/30 rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-medium text-white mb-6">إحصائيات العملاء</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">العملاء الجدد</span>
                <span className="text-sm font-medium text-white">{data.customerStats.new}</span>
              </div>
              <div className="w-full bg-dark-900/50 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(data.customerStats.new / data.customerStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">العملاء العائدين</span>
                <span className="text-sm font-medium text-white">{data.customerStats.returning}</span>
              </div>
              <div className="w-full bg-dark-900/50 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(data.customerStats.returning / data.customerStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-dark-900/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">معدل الاحتفاظ بالعملاء</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {((data.customerStats.returning / data.customerStats.total) * 100).toFixed(1)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-gold-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance Table */}
      <div className="bg-dark-700/30 rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-medium text-white mb-6">الأداء الشهري</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400 font-medium uppercase text-xs tracking-wider border-b border-white/5">
              <tr>
                <th className="p-3 text-right">الشهر</th>
                <th className="p-3 text-right">الإيرادات</th>
                <th className="p-3 text-right">الطلبات</th>
                <th className="p-3 text-right">متوسط الطلب</th>
                <th className="p-3 text-right">النمو</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.monthlyRevenue.slice(-6).reverse().map((month, index) => {
                const avgOrder = month.orders > 0 ? month.revenue / month.orders : 0;
                const growth = index < data.monthlyRevenue.length - 1 ? 
                  ((month.revenue - data.monthlyRevenue[data.monthlyRevenue.length - 2 - index].revenue) / 
                   data.monthlyRevenue[data.monthlyRevenue.length - 2 - index].revenue * 100) : 0;
                
                return (
                  <tr key={month.month} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-white">{month.month}</td>
                    <td className="p-3 text-gold-500 font-medium">{month.revenue.toLocaleString()} د.ج</td>
                    <td className="p-3 text-white">{month.orders}</td>
                    <td className="p-3 text-white">{avgOrder.toLocaleString()} د.ج</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                        growth > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {growth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(growth).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
