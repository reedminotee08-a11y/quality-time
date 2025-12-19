import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ArrowLeft,
  Phone,
  Printer,
  Download,
  Eye,
  MoreVertical,
  User,
  MapPin,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  BarChart3,
  Shield,
  ChevronRight,
  ExternalLink,
  Bell,
  Package2,
  TrendingDown,
  TrendingUp as TrendUpIcon,
  Trash2
} from 'lucide-react';
import Button from '../components/Button';
import { Order, OrderItem } from '../types';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    revenue: 0
  });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [printLoading, setPrintLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setOrders(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: Order[]) => {
    const total = ordersData.length;
    const pending = ordersData.filter(o => o.status === 'PENDING').length;
    const delivered = ordersData.filter(o => o.status === 'DELIVERED').length;
    const revenue = ordersData
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    
    setStats({ total, pending, delivered, revenue });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const s = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      try { return val.name || val.id || JSON.stringify(val); } catch (e) { return 'Object'; }
    }
    return String(val);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // تحديث القائمة المحلية
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status: newStatus as any } : order
      ));
      
      // تحديث الطلب المحدد
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
      
      // إعادة حساب الإحصائيات
      calculateStats(orders.map(order => 
        order.id === id ? { ...order, status: newStatus as any } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      
      setOrders(prev => prev.filter(order => order.id !== id));
      setSelectedOrder(null);
      setShowDeleteConfirm(null);
      calculateStats(orders.filter(order => order.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handlePrintInvoice = useCallback((order: Order) => {
    setPrintLoading(true);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة');
      setPrintLoading(false);
      return;
    }

    const invoiceHTML = generateInvoiceHTML(order);
    
    // إضافة مؤشر تحميل للنافذة المنبثقة
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>جار تحميل الفاتورة...</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
          }
          .loading {
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #c5a059;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loading">
          <div class="spinner"></div>
          <p>جار تحميل الفاتورة...</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();
      
      // إضافة تأخير قبل الطباعة للسماح بتحميل الصور
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setPrintLoading(false);
      }, 500);
    }, 100);
  }, []);

  const generateInvoiceHTML = (order: Order): string => {
    const currentDate = new Date().toLocaleDateString('ar-DZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const orderDate = new Date(order.created_at).toLocaleDateString('ar-DZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const getStatusText = (status: string) => {
      switch(status) {
        case 'PENDING': return 'معلق';
        case 'PROCESSING': return 'قيد المعالجة';
        case 'DELIVERED': return 'تم التسليم';
        case 'CANCELLED': return 'ملغى';
        default: return status;
      }
    };

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاتورة طلب #${order.id}</title>
        <style>
          @page {
            margin: 20mm;
            size: A4;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', 'Arial', sans-serif;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            line-height: 1.6;
            color: #2d3748;
            background: white;
            padding: 20px;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .invoice-header {
            background: linear-gradient(135deg, #050b18 0%, #0a1128 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .invoice-header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(197, 160, 89, 0.2) 0%, transparent 70%);
          }
          
          .invoice-header h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #c5a059;
          }
          
          .invoice-header .subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 20px;
          }
          
          .header-info {
            display: flex;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.1);
            padding: 15px 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
          
          .header-info div {
            text-align: center;
            flex: 1;
          }
          
          .header-info .label {
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 5px;
          }
          
          .header-info .value {
            font-size: 16px;
            font-weight: bold;
            color: #c5a059;
          }
          
          .invoice-body {
            padding: 40px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            color: #c5a059;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .customer-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .info-item {
            margin-bottom: 10px;
          }
          
          .info-label {
            font-size: 12px;
            color: #718096;
            margin-bottom: 5px;
            font-weight: 500;
          }
          
          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #2d3748;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .items-table th {
            background: #f7fafc;
            color: #4a5568;
            padding: 12px 15px;
            text-align: right;
            font-size: 12px;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table td {
            padding: 15px;
            text-align: right;
            font-size: 13px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
          }
          
          .item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          
          .item-details {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .item-name {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
          }
          
          .item-sku {
            font-size: 11px;
            color: #718096;
          }
          
          .total-section {
            background: #f8fafc;
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            margin-top: 30px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .total-row:last-child {
            border-bottom: none;
          }
          
          .total-row.grand-total {
            font-size: 24px;
            font-weight: bold;
            color: #c5a059;
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            color: #718096;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            margin-top: 30px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-pending { background: #fed7d7; color: #c53030; }
          .status-processing { background: #bee3f8; color: #2b6cb0; }
          .status-delivered { background: #c6f6d5; color: #276749; }
          .status-cancelled { background: #e2e8f0; color: #4a5568; }
          
          @media print {
            body { padding: 0; }
            .invoice-container { box-shadow: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>فاتورة بيع</h1>
            <div class="subtitle">نظام إدارة الطلبات المتقدم</div>
            
            <div class="header-info">
              <div>
                <div class="label">رقم الفاتورة</div>
                <div class="value">#${order.id}</div>
              </div>
              <div>
                <div class="label">تاريخ الفاتورة</div>
                <div class="value">${currentDate}</div>
              </div>
              <div>
                <div class="label">حالة الطلب</div>
                <div class="status-badge status-${order.status.toLowerCase()}">
                  ${getStatusText(order.status)}
                </div>
              </div>
            </div>
          </div>
          
          <div class="invoice-body">
            <div class="section">
              <div class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                بيانات العميل
              </div>
              
              <div class="customer-info">
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">الاسم الكامل</div>
                    <div class="info-value">${order.customer_name}</div>
                  </div>
                  
                  ${order.phone ? `
                  <div class="info-item">
                    <div class="info-label">رقم الهاتف</div>
                    <div class="info-value">${order.phone}</div>
                  </div>
                  ` : ''}
                  
                  ${order.email ? `
                  <div class="info-item">
                    <div class="info-label">البريد الإلكتروني</div>
                    <div class="info-value">${order.email}</div>
                  </div>
                  ` : ''}
                  
                  ${order.wilaya ? `
                  <div class="info-item">
                    <div class="info-label">الولاية</div>
                    <div class="info-value">${order.wilaya}</div>
                  </div>
                  ` : ''}
                  
                  ${order.shipping_address || order.address ? `
                  <div class="info-item">
                    <div class="info-label">عنوان التوصيل</div>
                    <div class="info-value">${order.shipping_address || order.address}</div>
                  </div>
                  ` : ''}
                  
                  <div class="info-item">
                    <div class="info-label">تاريخ الطلب</div>
                    <div class="info-value">${orderDate}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                المنتجات المطلوبة
              </div>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map((item, index) => `
                    <tr>
                      <td>
                        ${item.image ? `
                          <img src="${item.image}" alt="${item.name}" class="item-image">
                        ` : `
                          <div style="width: 60px; height: 60px; background: #f7fafc; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #cbd5e0;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          </div>
                        `}
                      </td>
                      <td>
                        <div class="item-details">
                          <div>
                            <div class="item-name">${item.name}</div>
                            ${item.brand ? `<div class="item-sku">${item.brand}</div>` : ''}
                          </div>
                        </div>
                      </td>
                      <td>${item.quantity}</td>
                      <td>${Number(item.price).toLocaleString('ar-DZ')} دج</td>
                      <td><strong>${(Number(item.price) * Number(item.quantity)).toLocaleString('ar-DZ')} دج</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="total-section">
              <div class="total-row">
                <span>عدد المنتجات:</span>
                <span>${order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</span>
              </div>
              
              ${order.shipping_cost ? `
              <div class="total-row">
                <span>تكلفة الشحن:</span>
                <span>${Number(order.shipping_cost).toLocaleString('ar-DZ')} دج</span>
              </div>
              ` : ''}
              
              ${order.tax ? `
              <div class="total-row">
                <span>الضريبة:</span>
                <span>${Number(order.tax).toLocaleString('ar-DZ')} دج</span>
              </div>
              ` : ''}
              
              <div class="total-row grand-total">
                <span>المبلغ الإجمالي:</span>
                <span>${Number(order.total).toLocaleString('ar-DZ')} دج</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>شكراً لثقتكم بنا - نتمنى لكم تجربة تسوق ممتعة</p>
            <p>لأي استفسار، يرجى التواصل مع خدمة العملاء</p>
            <p style="margin-top: 10px; font-size: 10px; opacity: 0.7;">فاتورة نظامية - ${order.id} - ${currentDate}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const filteredOrders = orders;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { 
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        icon: <Clock size={12} />,
        text: 'معلق'
      },
      PROCESSING: { 
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        icon: <RefreshCw size={12} />,
        text: 'قيد التنفيذ'
      },
      DELIVERED: { 
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        icon: <CheckCircle size={12} />,
        text: 'تم التسليم'
      },
      CANCELLED: { 
        color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        icon: <XCircle size={12} />,
        text: 'ملغى'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      icon: null,
      text: status
    };
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${config.color} border`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const StatCard = ({ title, value, change, icon, color }: any) => (
    <div className={`luxury-widget p-6 rounded-xl border ${color} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold">{value}</div>
        <div className={`p-3 rounded-lg ${color.split(' ')[0]}`}>
          {icon}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-400">{title}</div>
      {change && (
        <div className={`text-xs mt-2 ${change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change > 0 ? <TrendUpIcon size={12} className="inline" /> : <TrendingDown size={12} className="inline" />}
          {Math.abs(change)}% من الشهر الماضي
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b18] via-[#0a1128] to-[#050b18] text-white flex flex-col md:flex-row">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] md:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-[#0a1128]/95 backdrop-blur-xl border-l border-white/10 flex flex-col z-[58] shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img 
                src="https://mayiosolklryjbxxfohi.supabase.co/storage/v1/object/public/logo/logo.png" 
                alt="Logo" 
                className="w-16 h-16 filter brightness-110"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-[#0a1128]"></div>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black text-gold tracking-[0.3em] uppercase block">Orders Manager</span>
              <span className="text-[8px] text-gray-500 font-medium mt-1 block">V 1.0.0</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-grow p-6 space-y-2 text-right">
          <div className="mb-4">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3 px-2">القائمة الرئيسية</div>
            <Link 
              to="/admin/dashboard" 
              className="flex flex-row-reverse items-center gap-4 p-4 text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-lg group"
            >
              <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">لوحة التحكم</span>
            </Link>
            <Link 
              to="/admin/products" 
              className="flex flex-row-reverse items-center gap-4 p-4 text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-lg group"
            >
              <Package size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">المنتجات</span>
            </Link>
            <Link 
              to="/admin/orders" 
              className="flex flex-row-reverse items-center gap-4 p-4 bg-gradient-to-l from-gold/20 to-transparent text-gold border-r-2 border-gold font-bold rounded-lg shadow-lg shadow-gold/10"
            >
              <ShoppingCart size={20} />
              <span>الطلبات</span>
              <span className="mr-auto bg-gold/20 text-gold text-xs px-2 py-1 rounded-full">
                {stats.total}
              </span>
            </Link>
          </div>
        </nav>
        
        <div className="p-6 border-t border-white/10">
          <Button 
            variant="danger" 
            fullWidth
            onClick={handleLogout}
            className="shadow-lg shadow-red-500/10"
          >
            <LogOut size={18} className="ml-2" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 text-right">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="فتح القائمة"
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link to="/admin/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-gold hover:text-black transition-colors group">
                    <ArrowLeft size={18} className="group-hover:scale-110 transition-transform" />
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">إدارة الطلبات</h1>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold rounded-full text-sm">
                    <Shield size={14} />
                    <span>مسؤول النظام</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">إدارة وتتبع جميع طلبات العملاء</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={fetchOrders}
                className="shadow-lg"
              >
                <RefreshCw size={18} className="ml-2" />
                تحديث
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي الطلبات"
              value={stats.total}
              change={12}
              icon={<ShoppingCart size={24} className="text-blue-400" />}
              color="bg-blue-500/10 text-blue-400 border-blue-500/20"
            />
            <StatCard
              title="طلبات معلقة"
              value={stats.pending}
              change={-5}
              icon={<Clock size={24} className="text-amber-400" />}
              color="bg-amber-500/10 text-amber-400 border-amber-500/20"
            />
            <StatCard
              title="طلبات مسلمة"
              value={stats.delivered}
              change={18}
              icon={<CheckCircle size={24} className="text-emerald-400" />}
              color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            />
            <StatCard
              title="إجمالي الإيرادات"
              value={`${stats.revenue.toLocaleString()} دج`}
              change={25}
              icon={<DollarSign size={24} className="text-gold" />}
              color="bg-gold/10 text-gold border-gold/20"
            />
          </div>

        </header>

        {/* Orders Table */}
        <div className="bg-[#0a1128]/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-black/30 border-b border-white/10">
                <tr>
                  <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الطلب</th>
                  <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">العميل</th>
                  <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">التاريخ</th>
                  <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">المبلغ</th>
                  <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الحالة</th>
                  <th className="p-6 font-bold text-gray-400 text-sm uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-6">
                      <div className="font-mono text-sm text-gold font-bold">#{order.id}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items.length} منتج
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gold/20 to-transparent rounded-lg flex items-center justify-center">
                          <User size={18} className="text-gold" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{order.customer_name}</div>
                          {order.phone && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Phone size={12} />
                              {order.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm text-white">
                        {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-lg font-bold text-gold">
                        {Number(order.total).toLocaleString()} دج
                      </div>
                      <div className="text-xs text-gray-500">
                        شامل الشحن
                      </div>
                    </td>
                    <td className="p-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintInvoice(order);
                          }}
                          loading={printLoading && selectedOrder?.id === order.id}
                        >
                          <Printer size={16} />
                        </Button>
                        <Button
                          variant="primary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        <div className="lg:hidden">
                          <button 
                            className="p-2 text-gray-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={48} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">لا توجد طلبات</h3>
              <p className="text-gray-400 mb-8">لم يتم العثور على طلبات تطابق معايير البحث</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-lg font-bold text-white mb-2">جاري تحميل الطلبات</h3>
              <p className="text-gray-400">يرجى الانتظار...</p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="bg-[#0a1128] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#0a1128] border-b border-white/10 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <X size={24} />
                  </Button>
                  <div>
                    <h3 className="text-xl font-bold text-white">تفاصيل الطلب</h3>
                    <div className="text-sm text-gray-400">#{selectedOrder.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedOrder.status)}
                  <Button
                    variant="secondary"
                    onClick={() => handlePrintInvoice(selectedOrder)}
                    loading={printLoading}
                  >
                    <Printer size={18} className="ml-2" />
                    طباعة
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="luxury-widget p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <User size={20} className="text-blue-400" />
                      </div>
                      <h4 className="text-lg font-bold">معلومات العميل</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">الاسم الكامل</div>
                        <div className="font-bold text-white">{selectedOrder.customer_name}</div>
                      </div>
                      {selectedOrder.phone && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">رقم الهاتف</div>
                          <a href={`tel:${selectedOrder.phone}`} className="font-medium text-gold hover:text-gold/80 transition-colors">
                            {selectedOrder.phone}
                          </a>
                        </div>
                      )}
                      {selectedOrder.email && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">البريد الإلكتروني</div>
                          <a href={`mailto:${selectedOrder.email}`} className="font-medium text-gold hover:text-gold/80 transition-colors">
                            {selectedOrder.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="luxury-widget p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <MapPin size={20} className="text-emerald-400" />
                      </div>
                      <h4 className="text-lg font-bold">عنوان التوصيل</h4>
                    </div>
                    <div className="space-y-3">
                      {selectedOrder.wilaya && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">الولاية</div>
                          <div className="font-bold text-white">{selectedOrder.wilaya}</div>
                        </div>
                      )}
                      {(selectedOrder.shipping_address || selectedOrder.address) && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">العنوان التفصيلي</div>
                          <div className="font-medium text-white">{selectedOrder.shipping_address || selectedOrder.address}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="luxury-widget p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Calendar size={20} className="text-amber-400" />
                      </div>
                      <h4 className="text-lg font-bold">معلومات الطلب</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">تاريخ الطلب</div>
                        <div className="font-bold text-white">
                          {new Date(selectedOrder.created_at).toLocaleDateString('ar-DZ', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">وقت الطلب</div>
                        <div className="font-medium text-white">
                          {new Date(selectedOrder.created_at).toLocaleTimeString('ar-DZ', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      {selectedOrder.updated_at && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">آخر تحديث</div>
                          <div className="font-medium text-white">
                            {new Date(selectedOrder.updated_at).toLocaleDateString('ar-DZ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold">المنتجات المطلوبة</h4>
                    <div className="text-sm text-gray-400">
                      {selectedOrder.items.length} منتج
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="luxury-widget p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-black/30 rounded-lg border border-white/10 overflow-hidden">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package2 size={24} className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white mb-1">{item.name}</div>
                              {item.brand && (
                                <div className="text-sm text-gray-400">{item.brand}</div>
                              )}
                              <div className="text-xs text-gray-500 mt-2">
                                الكمية: {item.quantity}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gold">
                              {(Number(item.price) * Number(item.quantity)).toLocaleString()} دج
                            </div>
                            <div className="text-sm text-gray-400">
                              {Number(item.price).toLocaleString()} دج للقطعة
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="luxury-widget p-6 rounded-xl mb-8">
                  <h4 className="text-lg font-bold mb-6">ملخص الطلب</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-gray-400">إجمالي المنتجات</span>
                      <span className="font-medium text-white">
                        {selectedOrder.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} منتج
                      </span>
                    </div>
                    
                    {selectedOrder.shipping_cost && (
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-gray-400">تكلفة الشحن</span>
                        <span className="font-medium text-white">
                          {Number(selectedOrder.shipping_cost).toLocaleString()} دج
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.tax && (
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-gray-400">الضريبة</span>
                        <span className="font-medium text-white">
                          {Number(selectedOrder.tax).toLocaleString()} دج
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-3">
                      <span className="text-xl font-bold text-white">المبلغ الإجمالي</span>
                      <span className="text-3xl font-bold text-gold">
                        {Number(selectedOrder.total).toLocaleString()} دج
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {selectedOrder.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'PROCESSING')}
                      loading={updatingStatus === selectedOrder.id}
                      fullWidth
                    >
                      <Truck size={18} className="ml-2" />
                      بدء المعالجة
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'PROCESSING' && (
                    <Button
                      variant="success"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'DELIVERED')}
                      loading={updatingStatus === selectedOrder.id}
                      fullWidth
                    >
                      <CheckCircle size={18} className="ml-2" />
                      تأكيد التسليم
                    </Button>
                  )}
                  
                  <Button
                    variant="secondary"
                    onClick={() => handlePrintInvoice(selectedOrder)}
                    loading={printLoading}
                    fullWidth
                  >
                    <Printer size={18} className="ml-2" />
                    طباعة الفاتورة
                  </Button>
                  
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(selectedOrder.id)}
                    fullWidth
                  >
                    <XCircle size={18} className="ml-2" />
                    حذف الطلب
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="bg-[#0a1128] border border-white/10 rounded-xl p-8 max-w-md w-full animate-scale-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
                <p className="text-gray-400">هل أنت متأكد من رغبتك في حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleDeleteOrder(showDeleteConfirm)}
                >
                  <Trash2 size={18} className="ml-2" />
                  حذف الطلب
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <div className="text-sm text-gray-400">
              عرض 1-{filteredOrders.length} من {filteredOrders.length} طلب
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={18} />
              </button>
              <span className="px-4 py-2 bg-gold/10 text-gold rounded-lg font-bold">1</span>
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrders;