import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Order, OrderItem } from '../../types';
import { 
  Search, Filter, Download, Eye, Edit, CheckCircle, XCircle,
  Package, Truck, Home, MapPin, Phone, Mail, Calendar,
  DollarSign, User, RefreshCw, AlertTriangle, CheckSquare,
  Square, MoreHorizontal, FileText, MessageSquare, Clock
} from 'lucide-react';

interface OrderManagementProps {
  onOrderUpdate?: () => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ onOrderUpdate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('30');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterDateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*');
      
      if (searchTerm) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      if (filterDateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filterDateRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      fetchOrders();
      onOrderUpdate?.();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('خطأ في تحديث حالة الطلب');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .in('id', selectedOrders);
      
      if (error) throw error;
      
      setSelectedOrders([]);
      fetchOrders();
      onOrderUpdate?.();
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      alert('خطأ في تحديث الطلبات');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const exportOrders = () => {
    const filteredOrders = orders.filter(order => 
      selectedOrders.length === 0 || selectedOrders.includes(order.id)
    );
    
    const csv = [
      ['رقم الطلب', 'العميل', 'البريد الإلكتروني', 'الهاتف', 'المبلغ', 'الحالة', 'التاريخ', 'طريقة التوصيل', 'العنوان'],
      ...filteredOrders.map(order => [
        order.id,
        order.customer_name,
        order.email || '',
        order.phone,
        order.total.toString(),
        order.status,
        new Date(order.created_at).toLocaleDateString('ar-DZ'),
        order.delivery_method === 'stop_desk' ? 'نقطة التوقف' : 'توصيل للمنزل',
        `${order.wilaya}, ${order.municipality}, ${order.shipping_address || ''}`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'PENDING': { label: 'في الانتظار', color: 'yellow', icon: Clock },
      'CONFIRMED': { label: 'مؤكد', color: 'blue', icon: CheckSquare },
      'SHIPPED': { label: 'تم الشحن', color: 'purple', icon: Truck },
      'DELIVERED': { label: 'تم التوصيل', color: 'green', icon: CheckCircle },
      'CANCELLED': { label: 'ملغي', color: 'red', icon: XCircle }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'gray', icon: Clock };
  };

  const getDeliveryIcon = (method: string) => {
    return method === 'stop_desk' ? Package : Home;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         order.phone.includes(searchTerm);
    return matchesSearch;
  });

  const totalRevenue = filteredOrders.reduce((acc, order) => 
    order.status !== 'CANCELLED' ? acc + order.total : acc, 0
  );

  const statusCounts = {
    PENDING: filteredOrders.filter(o => o.status === 'PENDING').length,
    CONFIRMED: filteredOrders.filter(o => o.status === 'CONFIRMED').length,
    SHIPPED: filteredOrders.filter(o => o.status === 'SHIPPED').length,
    DELIVERED: filteredOrders.filter(o => o.status === 'DELIVERED').length,
    CANCELLED: filteredOrders.filter(o => o.status === 'CANCELLED').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة الطلبات</h2>
          <p className="text-gray-400 text-sm mt-1">مراقبة وإدارة طلبات العملاء</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={exportOrders}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-500 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> تصدير Excel
          </button>
          
          <button 
            onClick={fetchOrders}
            className="bg-dark-700/50 hover:bg-dark-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-dark-700/50 backdrop-blur p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">إجمالي الإيرادات</span>
            <DollarSign className="w-4 h-4 text-gold-500" />
          </div>
          <p className="text-xl font-bold text-white">{totalRevenue.toLocaleString()} د.ج</p>
          <p className="text-xs text-gray-500 mt-1">من {filteredOrders.length} طلب</p>
        </div>
        
        {Object.entries(statusCounts).map(([status, count]) => {
          const statusInfo = getStatusInfo(status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={status} className="bg-dark-700/50 backdrop-blur p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{statusInfo.label}</span>
                <StatusIcon className={`w-4 h-4 text-${statusInfo.color}-500`} />
              </div>
              <p className="text-xl font-bold text-white">{count}</p>
              <p className="text-xs text-gray-500 mt-1">طلب</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-dark-700/50 p-4 rounded-xl border border-white/5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="بحث عن طلب، عميل، بريد إلكتروني، هاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
          >
            <option value="all">كل الحالات</option>
            <option value="PENDING">في الانتظار</option>
            <option value="CONFIRMED">مؤكد</option>
            <option value="SHIPPED">تم الشحن</option>
            <option value="DELIVERED">تم التوصيل</option>
            <option value="CANCELLED">ملغي</option>
          </select>
          
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="bg-dark-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
          >
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوم</option>
            <option value="90">آخر 90 يوم</option>
            <option value="all">كل الوقت</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gold-500 font-medium">
              تم تحديد {selectedOrders.length} طلب
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusUpdate('CONFIRMED')}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              تأكيد الكل
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('SHIPPED')}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              شحن الكل
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('DELIVERED')}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              توصيل الكل
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('CANCELLED')}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              إلغاء الكل
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-12 h-12 text-gold-500 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-dark-700/30 rounded-xl border border-white/5">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
          <p className="text-gray-400 text-lg">لا توجد طلبات</p>
          <p className="text-gray-500 text-sm mt-2">لم يتم العثور على طلبات تطابق معايير البحث</p>
        </div>
      ) : (
        <div className="bg-dark-700/30 rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-900/50 text-gray-400 font-medium uppercase text-xs tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4 text-right">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(filteredOrders.map(o => o.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-dark-900/50 text-gold-500 focus:ring-gold-500 focus:ring-offset-0"
                    />
                  </th>
                  <th className="p-4 text-right">رقم الطلب</th>
                  <th className="p-4 text-right">العميل</th>
                  <th className="p-4 text-right">المبلغ</th>
                  <th className="p-4 text-right">الحالة</th>
                  <th className="p-4 text-right">التوصيل</th>
                  <th className="p-4 text-right">التاريخ</th>
                  <th className="p-4 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map(order => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  const DeliveryIcon = getDeliveryIcon(order.delivery_method);
                  
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders([...selectedOrders, order.id]);
                            } else {
                              setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-white/20 bg-dark-900/50 text-gold-500 focus:ring-gold-500 focus:ring-offset-0"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-gold-500 font-medium text-sm">{order.id}</div>
                        <div className="text-gray-500 text-xs mt-1">{order.items.length} عناصر</div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{order.customer_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <p className="text-xs text-gray-500">{order.phone}</p>
                          </div>
                          {order.email && (
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="w-3 h-3 text-gray-500" />
                              <p className="text-xs text-gray-500">{order.email}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{order.total.toLocaleString()} د.ج</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-${statusInfo.color}-500/10 text-${statusInfo.color}-500 border-${statusInfo.color}-500/20`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DeliveryIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-400">
                            {order.delivery_method === 'stop_desk' ? 'نقطة التوقف' : 'توصيل للمنزل'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-400 text-sm">
                          {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="p-2 bg-dark-900 border border-white/10 rounded-lg hover:border-blue-400 hover:text-blue-400 text-gray-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              disabled={isUpdatingStatus}
                              className="bg-dark-900 border border-white/10 rounded-md py-1.5 pl-3 pr-8 text-xs text-white outline-none appearance-none cursor-pointer hover:border-gold-500 focus:border-gold-500 transition-colors disabled:opacity-50"
                            >
                              <option value="PENDING">في الانتظار</option>
                              <option value="CONFIRMED">مؤكد</option>
                              <option value="SHIPPED">تم الشحن</option>
                              <option value="DELIVERED">تم التوصيل</option>
                              <option value="CANCELLED">ملغي</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)} />
          <div className="bg-dark-800 w-full max-w-4xl rounded-xl border border-white/10 max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-700/50">
              <div>
                <h2 className="text-xl text-white font-serif font-bold">تفاصيل الطلب</h2>
                <p className="text-xs text-gray-400 mt-1">رقم الطلب: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Customer Information */}
              <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gold-500" />
                  معلومات العميل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">الاسم</p>
                    <p className="text-white font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">الهاتف</p>
                    <p className="text-white font-medium">{selectedOrder.phone}</p>
                  </div>
                  {selectedOrder.email && (
                    <div>
                      <p className="text-sm text-gray-400">البريد الإلكتروني</p>
                      <p className="text-white font-medium">{selectedOrder.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gold-500" />
                  معلومات التوصيل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">الولاية</p>
                    <p className="text-white font-medium">{selectedOrder.wilaya}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">البلدية</p>
                    <p className="text-white font-medium">{selectedOrder.municipality}</p>
                  </div>
                  {selectedOrder.shipping_address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-400">العنوان التفصيلي</p>
                      <p className="text-white font-medium">{selectedOrder.shipping_address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400">طريقة التوصيل</p>
                    <p className="text-white font-medium">
                      {selectedOrder.delivery_method === 'stop_desk' ? 'نقطة التوقف' : 'توصيل للمنزل'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gold-500" />
                  عناصر الطلب
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-dark-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-dark-700 rounded-lg border border-white/10 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-400 text-sm">الكمية: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-gold-500 font-bold">{item.price.toLocaleString()} د.ج</p>
                        <p className="text-gray-400 text-sm">{(item.price * item.quantity).toLocaleString()} د.ج</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                <h3 className="text-lg font-medium text-white mb-4">ملخص الطلب</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">تاريخ الطلب</span>
                    <span className="text-white">{new Date(selectedOrder.created_at).toLocaleDateString('ar-DZ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">الحالة</span>
                    <span className={`text-${getStatusInfo(selectedOrder.status).color}-500 font-medium`}>
                      {getStatusInfo(selectedOrder.status).label}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">الإجمالي</span>
                      <span className="text-gold-500 font-bold text-lg">{selectedOrder.total.toLocaleString()} د.ج</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
